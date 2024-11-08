import {FEED_ITEMS_DB_COLLECTION, FEED_ITEMS_STORAGE_COLLECTION} from '@shared/lib/constants';

import {FeedItem, FeedItemId, FeedItemType} from '@shared/types/feedItems.types';
import {SystemTagId} from '@shared/types/tags.types';
import {UserId} from '@shared/types/user.types';

import {FieldValue, firestore, storageBucket} from '@src/lib/firebaseAdmin';

import {batchDeleteFirestoreDocuments} from './batch';

interface UpdateImportedFeedItemInFirestoreArgs {
  readonly links: string[] | null;
  readonly title: string | null;
  readonly description: string | null;
}

/**
 * Updates a feed item after it has been imported.
 */
export async function updateImportedFeedItemInFirestore(
  feedItemId: FeedItemId,
  {links, title, description}: UpdateImportedFeedItemInFirestoreArgs
): Promise<void> {
  const update: Omit<
    FeedItem,
    'feedItemId' | 'userId' | 'source' | 'url' | 'createdTime' | 'triageStatus' | 'tagIds'
  > = {
    // TODO: Determine the type based on the URL or fetched content.
    type: FeedItemType.Website,
    // TODO: Reconsider how to handle empty titles, descriptions, and links.
    title: title ?? '',
    description: description ?? '',
    outgoingLinks: links ?? [],
    lastImportedTime: FieldValue.serverTimestamp(),
    lastUpdatedTime: FieldValue.serverTimestamp(),
  };

  const itemDoc = firestore.doc(`${FEED_ITEMS_DB_COLLECTION}/${feedItemId}`);
  await itemDoc.update({
    ...update,
    // TODO: Consider using a Firestore converter to handle this. Ideally this would be part of the
    // object above.
    // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
    [`tagIds.${SystemTagId.Importing}`]: FieldValue.delete(),
  });
}

/**
 * Hard-deletes all feed items associated with a user.
 */
export async function deleteFeedItemDocsForUsers(userId: UserId): Promise<void> {
  const userFeedItemDocs = await firestore
    .collection(FEED_ITEMS_DB_COLLECTION)
    .where('userId', '==', userId)
    .get();

  await batchDeleteFirestoreDocuments(userFeedItemDocs.docs.map((doc) => doc.ref));
}

/**
 * Saves the raw HTML to storage.
 */
export async function saveRawHtmlToStorage({
  feedItemId,
  rawHtml,
  userId,
}: {
  readonly feedItemId: FeedItemId;
  readonly rawHtml: string | null;
  readonly userId: UserId;
}): Promise<void> {
  if (rawHtml === null) return;
  const rawHtmlFile = storageBucket.file(
    `${FEED_ITEMS_STORAGE_COLLECTION}/${userId}/${feedItemId}/raw.html`
  );
  await rawHtmlFile.save(rawHtml, {contentType: 'text/html'});
}

/**
 * Saves the LLM Markdown context to storage.
 */
export async function saveMarkdownToStorage({
  feedItemId,
  markdown,
  userId,
}: {
  readonly feedItemId: FeedItemId;
  readonly markdown: string | null;
  readonly userId: UserId;
}): Promise<void> {
  if (markdown === null) return;
  const llmContextFile = storageBucket.file(
    `${FEED_ITEMS_STORAGE_COLLECTION}/${userId}/${feedItemId}/llmContext.md`
  );
  await llmContextFile.save(markdown, {contentType: 'text/markdown'});
}

/**
 * Hard-deletes all storage files associated with a user.
 */
export async function deleteStorageFilesForUser(userId: UserId): Promise<void> {
  await storageBucket.deleteFiles({prefix: `${FEED_ITEMS_STORAGE_COLLECTION}/${userId}/`});
}
