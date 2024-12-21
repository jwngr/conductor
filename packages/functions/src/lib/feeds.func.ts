import {CollectionReference} from 'firebase-admin/firestore';

import {FEEDS_DB_COLLECTION} from '@shared/lib/constants';
import {asyncTry, prefixError} from '@shared/lib/errors';

import {Feed, FeedId, makeFeed} from '@shared/types/feeds.types';
import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

import {FieldValue, firestore} from '@src/lib/firebaseAdmin';
import {superfeedrService} from '@src/lib/superfeedr';

class AdminFeedsService {
  private feedsDbRef: CollectionReference;

  constructor(args: {readonly feedsDbRef: CollectionReference}) {
    const {feedsDbRef} = args;
    this.feedsDbRef = feedsDbRef;
  }

  /**
   * Fetches an existing feed by its ID.
   */
  public async fetchById(feedId: FeedId): AsyncResult<Feed | null> {
    const feedDocRef = this.feedsDbRef.doc(feedId);
    const feedDocSnap = await asyncTry(async () => await feedDocRef.get());
    if (!feedDocSnap.success) {
      return makeErrorResult(
        prefixError(feedDocSnap.error, 'Error fetching feed by ID in Firestore')
      );
    }

    if (!feedDocSnap.value.exists) {
      return makeSuccessResult(null);
    }

    const feed = feedDocSnap.value.data() as Feed;
    return makeSuccessResult(feed);
  }

  /**
   * Fetches an existing feed document from Firestore by its URL.
   */
  public async fetchByUrl(feedUrl: string): AsyncResult<Feed | null> {
    const feedDocsQuery = this.feedsDbRef.where('url', '==', feedUrl);
    const feedDocsQuerySnapshotResult = await asyncTry(async () => await feedDocsQuery.get());
    if (!feedDocsQuerySnapshotResult.success) {
      return makeErrorResult(
        prefixError(feedDocsQuerySnapshotResult.error, 'Error fetching feed by URL in Firestore')
      );
    }

    const feedDocsQuerySnapshot = feedDocsQuerySnapshotResult.value;

    if (feedDocsQuerySnapshot.docs.length === 0) {
      return makeSuccessResult(null);
    }

    const feed = feedDocsQuerySnapshot.docs[0].data() as Feed;
    return makeSuccessResult(feed);
  }

  /**
   * Adds a new feed document to Firestore.
   */
  public async add(
    feedDetails: Omit<Feed, 'feedId' | 'createdTime' | 'lastUpdatedTime'>
  ): AsyncResult<Feed> {
    const makeFeedResult = makeFeed({
      url: feedDetails.url,
      title: feedDetails.title,
    });
    if (!makeFeedResult.success) return makeFeedResult;
    const newFeed = makeFeedResult.value;

    const newFeedDocRef = this.feedsDbRef.doc(newFeed.feedId);
    const saveToDbResult = await asyncTry(async () => await newFeedDocRef.set(newFeed));
    if (!saveToDbResult.success) {
      return makeErrorResult(prefixError(saveToDbResult.error, 'Error adding feed to Firestore'));
    }

    return makeSuccessResult(newFeed);
  }

  /**
   * Updates a feed document in Firestore.
   */
  public async update(feedId: FeedId, update: Partial<Pick<Feed, 'title'>>): AsyncResult<void> {
    const feedDocRef = this.feedsDbRef.doc(feedId);
    const updateResult = await asyncTry(async () => {
      await feedDocRef.update({
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
   * Permanently deletes a feed document from Firestore.
   */
  public async delete(feedId: FeedId): AsyncResult<void> {
    const feedDocRef = this.feedsDbRef.doc(feedId);
    const deleteResult = await asyncTry(async () => await feedDocRef.delete());
    if (!deleteResult.success) {
      return makeErrorResult(prefixError(deleteResult.error, 'Error deleting feed in Firestore'));
    }

    return makeSuccessResult(undefined);
  }

  /**
   * Subscribes to a feed in Superfeedr.
   */
  public async subscribeToSuperfeedr(feed: Feed): AsyncResult<void> {
    const superfeedrSubscribeResult = await superfeedrService.subscribeToFeed(feed.url);
    if (!superfeedrSubscribeResult.success) {
      return makeErrorResult(
        prefixError(superfeedrSubscribeResult.error, 'Error subscribing to feed in Superfeedr')
      );
    }
    return makeSuccessResult(undefined);
  }

  /**
   * Unsubscribes from a feed in Superfeedr.
   */
  public async unsubscribeFromSuperfeedr(feed: Feed): AsyncResult<void> {
    const superfeedrUnsubscribeResult = await superfeedrService.unsubscribeFromFeed(feed.url);
    if (!superfeedrUnsubscribeResult.success) {
      return makeErrorResult(
        prefixError(
          superfeedrUnsubscribeResult.error,
          'Error unsubscribing from feed in Superfeedr'
        )
      );
    }
    return makeSuccessResult(undefined);
  }
}

export const adminFeedsService = new AdminFeedsService({
  feedsDbRef: firestore.collection(FEEDS_DB_COLLECTION),
});