import FireCrawlApp from '@mendable/firecrawl-js';
import {FeedItem, FeedItemId, ImportQueueItem} from '@shared/types';
import admin from 'firebase-admin';
import logger from 'firebase-functions/logger';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

// TODO: Use constants from shared package.
const FEED_ITEM_COLLECTION = 'feedItems';
const IMPORT_QUEUE_COLLECTION = 'importQueue';

admin.initializeApp();

const firecrawlApp = new FireCrawlApp({apiKey: FIRECRAWL_API_KEY});

const firestore = admin.firestore();

const bucket = admin.storage().bucket();

// TODO: Make this idempotent given the "at least once" guarantee.
export const processImportQueue = onDocumentCreated(
  `/${IMPORT_QUEUE_COLLECTION}/{pushId}`,
  async (event) => {
    const {pushId} = event.params;
    logger.log(`Processing item ${pushId}`);

    const snapshot = event.data;
    if (!snapshot) {
      logger.log('No data associated with import queue event');
      return;
    }

    // TODO: Properly validate the import item schema.
    const importItem = snapshot.data() as ImportQueueItem;

    try {
      logger.log(`Processing import queue item ${pushId}...`, {
        url: importItem.url,
        importQueueId: pushId,
        feedItemId: importItem.feedItemId,
      });

      logger.log(`Fetching data from ${importItem.url}...`);

      // Fetch in parallel.
      const [rawHtml, firecrawlResult] = await Promise.all([
        fetchRawHtml(importItem.url),
        fetchFirecrawlData(importItem.url),
      ]);

      logger.log(`Storing fetched data in feed item ${importItem.feedItemId}...`);

      // Save in parallel.
      await Promise.all([
        saveRawHtmlToStorage(importItem.feedItemId, rawHtml),
        saveMarkdownToStorage(importItem.feedItemId, firecrawlResult.markdown),
        updateFeedItemInFirestore(importItem.feedItemId, {
          links: firecrawlResult.links,
          title: firecrawlResult.title,
          description: firecrawlResult.description,
        }),
      ]);

      // Remove the processed item from the queue, waiting until the previous item is processed.
      // TODO: Should this be done in a transaction?
      logger.log(`Removing import queue item ${pushId}...`);
      await firestore.collection(IMPORT_QUEUE_COLLECTION).doc(pushId).delete();

      logger.log(`Successfully processed import queue item ${pushId}`);
    } catch (error) {
      logger.error(`Error processing import queue item ${pushId}:`, error);
      // TODO: Move failed item to a separate "failed" queue.
    }
  }
);

// TODO: Extend the functionality here:
// 1. Handle more than just HTML.
// 2. Extract a canonical URL (resolving redirects and removing tracking parameters).
// 3. Handle images more gracefully (download and replace links in the HTML?).
async function fetchRawHtml(url: string): Promise<string | null> {
  try {
    const rawHtmlResponse = await fetch(url);
    return rawHtmlResponse.text();
  } catch (error) {
    // Report the failure, but allow the import to continue.
    console.error(`Error fetching raw HTML:`, error);
    return null;
  }
}

interface ParsedFirecrawlData {
  readonly title: string | null;
  readonly description: string | null;
  readonly markdown: string | null;
  readonly links: string[] | null;
}

// Firecrawl is used for:
// 1. Markdown-formatted content for LLM prompt consumption (store in Cloud Storage).
// 2. Outgoing links referenced by the content (stored in Firestore).
async function fetchFirecrawlData(url: string): Promise<ParsedFirecrawlData> {
  try {
    const firecrawlResult = await firecrawlApp.scrapeUrl(url, {
      formats: ['markdown', 'links'],
      waitFor: 1000,
    });

    if (!firecrawlResult.success) {
      throw new Error(firecrawlResult.error);
    }

    // Some fields should always be present. Report them, but still allow the import to continue.
    if (!firecrawlResult.markdown) {
      console.error('No markdown found in Firecrawl result');
    }
    if (!firecrawlResult.links) {
      console.error('No links found in Firecrawl result');
    }

    return {
      title: firecrawlResult.metadata?.title ?? null,
      description: firecrawlResult.metadata?.description ?? null,
      // TODO: Process other metadata (e.g. keywords).
      markdown: firecrawlResult.markdown ?? null,
      links: firecrawlResult.links ?? null,
    };
  } catch (error) {
    // Report the failure, but allow the import to continue.
    console.error(`Error fetching Firecrawl data:`, error);
    return {title: null, description: null, markdown: null, links: null};
  }
}

const saveRawHtmlToStorage = async (
  feedItemId: FeedItemId,
  rawHtml: string | null
): Promise<void> => {
  if (rawHtml === null) return;
  const rawHtmlFile = bucket.file(`${FEED_ITEM_COLLECTION}/${feedItemId}/raw.html`);
  await rawHtmlFile.save(rawHtml, {contentType: 'text/html'});
};

const saveMarkdownToStorage = async (
  feedItemId: FeedItemId,
  markdown: string | null
): Promise<void> => {
  if (markdown === null) return;
  const llmContextFile = bucket.file(`${FEED_ITEM_COLLECTION}/${feedItemId}/llmContext.md`);
  await llmContextFile.save(markdown, {contentType: 'text/markdown'});
};

interface UpdateFeedItemInFirestoreArgs {
  readonly links: string[] | null;
  readonly title: string | null;
  readonly description: string | null;
}

const updateFeedItemInFirestore = async (
  feedItemId: FeedItemId,
  {links, title, description}: UpdateFeedItemInFirestoreArgs
): Promise<void> => {
  if (links === null) return;

  // Update the item with the new import status.
  const update: Partial<FeedItem> = {
    title: title ?? undefined,
    description: description ?? undefined,
    outgoingLinks: links,
    isImporting: false,
    lastImportedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const itemDoc = firestore.doc(`${FEED_ITEM_COLLECTION}/${feedItemId}`);
  await itemDoc.update(update);
};
