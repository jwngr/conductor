import type {CollectionReference} from 'firebase-admin/firestore';
import {FieldValue} from 'firebase-admin/firestore';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';

import type {FeedSource, FeedSourceId} from '@shared/types/feedSources.types';
import {makeFeedSource} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

export class ServerFeedSourcesService {
  private readonly feedSourcesDbRef: CollectionReference;

  constructor(args: {readonly feedSourcesDbRef: CollectionReference}) {
    this.feedSourcesDbRef = args.feedSourcesDbRef;
  }

  /**
   * Fetches an existing feed by its ID.
   */
  public async fetchById(feedSourceId: FeedSourceId): AsyncResult<FeedSource | null> {
    const feedSourceDocRef = this.feedSourcesDbRef.doc(feedSourceId);
    const feedSourceDocSnap = await asyncTry(async () => await feedSourceDocRef.get());
    if (!feedSourceDocSnap.success) {
      return makeErrorResult(
        prefixError(feedSourceDocSnap.error, 'Error fetching feed source by ID in Firestore')
      );
    }

    if (!feedSourceDocSnap.value.exists) {
      return makeSuccessResult(null);
    }

    const feedSource = feedSourceDocSnap.value.data() as FeedSource;
    return makeSuccessResult(feedSource);
  }

  /**
   * Fetches an existing feed source document from Firestore by its URL.
   */
  public async fetchByUrl(feedUrl: string): AsyncResult<FeedSource | null> {
    const feedSourceDocsQuery = this.feedSourcesDbRef.where('url', '==', feedUrl);
    const feedSourceDocsQuerySnapshotResult = await asyncTry(
      async () => await feedSourceDocsQuery.get()
    );
    if (!feedSourceDocsQuerySnapshotResult.success) {
      return makeErrorResult(
        prefixError(
          feedSourceDocsQuerySnapshotResult.error,
          'Error fetching feed source by URL in Firestore'
        )
      );
    }

    const feedSourceDocsQuerySnapshot = feedSourceDocsQuerySnapshotResult.value;

    if (feedSourceDocsQuerySnapshot.docs.length === 0) {
      return makeSuccessResult(null);
    }

    const feedSource = feedSourceDocsQuerySnapshot.docs[0].data() as FeedSource;
    return makeSuccessResult(feedSource);
  }

  /**
   * Adds a new feed document to Firestore. To check if a feed source with the same URL already
   * exists, use {@link fetchByUrlOrCreate}.
   */
  public async create(
    feedDetails: Omit<FeedSource, 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
  ): AsyncResult<FeedSource> {
    const makeFeedSourceResult = makeFeedSource({
      url: feedDetails.url,
      title: feedDetails.title,
    });
    if (!makeFeedSourceResult.success) return makeFeedSourceResult;
    const newFeedSource = makeFeedSourceResult.value;

    const newFeedSourceDocRef = this.feedSourcesDbRef.doc(newFeedSource.feedSourceId);
    const saveToDbResult = await asyncTry(async () => await newFeedSourceDocRef.set(newFeedSource));
    if (!saveToDbResult.success) {
      return makeErrorResult(
        prefixError(saveToDbResult.error, 'Error adding feed source to Firestore')
      );
    }

    return makeSuccessResult(newFeedSource);
  }

  /**
   * Gets an existing feed source by URL or creates a new one if it doesn't exist. If creating a
   * new feed source and no title is provided, the URL will be used as the title.
   */
  public async fetchByUrlOrCreate(
    url: string,
    feedSourceDetails: Partial<Pick<FeedSource, 'title'>>
  ): AsyncResult<FeedSource> {
    // First try to fetch the existing feed source.
    const existingFeedSourceResult = await this.fetchByUrl(url);
    if (!existingFeedSourceResult.success) return existingFeedSourceResult;

    // If we found an existing feed source, return it
    if (existingFeedSourceResult.value !== null) {
      return makeSuccessResult(existingFeedSourceResult.value);
    }

    // Otherwise create a new feed source.
    return await this.create({
      url,
      title: feedSourceDetails.title ?? url,
    });
  }

  /**
   * Updates a feed source document in Firestore.
   */
  public async update(
    feedSourceId: FeedSourceId,
    update: Partial<Pick<FeedSource, 'title'>>
  ): AsyncResult<void> {
    const feedSourceDocRef = this.feedSourcesDbRef.doc(feedSourceId);
    const updateResult = await asyncTry(async () => {
      await feedSourceDocRef.update({
        ...update,
        lastUpdatedTime: FieldValue.serverTimestamp(),
      });
    });

    if (!updateResult.success) {
      return makeErrorResult(prefixError(updateResult.error, 'Error updating feed in Firestore'));
    }

    return makeSuccessResult(undefined);
  }

  /**
   * Permanently deletes a feed source document from Firestore.
   */
  public async delete(feedSourceId: FeedSourceId): AsyncResult<void> {
    const feedSourceDocRef = this.feedSourcesDbRef.doc(feedSourceId);
    const deleteResult = await asyncTry(async () => await feedSourceDocRef.delete());
    if (!deleteResult.success) {
      return makeErrorResult(
        prefixError(deleteResult.error, 'Error deleting feed source in Firestore')
      );
    }

    return makeSuccessResult(undefined);
  }
}
