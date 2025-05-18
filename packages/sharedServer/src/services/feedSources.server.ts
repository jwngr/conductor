import type {WithFieldValue} from 'firebase-admin/firestore';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeRssFeedSource} from '@shared/lib/feedSources.shared';
import {withFirestoreTimestamps} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {
  FeedSourceFromStorage,
  FeedSourceId,
  PersistedFeedSource,
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
  public async fetchByUrl(feedUrl: string): AsyncResult<PersistedFeedSource | null> {
    const query = this.feedSourcesCollectionService.getCollectionRef().where('url', '==', feedUrl);
    const maybeFeedSource = await this.feedSourcesCollectionService.fetchFirstQueryDoc(query);
    return prefixResultIfError(maybeFeedSource, 'Error fetching feed source by URL in Firestore');
  }

  /**
   * Adds a new feed document to Firestore. To check if a feed source with the same URL already
   * exists, use {@link fetchByUrlOrCreate}.
   */
  public async createRssFeedSource(
    feedDetails: Omit<
      PersistedFeedSource,
      'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'
    >
  ): AsyncResult<PersistedFeedSource> {
    // Create the new feed source in memory.
    const newFeedSource = makeRssFeedSource({
      url: feedDetails.url,
      title: feedDetails.title,
    });

    // Create the new feed source in Firestore.
    const createResult = await this.feedSourcesCollectionService.setDoc(
      newFeedSource.feedSourceId,
      // TODO: Fix this unsafe type cast.
      withFirestoreTimestamps(
        newFeedSource,
        serverTimestampSupplier
      ) as WithFieldValue<PersistedFeedSource>
    );
    if (!createResult.success) {
      return prefixErrorResult(createResult, 'Error adding feed source to Firestore');
    }
    return makeSuccessResult(newFeedSource);
  }

  /**
   * Gets an existing feed source by URL or creates a new one if it doesn't exist. If creating a
   * new feed source and no title is provided, the URL will be used as the title.
   */
  public async fetchByUrlOrCreate(
    url: string,
    feedSourceDetails: Partial<Pick<PersistedFeedSource, 'title'>>
  ): AsyncResult<PersistedFeedSource> {
    // First try to fetch the existing feed source.
    const existingFeedSourceResult = await this.fetchByUrl(url);
    if (!existingFeedSourceResult.success) return existingFeedSourceResult;

    // If we found an existing feed source, return it.
    if (existingFeedSourceResult.value !== null) {
      return makeSuccessResult(existingFeedSourceResult.value);
    }

    // Otherwise create a new feed source.
    return await this.createRssFeedSource({
      url,
      title: feedSourceDetails.title ?? url,
    });
  }

  /**
   * Updates a feed source document in Firestore.
   */
  public async update(
    feedSourceId: FeedSourceId,
    update: Partial<WithFieldValue<Pick<PersistedFeedSource, 'title'>>>
  ): AsyncResult<void> {
    const updateResult = await this.feedSourcesCollectionService.updateDoc(feedSourceId, update);
    return prefixResultIfError(updateResult, 'Error updating feed source in Firestore');
  }

  /**
   * Permanently deletes a feed source document from Firestore.
   */
  public async delete(feedSourceId: FeedSourceId): AsyncResult<void> {
    const deleteResult = await this.feedSourcesCollectionService.deleteDoc(feedSourceId);
    return prefixResultIfError(deleteResult, 'Error deleting feed source in Firestore');
  }
}
