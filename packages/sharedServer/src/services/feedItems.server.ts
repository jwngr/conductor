import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {assertNever, omitUndefined} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemType} from '@shared/types/feedItems.types';
import type {
  FeedItem,
  FeedItemFromStorage,
  FeedItemId,
  FeedItemSource,
} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Func} from '@shared/types/utils.types';

import {eventLogService} from '@sharedServer/services/eventLog.server';
import {storage} from '@sharedServer/services/firebase.server';
import type {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

import {WebsiteFeedItemImporter} from '@sharedServer/importers/website.import';
import {XkcdFeedItemImporter} from '@sharedServer/importers/xkcd.import';
import {YouTubeFeedItemImporter} from '@sharedServer/importers/youtube.import';

type FeedItemCollectionService = ServerFirestoreCollectionService<
  FeedItemId,
  FeedItem,
  FeedItemFromStorage
>;

interface WriteFileToStorageArgs {
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly filename: string;
  readonly content: string;
  readonly contentType: string;
}

export type WriteFileToStorageFn = Func<WriteFileToStorageArgs, AsyncResult<void>>;

export type UpdateFeedItemFn = (
  feedItemId: FeedItemId,
  updates: Partial<FeedItem>
) => AsyncResult<void>;

export class ServerFeedItemsService {
  private readonly storageCollectionPath: string;
  private readonly firecrawlService: ServerFirecrawlService;
  private readonly feedItemsCollectionService: FeedItemCollectionService;

  constructor(args: {
    readonly storageCollectionPath: string;
    readonly firecrawlService: ServerFirecrawlService;
    readonly feedItemsCollectionService: FeedItemCollectionService;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.firecrawlService = args.firecrawlService;
    this.feedItemsCollectionService = args.feedItemsCollectionService;
  }

  public async createFeedItem(args: {
    readonly url: string;
    readonly feedItemSource: FeedItemSource;
    readonly accountId: AccountId;
    readonly title: string;
    readonly description: string | null;
  }): AsyncResult<FeedItemId | null> {
    const {url, accountId, feedItemSource, title, description} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    const feedItemResult = SharedFeedItemHelpers.makeFeedItem({
      url: trimmedUrl,
      feedItemSource,
      accountId,
      title,
      description,
    });
    if (!feedItemResult.success) return feedItemResult;
    const feedItem = feedItemResult.value;

    const addFeedItemResult = await this.feedItemsCollectionService.setDoc(
      feedItem.feedItemId,
      feedItem
    );

    if (!addFeedItemResult.success) {
      return prefixErrorResult(addFeedItemResult, 'Error creating feed item in Firestore');
    }

    return makeSuccessResult(feedItem.feedItemId);
  }

  /**
   * Updates a feed item in Firestore.
   */
  public async updateFeedItem(
    feedItemId: FeedItemId,
    updates: Partial<FeedItem>
  ): AsyncResult<void> {
    const updateResult = await this.feedItemsCollectionService.updateDoc(
      feedItemId,
      omitUndefined(updates)
    );
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }

  /**
   * Writes content to storage file.
   */
  private async writeFileToStorage(args: WriteFileToStorageArgs): AsyncResult<void> {
    const {feedItemId, content, accountId, filename, contentType} = args;
    const storagePath = this.getStoragePath({feedItemId, accountId, filename});
    return await asyncTry(async () => {
      const file = storage.bucket().file(storagePath);
      await file.save(content, {contentType});
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

  private getStoragePath(args: {
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
    readonly filename: string;
  }): string {
    const {feedItemId, accountId, filename} = args;
    const accountPath = this.getStoragePathForAccount(accountId);
    return `${accountPath}${feedItemId}/${filename}`;
  }

  public async importFeedItem(feedItem: FeedItem): AsyncResult<void> {
    const isSafeUrlResult = SharedFeedItemHelpers.validateUrl(feedItem.url);
    if (!isSafeUrlResult.success) {
      return prefixErrorResult(isSafeUrlResult, 'Error validating feed item URL');
    }

    switch (feedItem.type) {
      case FeedItemType.YouTube: {
        const importer = new YouTubeFeedItemImporter({
          writeFileToStorage: this.writeFileToStorage,
        });
        await importer.import(feedItem);
        break;
      }
      case FeedItemType.Article:
      case FeedItemType.Tweet:
      case FeedItemType.Video:
      case FeedItemType.Website: {
        const importer = new WebsiteFeedItemImporter({
          updateFeedItem: this.updateFeedItem,
          writeFileToStorage: this.writeFileToStorage,
          firecrawlService: this.firecrawlService,
        });
        await importer.import(feedItem);
        break;
      }
      case FeedItemType.Xkcd: {
        const importer = new XkcdFeedItemImporter({
          updateFeedItem: this.updateFeedItem,
        });
        await importer.import(feedItem);
        break;
      }
      default:
        assertNever(feedItem);
    }

    void eventLogService.logFeedItemImportedEvent({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
    });

    return makeSuccessResult(undefined);
  }
}
