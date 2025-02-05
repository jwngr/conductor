import {FieldValue} from 'firebase-admin/firestore';

import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemType} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemFromStorage, FeedItemId} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult} from '@shared/types/result.types';
import {SystemTagId} from '@shared/types/tags.types';

import {storage} from '@sharedServer/services/firebase.server';
import {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

interface UpdateImportedFeedItemInFirestoreArgs {
  readonly links: string[] | null;
  readonly title: string | null;
  readonly description: string | null;
}

type FeedItemCollectionService = ServerFirestoreCollectionService<
  FeedItemId,
  FeedItem,
  FeedItemFromStorage
>;

export class ServerFeedItemsService {
  private readonly storageCollectionPath: string;
  private readonly feedItemsCollectionService: FeedItemCollectionService;
  // TODO: `storageBucket` should probably be passed in via the constructor, but there is no type
  // for it from the Firebase Admin SDK. We could use a type from @google-cloud/storage instead, but
  // we currently don't list that as a dependency.
  // private readonly storageBucket: Bucket;

  constructor(args: {
    readonly storageCollectionPath: string;
    readonly feedItemsCollectionService: FeedItemCollectionService;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.feedItemsCollectionService = args.feedItemsCollectionService;
  }

  /**
   * Updates a feed item after it has been imported.
   */
  public async updateImportedFeedItemInFirestore(
    feedItemId: FeedItemId,
    {links, title, description}: UpdateImportedFeedItemInFirestoreArgs
  ): AsyncResult<void> {
    // TODO: Consider switching to array unions so I can use FieldValue.arrayRemove.
    const untypedUpdates = {
      [`tagIds.${SystemTagId.Importing}`]: FieldValue.delete(),
    };

    const updateResult = await this.feedItemsCollectionService.updateDoc(feedItemId, {
      // TODO: Determine the type based on the URL or fetched content.
      type: FeedItemType.Website,
      // TODO: Reconsider how to handle empty titles, descriptions, and links.
      title: title ?? '',
      description: description ?? '',
      outgoingLinks: links ?? [],
      // TODO(timestamps): Use server timestamps instead.
      lastImportedTime: new Date(),
      ...untypedUpdates,
    });
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }

  /**
   * Saves the raw HTML to storage.
   */
  public async saveRawHtmlToStorage(args: {
    readonly feedItemId: FeedItemId;
    readonly rawHtml: string;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {feedItemId, rawHtml, accountId} = args;
    return await asyncTry(async () => {
      const rawHtmlFile = storage
        .bucket()
        .file(this.getStoragePathForFeedItem(feedItemId, accountId) + 'raw.html');
      await rawHtmlFile.save(rawHtml, {contentType: 'text/html'});
    });
  }

  /**
   * Saves the LLM Markdown context to storage.
   */
  public async saveMarkdownToStorage(args: {
    readonly feedItemId: FeedItemId;
    readonly markdown: string | null;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {feedItemId, markdown, accountId} = args;
    if (markdown === null) {
      return makeErrorResult(new Error('Markdown is null'));
    }

    return await asyncTry(async () => {
      const llmContextFile = storage
        .bucket()
        .file(this.getStoragePathForFeedItem(feedItemId, accountId) + 'llmContext.md');
      await llmContextFile.save(markdown, {contentType: 'text/markdown'});
    });
  }

  /**
   * Permanently deletes all feed items associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void> {
    // Fetch the IDs for all of the account's feed items.
    const query = this.feedItemsCollectionService
      .getCollectionRef()
      .where('accountId', '==', accountId);
    const queryResult = await this.feedItemsCollectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(queryResult, 'Error fetching feed items to delete for account');
    }

    // Delete all of the account's feed items.
    const docIdsToDelete = queryResult.value;
    return await this.feedItemsCollectionService.batchDeleteDocs(docIdsToDelete);
  }

  /**
   * Permanently deletes all storage files associated with an account.
   */
  public async deleteStorageFilesForAccount(accountId: AccountId): AsyncResult<void> {
    return await asyncTry(async () =>
      storage.bucket().deleteFiles({
        prefix: this.getStoragePathForAccount(accountId),
      })
    );
  }

  private getStoragePathForAccount(accountId: AccountId): string {
    return `${this.storageCollectionPath}/${accountId}/`;
  }

  private getStoragePathForFeedItem(feedItemId: FeedItemId, accountId: AccountId): string {
    return `${this.getStoragePathForAccount(accountId)}${feedItemId}/`;
  }
}
