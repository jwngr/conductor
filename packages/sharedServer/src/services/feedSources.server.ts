import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeRssFeedSource} from '@shared/lib/feedSources.shared';
import {withFirestoreTimestamps} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {
  FeedSourceType,
  type FeedSourceFromStorage,
  type FeedSourceId,
  type PersistedFeedSource,
  type RssFeedSource,
} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/results.types';

import {serverTimestampSupplier} from '@sharedServer/services/firebase.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type FeedSourceCollectionService = ServerFirestoreCollectionService<
  FeedSourceId,
  PersistedFeedSource,
  FeedSourceFromStorage
>;

export class ServerFeedSourcesService {
  private readonly feedSourcesCollectionService: FeedSourceCollectionService;

  constructor(args: {readonly feedSourcesCollectionService: FeedSourceCollectionService}) {
    this.feedSourcesCollectionService = args.feedSourcesCollectionService;
  }

  /**
   * Fetches an existing feed by its ID.
   */
  public async fetchById(feedSourceId: FeedSourceId): AsyncResult<PersistedFeedSource | null> {
    const maybeFeedSource = await this.feedSourcesCollectionService.fetchById(feedSourceId);
    return prefixResultIfError(maybeFeedSource, 'Error fetching feed source by ID in Firestore');
  }

  /**
   * Fetches an existing feed source document from Firestore by its URL.
   */
  public async fetchRSSFeedSourceByUrl(feedUrl: string): AsyncResult<RssFeedSource | null> {
    const query = this.feedSourcesCollectionService
      .getCollectionRef()
      .where('type', '==', FeedSourceType.RSS)
      .where('url', '==', feedUrl);
    const maybeFeedSourceResult = await this.feedSourcesCollectionService.fetchFirstQueryDoc(query);
    if (!maybeFeedSourceResult.success) return maybeFeedSourceResult;
    const maybeFeedSource = maybeFeedSourceResult.value;
    if (maybeFeedSource === null) return makeSuccessResult(null);
    return makeSuccessResult(maybeFeedSource as RssFeedSource);
  }

  /**
   * Adds a new feed document to Firestore. To check if a feed source with the same URL already
   * exists, use {@link fetchOrCreateRssFeedSource}.
   */
  public async createRssFeedSource(
    args: Omit<RssFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
  ): AsyncResult<RssFeedSource> {
    const {url, title} = args;

    // Create the new feed source in memory.
    const newFeedSource = makeRssFeedSource({url, title});

    // Save the new feed source to Firestore.
    const docId = newFeedSource.feedSourceId;
    const docData = withFirestoreTimestamps(newFeedSource, serverTimestampSupplier);
    const saveResult = await this.feedSourcesCollectionService.setDoc(docId, docData);
    if (!saveResult.success) return prefixErrorResult(saveResult, 'Failed persisting feed source');

    // Return the new feed source.
    return makeSuccessResult(newFeedSource);
  }

  /**
   * Gets an existing feed source by URL or creates a new one if it doesn't exist. If creating a
   * new feed source and no title is provided, the URL will be used as the title.
   */
  public async fetchOrCreateRssFeedSource(
    url: string,
    feedSourceDetails: Partial<Pick<RssFeedSource, 'title'>>
  ): AsyncResult<RssFeedSource> {
    // Try to fetch the existing feed source.
    const existingFeedSourceResult = await this.fetchRSSFeedSourceByUrl(url);
    if (!existingFeedSourceResult.success) return existingFeedSourceResult;

    // If an existing feed source is found, return it.
    const existingFeedSource = existingFeedSourceResult.value;
    if (existingFeedSource !== null) return makeSuccessResult(existingFeedSource);

    // Otherwise, create a new feed source.
    const title = feedSourceDetails.title ?? url;
    return await this.createRssFeedSource({url, title});
  }

  /**
   * Permanently deletes a feed source document from Firestore.
   */
  public async delete(feedSourceId: FeedSourceId): AsyncResult<void> {
    const deleteResult = await this.feedSourcesCollectionService.deleteDoc(feedSourceId);
    return prefixResultIfError(deleteResult, 'Error deleting feed source in Firestore');
  }
}
