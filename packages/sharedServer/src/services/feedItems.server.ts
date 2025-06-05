import type {FeedItemFromStorage} from '@conductor/shared/src/schemas/feedItems.schema';
import type {DocumentData} from 'firebase-admin/firestore';

import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {getFeedItemTypeFromUrl, SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeIntervalFeedSource} from '@shared/lib/feedSources.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemContentType} from '@shared/types/feedItems.types';
import type {
  FeedItem,
  FeedItemId,
  FeedItemWithUrlContent,
  IntervalFeedItem,
  IntervalFeedItemContent,
  XkcdFeedItemContent,
} from '@shared/types/feedItems.types';
import type {FeedSource} from '@shared/types/feedSources.types';
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
  private readonly collectionService: FeedItemCollectionService;

  constructor(args: {
    readonly storageCollectionPath: string;
    readonly firecrawlService: ServerFirecrawlService;
    readonly eventLogService: ServerEventLogService;
    readonly collectionService: FeedItemCollectionService;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.firecrawlService = args.firecrawlService;
    this.eventLogService = args.eventLogService;
    this.collectionService = args.collectionService;
  }

  public async createFeedItemFromUrl(args: {
    readonly feedSource: FeedSource;
    readonly content: FeedItemWithUrlContent;
    readonly accountId: AccountId;
  }): AsyncResult<FeedItem> {
    const {feedSource, content, accountId} = args;

    const trimmedUrl = content.url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${content.url}"`));
    }

    const feedItemContentType = getFeedItemTypeFromUrl(content.url);
    const feedItem = SharedFeedItemHelpers.makeFeedItem({
      feedItemContentType,
      feedSource,
      content,
      accountId,
    });

    const addFeedItemResult = await this.collectionService.setDoc(feedItem.feedItemId, feedItem);

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

    const feedItem = SharedFeedItemHelpers.makeIntervalFeedItem({
      feedSource: makeIntervalFeedSource({userFeedSubscription}),
      accountId,
      content: {
        title: `Interval feed item for ${new Date().toISOString()}`,
        intervalSeconds: userFeedSubscription.intervalSeconds,
      },
    });

    const addFeedItemResult = await this.collectionService.setDoc(feedItem.feedItemId, feedItem);

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
    const updateResult = await this.collectionService.updateDoc(feedItemId, updates);
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }

  public async updateXkcdFeedItemContent(
    feedItemId: FeedItemId,
    updates: Partial<XkcdFeedItemContent>
  ): AsyncResult<void> {
    const dataToWrite = {
      [`content.title`]: updates.title,
      [`content.url`]: updates.url,
      [`content.description`]: updates.description,
      [`content.outgoingLinks`]: updates.outgoingLinks,
      [`content.summary`]: updates.summary,
      [`content.altText`]: updates.altText,
      [`content.imageUrlSmall`]: updates.imageUrlSmall,
      [`content.imageUrlLarge`]: updates.imageUrlLarge,
    } as DocumentData;
    const updateResult = await this.collectionService.updateDoc(feedItemId, dataToWrite);
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }

  public async updateIntervalFeedItemContent(
    feedItemId: FeedItemId,
    updates: Partial<IntervalFeedItemContent>
  ): AsyncResult<void> {
    const dataToWrite = {
      [`content.title`]: updates.title,
      [`content.intervalSeconds`]: updates.intervalSeconds,
    } as DocumentData;
    const updateResult = await this.collectionService.updateDoc(feedItemId, dataToWrite);
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }
  public async updateFeedItemWithUrlContent(
    feedItemId: FeedItemId,
    updates: Partial<FeedItemWithUrlContent>
  ): AsyncResult<void> {
    const dataToWrite = {
      [`content.title`]: updates.title,
      [`content.url`]: updates.url,
      [`content.description`]: updates.description,
      [`content.outgoingLinks`]: updates.outgoingLinks,
      [`content.summary`]: updates.summary,
    } as DocumentData;
    const updateResult = await this.collectionService.updateDoc(feedItemId, dataToWrite);
    return prefixResultIfError(updateResult, 'Error updating feed item in Firestore');
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
    const query = this.collectionService.getCollectionRef().where('accountId', '==', accountId);
    const queryResult = await this.collectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(queryResult, 'Error fetching feed items to delete for account');
    }

    // Delete all of the account's feed items.
    const docIdsToDelete = queryResult.value;
    return await this.collectionService.batchDeleteDocs(docIdsToDelete);
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
    switch (feedItem.feedItemContentType) {
      case FeedItemContentType.YouTube: {
        const importer = new YouTubeFeedItemImporter({feedItemService: this});
        importResult = await importer.import(feedItem);
        break;
      }
      case FeedItemContentType.Article:
      case FeedItemContentType.Tweet:
      case FeedItemContentType.Video:
      case FeedItemContentType.Website: {
        const importer = new WebsiteFeedItemImporter({
          feedItemService: this,
          firecrawlService: this.firecrawlService,
        });
        importResult = await importer.import(feedItem);
        break;
      }
      case FeedItemContentType.Xkcd: {
        const importer = new XkcdFeedItemImporter({feedItemService: this});
        importResult = await importer.import(feedItem);
        break;
      }
      case FeedItemContentType.Interval: {
        return makeSuccessResult(undefined);
      }
      default:
        assertNever(feedItem);
    }

    if (!importResult.success) return importResult;

    void this.eventLogService.logFeedItemImportedEvent({
      accountId: feedItem.accountId,
      feedItemId: feedItem.feedItemId,
    });

    return makeSuccessResult(undefined);
  }
}
