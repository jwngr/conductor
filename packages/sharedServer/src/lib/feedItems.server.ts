import {DocumentSnapshot} from 'firebase-admin/firestore';

import {FEED_ITEMS_DB_COLLECTION, FEED_ITEMS_STORAGE_COLLECTION} from '@shared/lib/constants';
import {asyncTry} from '@shared/lib/errors';

import {FeedItem, FeedItemId, FeedItemType} from '@shared/types/feedItems.types';
import {AsyncResult, makeErrorResult} from '@shared/types/result.types';
import {SystemTagId} from '@shared/types/tags.types';
import {UserId} from '@shared/types/user.types';

import {
  batchDeleteFirestoreDocuments,
  FieldValue,
  firestore,
  getFirestoreQuerySnapshot,
  storageBucket,
  updateFirestoreDoc,
} from '@sharedServer/lib/firebase.server';

// TODO: Convert this to a class / service.

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
): AsyncResult<void> {
  return await asyncTry<undefined>(async () => {
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

    // TODO: Fix the type here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateFirestoreDoc<any>(itemDoc, {
      ...update,
      // TODO: Consider using a Firestore converter to handle this. Ideally this would be part of the
      // object above.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      [`tagIds.${SystemTagId.Importing}`]: FieldValue.delete(),
    });
  });
}

/**
 * Permanently deletes all feed items associated with a user.
 */
export async function deleteFeedItemDocsForUsers(userId: UserId): AsyncResult<void> {
  // TOOD: Figure out why Firebase Admin SDK types are not working.
  const userFeedItemDocsResult = await getFirestoreQuerySnapshot(
    firestore.collection(FEED_ITEMS_DB_COLLECTION).where('userId', '==', userId)
  );

  if (!userFeedItemDocsResult.success) return userFeedItemDocsResult;
  const userFeedItemDocs = userFeedItemDocsResult.value;

  return await batchDeleteFirestoreDocuments(
    userFeedItemDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
  );
}

/**
 * Saves the raw HTML to storage.
 */
export async function saveRawHtmlToStorage(args: {
  readonly feedItemId: FeedItemId;
  readonly rawHtml: string;
  readonly userId: UserId;
}): AsyncResult<void> {
  const {feedItemId, rawHtml, userId} = args;
  return await asyncTry<undefined>(async () => {
    const rawHtmlFile = storageBucket.file(
      `${FEED_ITEMS_STORAGE_COLLECTION}/${userId}/${feedItemId}/raw.html`
    );
    await rawHtmlFile.save(rawHtml, {contentType: 'text/html'});
  });
}

/**
 * Saves the LLM Markdown context to storage.
 */
export async function saveMarkdownToStorage(args: {
  readonly feedItemId: FeedItemId;
  readonly markdown: string | null;
  readonly userId: UserId;
}): AsyncResult<void> {
  const {feedItemId, markdown, userId} = args;
  if (markdown === null) {
    return makeErrorResult(new Error('Markdown is null'));
  }

  return await asyncTry<undefined>(async () => {
    const llmContextFile = storageBucket.file(
      `${FEED_ITEMS_STORAGE_COLLECTION}/${userId}/${feedItemId}/llmContext.md`
    );
    await llmContextFile.save(markdown, {contentType: 'text/markdown'});
  });
}

/**
 * Permanently deletes all storage files associated with a user.
 */
export async function deleteStorageFilesForUser(userId: UserId): AsyncResult<void> {
  return await asyncTry<undefined>(async () => {
    await storageBucket.deleteFiles({prefix: `${FEED_ITEMS_STORAGE_COLLECTION}/${userId}/`});
  });
}
