import type {CollectionReference} from 'firebase-admin/firestore';
import {FieldValue} from 'firebase-admin/firestore';

import {prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {parseFeedSource} from '@shared/parsers/feedSources.parser';

import type {FeedSource, FeedSourceId} from '@shared/types/feedSources.types';
import {makeFeedSource} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';

import {
  deleteFirestoreDoc,
  getFirestoreDocData,
  getFirstFirestoreQueryData,
  setFirestoreDoc,
  updateFirestoreDoc,
} from '@sharedServer/lib/firebase.server';

export class ServerFeedSourcesService {
  private readonly feedSourcesDbRef: CollectionReference;

  constructor(args: {readonly feedSourcesDbRef: CollectionReference}) {
    this.feedSourcesDbRef = args.feedSourcesDbRef;
  }

  /**
   * Fetches an existing feed by its ID.
   */
  public async fetchById(feedSourceId: FeedSourceId): AsyncResult<FeedSource | null> {
    const docRef = this.feedSourcesDbRef.doc(feedSourceId);
    const maybeFeedSource = await getFirestoreDocData(docRef, parseFeedSource);
    return prefixResultIfError(maybeFeedSource, 'Error fetching feed source by ID in Firestore');
  }

  /**
   * Fetches an existing feed source document from Firestore by its URL.
   */
  public async fetchByUrl(feedUrl: string): AsyncResult<FeedSource | null> {
    const query = this.feedSourcesDbRef.where('url', '==', feedUrl);
    const maybeFeedSource = await getFirstFirestoreQueryData(query, parseFeedSource);
    return prefixResultIfError(maybeFeedSource, 'Error fetching feed source by URL in Firestore');
  }

  /**
   * Adds a new feed document to Firestore. To check if a feed source with the same URL already
   * exists, use {@link fetchByUrlOrCreate}.
   */
  public async create(
    feedDetails: Omit<FeedSource, 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
  ): AsyncResult<FeedSource> {
    // Create the new feed source in memory.
    const makeFeedSourceResult = makeFeedSource({
      url: feedDetails.url,
      title: feedDetails.title,
      createdTime: FieldValue.serverTimestamp(),
      lastUpdatedTime: FieldValue.serverTimestamp(),
    });
    if (!makeFeedSourceResult.success) return makeFeedSourceResult;
    const newFeedSource = makeFeedSourceResult.value;

    // Create the new feed source in Firestore.
    const newDocRef = this.feedSourcesDbRef.doc(newFeedSource.feedSourceId);
    const createResult = await setFirestoreDoc(newDocRef, newFeedSource);
    return prefixResultIfError(createResult, 'Error adding feed source to Firestore');
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

    // If we found an existing feed source, return it.
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
    const docRefToUpdate = this.feedSourcesDbRef.doc(feedSourceId);
    const updateResult = await updateFirestoreDoc(docRefToUpdate, update);
    return prefixResultIfError(updateResult, 'Error updating feed source in Firestore');
  }

  /**
   * Permanently deletes a feed source document from Firestore.
   */
  public async delete(feedSourceId: FeedSourceId): AsyncResult<void> {
    const docRefToDelete = this.feedSourcesDbRef.doc(feedSourceId);
    const deleteResult = await deleteFirestoreDoc(docRefToDelete);
    return prefixResultIfError(deleteResult, 'Error deleting feed source in Firestore');
  }
}
