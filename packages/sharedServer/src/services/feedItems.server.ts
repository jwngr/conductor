import type {FeedItemFromStorage} from '@conductor/shared/src/schemas/feedItems.schema';

import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeIntervalFeedSource} from '@shared/lib/feedSources.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemType} from '@shared/types/feedItems.types';
import type {
  FeedItem,
  FeedItemId,
  FeedItemWithUrl,
  IntervalFeedItem,
} from '@shared/types/feedItems.types';
import type {AsyncResult, Result} from '@shared/types/results.types';
import type {IntervalUserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import type {ServerEventLogService} from '@sharedServer/services/eventLog.server';
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

export class ServerFeedItemsService {
  private readonly storageCollectionPath: string;
  private readonly firecrawlService: ServerFirecrawlService;
  private readonly eventLogService: ServerEventLogService;
  private readonly feedItemsCollectionService: FeedItemCollectionService;

  constructor(args: {
    readonly storageCollectionPath: string;
    readonly firecrawlService: ServerFirecrawlService;
    readonly eventLogService: ServerEventLogService;
    readonly feedItemsCollectionService: FeedItemCollectionService;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.firecrawlService = args.firecrawlService;
    this.eventLogService = args.eventLogService;
    this.feedItemsCollectionService = args.feedItemsCollectionService;
  }

  public async createFeedItemFromUrl(
    args: Pick<FeedItemWithUrl, 'feedSource' | 'url' | 'accountId' | 'title' | 'description'>
  ): AsyncResult<FeedItemWithUrl> {
    const {feedSource, url, accountId, title, description} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    const feedItemResult = SharedFeedItemHelpers.makeFeedItemFromUrl({
      feedSource,
      url: trimmedUrl,
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

    return makeSuccessResult(feedItem);
  }

  public async createIntervalFeedItem(args: {
    readonly accountId: AccountId;
    readonly userFeedSubscription: IntervalUserFeedSubscription;
  }): AsyncResult<IntervalFeedItem> {
    const {userFeedSubscription, accountId} = args;

    const feedItemResult = SharedFeedItemHelpers.makeIntervalFeedItem({
      feedSource: makeIntervalFeedSource({userFeedSubscription}),
      accountId,
      title: `Interval feed item for ${new Date().toISOString()}`,
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

    return makeSuccessResult(feedItem);
  }

  /**
   * Updates a feed item in Firestore.
   */
  public async updateFeedItem(
    feedItemId: FeedItemId,
    updates: Partial<FeedItem>
  ): AsyncResult<void> {
    const updateResult = await this.feedItemsCollectionService.updateDoc(feedItemId, updates);
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }

  /**
   * Writes content to storage file.
   */
  public async writeFileToStorage(args: {
    readonly storagePath: string;
    readonly content: string;
    readonly contentType: string;
  }): AsyncResult<void> {
    const {storagePath, content, contentType} = args;
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

  public getStoragePath(args: {
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
    readonly filename: string;
  }): string {
    const {feedItemId, accountId, filename} = args;
    const accountPath = this.getStoragePathForAccount(accountId);
    return `${accountPath}${feedItemId}/${filename}`;
  }

  public async importFeedItem(feedItem: FeedItem): AsyncResult<void> {
    let importResult: Result<void, Error>;
    switch (feedItem.feedItemType) {
      case FeedItemType.YouTube: {
        const importer = new YouTubeFeedItemImporter({feedItemService: this});
        importResult = await importer.import(feedItem);
        break;
      }
      case FeedItemType.Article:
      case FeedItemType.Tweet:
      case FeedItemType.Video:
      case FeedItemType.Website: {
        const importer = new WebsiteFeedItemImporter({
          feedItemService: this,
          firecrawlService: this.firecrawlService,
        });
        importResult = await importer.import(feedItem);
        break;
      }
      case FeedItemType.Xkcd: {
        const importer = new XkcdFeedItemImporter({feedItemService: this});
        importResult = await importer.import(feedItem);
        break;
      }
      case FeedItemType.Interval: {
        return makeSuccessResult(undefined);
      }
      default:
        assertNever(feedItem);
    }

    if (!importResult.success) return importResult;

    void this.eventLogService.logFeedItemImportedEvent({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
    });

    return makeSuccessResult(undefined);
  }
}
