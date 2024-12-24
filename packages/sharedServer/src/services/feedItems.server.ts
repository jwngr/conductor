import type {CollectionReference, DocumentSnapshot} from 'firebase-admin/firestore';
import {FieldValue} from 'firebase-admin/firestore';

import {asyncTry} from '@shared/lib/errors';

import {FeedItemType} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult} from '@shared/types/result.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {UserId} from '@shared/types/user.types';

import {
  batchDeleteFirestoreDocuments,
  getFirestoreQuerySnapshot,
  storageBucket,
  updateFirestoreDoc,
} from '@sharedServer/lib/firebase.server';

interface UpdateImportedFeedItemInFirestoreArgs {
  readonly links: string[] | null;
  readonly title: string | null;
  readonly description: string | null;
}

export class ServerFeedItemsService {
  private readonly storageCollectionPath: string;
  private readonly feedItemsDbRef: CollectionReference;
  // TODO: `storageBucket` should probably be passed in via the constructor, but there is no type
  // for it from the Firebase Admin SDK. We could use a type from @google-cloud/storage instead, but
  // we currently don't list that as a dependency.
  // private readonly storageBucket: Bucket;

  constructor(args: {
    readonly storageCollectionPath: string;
    readonly feedItemsDbRef: CollectionReference;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.feedItemsDbRef = args.feedItemsDbRef;
  }

  /**
   * Updates a feed item after it has been imported.
   */
  public async updateImportedFeedItemInFirestore(
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

      const itemDoc = this.feedItemsDbRef.doc(feedItemId);

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
   * Saves the raw HTML to storage.
   */
  public async saveRawHtmlToStorage(args: {
    readonly feedItemId: FeedItemId;
    readonly rawHtml: string;
    readonly userId: UserId;
  }): AsyncResult<void> {
    const {feedItemId, rawHtml, userId} = args;
    return await asyncTry<undefined>(async () => {
      const rawHtmlFile = storageBucket.file(
        this.getStoragePathForFeedItem(feedItemId, userId) + 'raw.html'
      );
      await rawHtmlFile.save(rawHtml, {contentType: 'text/html'});
    });
  }

  /**
   * Saves the LLM Markdown context to storage.
   */
  public async saveMarkdownToStorage(args: {
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
        this.getStoragePathForFeedItem(feedItemId, userId) + 'llmContext.md'
      );
      await llmContextFile.save(markdown, {contentType: 'text/markdown'});
    });
  }

  /**
   * Permanently deletes all feed items associated with a user.
   */
  public async deleteAllForUser(userId: UserId): AsyncResult<void> {
    // TOOD: Figure out why Firebase Admin SDK types are not working.
    const userFeedItemDocsResult = await getFirestoreQuerySnapshot(
      this.feedItemsDbRef.where('userId', '==', userId)
    );

    if (!userFeedItemDocsResult.success) return userFeedItemDocsResult;
    const userFeedItemDocs = userFeedItemDocsResult.value;

    return await batchDeleteFirestoreDocuments(
      userFeedItemDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
    );
  }

  /**
   * Permanently deletes all storage files associated with a user.
   */
  public async deleteStorageFilesForUser(userId: UserId): AsyncResult<void> {
    return await asyncTry<undefined>(async () => {
      await storageBucket.deleteFiles({
        prefix: this.getStoragePathForUser(userId),
      });
    });
  }

  private getStoragePathForUser(userId: UserId): string {
    return `${this.storageCollectionPath}/${userId}/`;
  }

  private getStoragePathForFeedItem(feedItemId: FeedItemId, userId: UserId): string {
    return `${this.getStoragePathForUser(userId)}${feedItemId}/`;
  }
}
