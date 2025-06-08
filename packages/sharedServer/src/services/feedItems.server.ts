import type {FeedItemFromStorage} from '@conductor/shared/src/schemas/feedItems.schema';
import type {DocumentData} from 'firebase-admin/firestore';

import {FEED_ITEMS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeFeedItem, makeFeedItemContentFromUrl} from '@shared/lib/feedItems.shared';
import {makeIntervalFeedSource} from '@shared/lib/feedSources.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedItem, parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemContentType} from '@shared/types/feedItems.types';
import type {
  ArticleFeedItemContent,
  FeedItem,
  FeedItemContent,
  FeedItemId,
  FeedItemImportState,
  IntervalFeedItem,
  IntervalFeedItemContent,
  TweetFeedItemContent,
  VideoFeedItemContent,
  WebsiteFeedItemContent,
  XkcdFeedItemContent,
  YouTubeFeedItemContent,
} from '@shared/types/feedItems.types';
import type {FeedSource} from '@shared/types/feedSources.types';
import type {AsyncResult, Result} from '@shared/types/results.types';
import type {IntervalUserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {toStorageFeedItem} from '@shared/storage/feedItems.storage';

import type {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import type {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {
  makeServerFirestoreCollectionService,
  type ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

import {WebsiteFeedItemImporter} from '@sharedServer/importers/website.import';
import {XkcdFeedItemImporter} from '@sharedServer/importers/xkcd.import';
import {YouTubeFeedItemImporter} from '@sharedServer/importers/youtube.import';

function makeFeedItemContentUpdates<T extends FeedItemContent>(
  content: Partial<T>,
  fieldNames: Array<string & keyof T>
): DocumentData {
  const dataToWrite: DocumentData = {};
  for (const fieldName of fieldNames) {
    if (fieldName in content) {
      dataToWrite[`content.${fieldName}`] = content[fieldName];
    }
  }
  return dataToWrite;
}

type FeedItemCollectionService = ServerFirestoreCollectionService<
  FeedItemId,
  FeedItem,
  FeedItemFromStorage
>;

export class ServerFeedItemsService {
  private readonly firebaseService: ServerFirebaseService;
  private readonly storageCollectionPath: string;
  private readonly firecrawlService: ServerFirecrawlService;
  private readonly eventLogService: ServerEventLogService;
  private readonly collectionService: FeedItemCollectionService;

  constructor(args: {
    readonly firebaseService: ServerFirebaseService;
    readonly storageCollectionPath: string;
    readonly firecrawlService: ServerFirecrawlService;
    readonly eventLogService: ServerEventLogService;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.firecrawlService = args.firecrawlService;
    this.eventLogService = args.eventLogService;
    this.firebaseService = args.firebaseService;
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: this.firebaseService,
      collectionPath: FEED_ITEMS_DB_COLLECTION,
      toStorage: toStorageFeedItem,
      fromStorage: parseFeedItem,
      parseId: parseFeedItemId,
    });
  }

  public async createFeedItemFromUrl(args: {
    readonly feedSource: FeedSource;
    readonly accountId: AccountId;
    readonly url: string;
    readonly title: string;
    readonly description: string | null;
    readonly outgoingLinks: string[];
    readonly summary: string | null;
  }): AsyncResult<FeedItem, Error> {
    const {feedSource, accountId, url, title, description, outgoingLinks, summary} = args;

    const content = makeFeedItemContentFromUrl({url, title, description, outgoingLinks, summary});
    const feedItem = makeFeedItem({feedSource, content, accountId});

    const saveResult = await this.collectionService.setDoc(feedItem.feedItemId, feedItem);
    if (!saveResult.success) return saveResult;

    return makeSuccessResult(feedItem);
  }

  public async createIntervalFeedItem(args: {
    /** The account that the feed item belongs to. */
    readonly accountId: AccountId;
    /** The subscription that is creating the feed item. */
    readonly userFeedSubscription: IntervalUserFeedSubscription;
  }): AsyncResult<IntervalFeedItem, Error> {
    const {userFeedSubscription, accountId} = args;

    const feedItem = makeFeedItem({
      feedSource: makeIntervalFeedSource({userFeedSubscription}),
      accountId,
      content: {
        feedItemContentType: FeedItemContentType.Interval,
        title: `Interval feed item for ${new Date().toISOString()}`,
        intervalSeconds: userFeedSubscription.intervalSeconds,
      },
    });

    const addFeedItemResult = await this.collectionService.setDoc(feedItem.feedItemId, feedItem);

    if (!addFeedItemResult.success) {
      return prefixErrorResult(addFeedItemResult, 'Error creating feed item in Firestore');
    }

    return makeSuccessResult(feedItem as IntervalFeedItem);
  }

  public async updateFeedItemImportState(
    feedItemId: FeedItemId,
    importState: FeedItemImportState
  ): AsyncResult<void, Error> {
    const dataToWrite: Partial<FeedItem> = {importState};
    return await this.collectionService.updateDoc(feedItemId, dataToWrite);
  }

  public async updateXkcdFeedItemContent(
    feedItemId: FeedItemId,
    content: Partial<XkcdFeedItemContent>
  ): AsyncResult<void, Error> {
    const dataToWrite: DocumentData = makeFeedItemContentUpdates(content, [
      'title',
      'url',
      'summary',
      'altText',
      'imageUrlSmall',
      'imageUrlLarge',
    ]);
    return await this.collectionService.updateDoc(feedItemId, dataToWrite);
  }

  public async updateIntervalFeedItemContent(
    feedItemId: FeedItemId,
    content: Partial<IntervalFeedItemContent>
  ): AsyncResult<void, Error> {
    const dataToWrite = makeFeedItemContentUpdates(content, ['title', 'intervalSeconds']);
    return await this.collectionService.updateDoc(feedItemId, dataToWrite);
  }

  public async updateFeedItemWithUrlContent(
    feedItemId: FeedItemId,
    content: Partial<
      | ArticleFeedItemContent
      | VideoFeedItemContent
      | WebsiteFeedItemContent
      | TweetFeedItemContent
      | YouTubeFeedItemContent
    >
  ): AsyncResult<void, Error> {
    const dataToWrite = makeFeedItemContentUpdates(content, [
      'title',
      'url',
      'description',
      'outgoingLinks',
      'summary',
    ]);
    return await this.collectionService.updateDoc(feedItemId, dataToWrite);
  }

  /**
   * Writes content to storage file.
   */
  public async writeFileToStorage(args: {
    readonly storagePath: string;
    readonly content: string;
    readonly contentType: string;
  }): AsyncResult<void, Error> {
    const {storagePath, content, contentType} = args;
    return await asyncTry(async () => {
      const file = this.firebaseService.storage.bucket().file(storagePath);
      await file.save(content, {contentType});
    });
  }

  /**
   * Permanently deletes all feed items associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void, Error> {
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
  public async deleteStorageFilesForAccount(accountId: AccountId): AsyncResult<void, Error> {
    return await asyncTry(async () =>
      this.firebaseService.storage.bucket().deleteFiles({
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

  public async importFeedItem(feedItem: FeedItem): AsyncResult<void, Error> {
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
        importResult = await importer.import({
          feedItemId: feedItem.feedItemId,
          accountId: feedItem.accountId,
          url: feedItem.content.url,
        });
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
