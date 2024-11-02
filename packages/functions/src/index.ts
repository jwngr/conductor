import FirecrawlApp from '@mendable/firecrawl-js';
import admin from 'firebase-admin';
// TODO: Switch to using the Functions logger.
// import logger from 'firebase-functions/logger';
import {defineString} from 'firebase-functions/params';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants';

import {FeedItem, FeedItemId, FeedItemType} from '@shared/types/feedItems';
import {ImportQueueItem} from '@shared/types/importQueue';
import {SystemTagId} from '@shared/types/tags';

// Environment variables.
const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');

admin.initializeApp();

let firecrawlApp: FirecrawlApp;
onInit(() => {
  firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});
});

const firestore = admin.firestore();

const bucket = admin.storage().bucket();

// TODO: Make this idempotent given the "at least once" guarantee.
export const processImportQueue = onDocumentCreated(
  `/${IMPORT_QUEUE_DB_COLLECTION}/{pushId}`,
  async (event) => {
    const {pushId} = event.params;
    console.log(`Processing item ${pushId}`);

    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with import queue event');
      return;
    }

    // TODO: Properly validate the import item schema.
    const importItem = snapshot.data() as ImportQueueItem;

    try {
      console.log(`Processing import queue item ${pushId}...`, {
        url: importItem.url,
        importQueueId: pushId,
        feedItemId: importItem.feedItemId,
      });

      console.log(`Fetching data from ${importItem.url}...`);

      // Fetch in parallel.
      const [rawHtml, firecrawlResult] = await Promise.all([
        fetchRawHtml(importItem.url),
        fetchFirecrawlData(importItem.url),
      ]);

      console.log(`Storing fetched data in feed item ${importItem.feedItemId}...`);

      // Save in parallel.
      await Promise.all([
        saveRawHtmlToStorage(importItem.feedItemId, rawHtml),
        saveMarkdownToStorage(importItem.feedItemId, firecrawlResult.markdown),
        updateImportedFeedItemInFirestore(importItem.feedItemId, {
          links: firecrawlResult.links,
          title: firecrawlResult.title,
          description: firecrawlResult.description,
        }),
      ]);

      // Remove the processed item from the queue, waiting until the previous item is processed.
      // TODO: Should this be done in a transaction?
      console.log(`Removing import queue item ${pushId}...`);
      await firestore.collection(IMPORT_QUEUE_DB_COLLECTION).doc(pushId).delete();

      console.log(`Successfully processed import queue item ${pushId}`);
    } catch (error) {
      console.error(`Error processing import queue item ${pushId}:`, error);
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

    // TODO: delete this at some point.
    // return {
    //   title: 'Test title for ' + url,
    //   description: 'Test description for ' + url,
    //   markdown: 'Test Markdown for ' + url,
    //   links: ['https://www.testing.com', 'https://www.testing2.com'],
    // };
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
  const rawHtmlFile = bucket.file(`${FEED_ITEMS_STORAGE_COLLECTION}/${feedItemId}/raw.html`);
  await rawHtmlFile.save(rawHtml, {contentType: 'text/html'});
};

const saveMarkdownToStorage = async (
  feedItemId: FeedItemId,
  markdown: string | null
): Promise<void> => {
  if (markdown === null) return;
  const llmContextFile = bucket.file(
    `${FEED_ITEMS_STORAGE_COLLECTION}/${feedItemId}/llmContext.md`
  );
  await llmContextFile.save(markdown, {contentType: 'text/markdown'});
};

interface UpdateImportedFeedItemInFirestoreArgs {
  readonly links: string[] | null;
  readonly title: string | null;
  readonly description: string | null;
}

const updateImportedFeedItemInFirestore = async (
  feedItemId: FeedItemId,
  {links, title, description}: UpdateImportedFeedItemInFirestoreArgs
): Promise<void> => {
  const update: Omit<
    FeedItem,
    'itemId' | 'source' | 'url' | 'createdTime' | 'triageStatus' | 'tagIds'
  > = {
    // TODO: Determine the type based on the URL or fetched content.
    type: FeedItemType.Website,
    // TODO: Reconsider how to handle empty titles, descriptions, and links.
    title: title ?? '',
    description: description ?? '',
    outgoingLinks: links ?? [],
    lastImportedTime: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedTime: admin.firestore.FieldValue.serverTimestamp(),
  };

  const itemDoc = firestore.doc(`${FEED_ITEMS_DB_COLLECTION}/${feedItemId}`);
  await itemDoc.update({
    ...update,
    // TODO: Consider using a Firestore converter to handle this. Ideally this would be part of the
    // object above.
    // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
    [`tagIds.${SystemTagId.Importing}`]: admin.firestore.FieldValue.delete(),
  });
};
