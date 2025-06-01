import {deleteField, where} from 'firebase/firestore';
import type {StorageReference} from 'firebase/storage';
import {getBlob, ref as storageRef} from 'firebase/storage';

import {FEED_ITEM_FILE_LLM_CONTEXT, FEED_ITEM_FILE_TRANSCRIPT} from '@shared/lib/constants.shared';
import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {Views} from '@shared/lib/views.shared';

import type {AccountId, AuthStateChangedUnsubscribe} from '@shared/types/accounts.types';
import {FeedItemActionType, TriageStatus} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemId, FeedItemWithUrl} from '@shared/types/feedItems.types';
import {fromQueryFilterOp} from '@shared/types/query.types';
import type {AsyncResult} from '@shared/types/results.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {Consumer} from '@shared/types/utils.types';
import type {ViewType} from '@shared/types/views.types';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

import {toast, toastWithUndo} from '@sharedClient/lib/toasts.client';

type FeedItemsCollectionService = ClientFirestoreCollectionService<FeedItemId, FeedItem>;

export class ClientFeedItemsService {
  private readonly feedItemsCollectionService: FeedItemsCollectionService;
  private readonly feedItemsStorageRef: StorageReference;
  private readonly accountId: AccountId;
  private readonly eventLogService: ClientEventLogService;

  constructor(args: {
    readonly feedItemsCollectionService: FeedItemsCollectionService;
    readonly feedItemsStorageRef: StorageReference;
    readonly accountId: AccountId;
    readonly eventLogService: ClientEventLogService;
  }) {
    this.feedItemsCollectionService = args.feedItemsCollectionService;
    this.feedItemsStorageRef = args.feedItemsStorageRef;
    this.accountId = args.accountId;
    this.eventLogService = args.eventLogService;
  }

  public async fetchById(feedItemId: FeedItemId): AsyncResult<FeedItem | null> {
    return this.feedItemsCollectionService.fetchById(feedItemId);
  }

  public watchFeedItem(
    feedItemId: FeedItemId,
    successCallback: Consumer<FeedItem | null>, // null means feed item does not exist.
    errorCallback: Consumer<Error>
  ): AuthStateChangedUnsubscribe {
    const unsubscribe = this.feedItemsCollectionService.watchDoc(
      feedItemId,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  public watchFeedItemsQuery(args: {
    readonly viewType: ViewType;
    readonly successCallback: Consumer<FeedItem[]>;
    readonly errorCallback: Consumer<Error>;
  }): AuthStateChangedUnsubscribe {
    const {viewType, successCallback, errorCallback} = args;

    // Construct Firestore queries from the view config.
    const viewConfig = Views.get(viewType);
    const whereClauses = [
      where('accountId', '==', this.accountId),
      ...viewConfig.filters.map((filter) =>
        where(filter.field, fromQueryFilterOp(filter.op), filter.value)
      ),
      // TODO: Order by created time to ensure a consistent order.
      // orderBy(viewConfig.sort.field, viewConfig.sort.direction),
    ];
    const itemsQuery = this.feedItemsCollectionService.query(whereClauses);

    const unsubscribe = this.feedItemsCollectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  public async createFeedItemFromUrl(
    args: Pick<FeedItemWithUrl, 'feedSource' | 'url' | 'title'>
  ): AsyncResult<FeedItemWithUrl> {
    const {feedSource, url, title} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    // Create a new feed item object locally.

    const feedItemResult = SharedFeedItemHelpers.makeFeedItemFromUrl({
      feedSource,
      url: trimmedUrl,
      accountId: this.accountId,
      title,
      description: null,
    });
    if (!feedItemResult.success) return feedItemResult;
    const feedItem = feedItemResult.value;

    // Save the feed item to Firestore.
    const addFeedItemResult = await this.feedItemsCollectionService.setDoc(
      feedItem.feedItemId,
      feedItem
    );
    if (!addFeedItemResult.success) return makeErrorResult(addFeedItemResult.error);

    // Return the feed item.
    return makeSuccessResult(feedItem);
  }

  public async updateFeedItem(
    feedItemId: FeedItemId,
    updates: Partial<FeedItem>
  ): AsyncResult<void> {
    const updateResult = await this.feedItemsCollectionService.updateDoc(feedItemId, updates);
    return prefixResultIfError(updateResult, 'Error updating feed item');
  }

  public async deleteFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    const deleteResult = await this.feedItemsCollectionService.deleteDoc(feedItemId);
    return prefixResultIfError(deleteResult, 'Error deleting feed item');
  }

  /**
   * Returns an account-specific path to a file in Firebase Storage for a given feed item.
   */
  public getFilePath(args: {readonly feedItemId: FeedItemId; readonly filename: string}): string {
    const {feedItemId, filename} = args;
    return `${this.accountId}/${feedItemId}/${filename}`;
  }

  /**
   * Fetches a file from Firebase Storage as a string.
   */
  public async getFileFromStorage(args: {
    readonly feedItemId: FeedItemId;
    readonly filename: string;
  }): AsyncResult<string> {
    const {feedItemId, filename} = args;

    const filePath = this.getFilePath({feedItemId, filename});
    const fileRef = storageRef(this.feedItemsStorageRef, filePath);

    // Fetch the download URL for the file.
    const downloadUrlResult = await asyncTry(async () => getBlob(fileRef));
    if (!downloadUrlResult.success) {
      return prefixErrorResult(downloadUrlResult, 'Error fetching feed item download URL');
    }

    // TODO: Handle various expected Firebase errors.

    const parseBlobResult = await asyncTry(async () => downloadUrlResult.value.text());
    return prefixResultIfError(parseBlobResult, 'Error parsing downloaded file blob');
  }

  public async getFeedItemMarkdown(feedItemId: FeedItemId): AsyncResult<string> {
    return this.getFileFromStorage({feedItemId, filename: FEED_ITEM_FILE_LLM_CONTEXT});
  }

  public async getFeedItemTranscript(feedItemId: FeedItemId): AsyncResult<string> {
    return this.getFileFromStorage({feedItemId, filename: FEED_ITEM_FILE_TRANSCRIPT});
  }

  public async markFeedItemAsDone(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {triageStatus: TriageStatus.Done},
      undoState: {triageStatus: TriageStatus.Untriaged},
      toastMessage: 'Feed item marked as done',
      errorToastMessage: 'Error marking feed item as done',
      undoMessage: 'Feed item marked as done',
      undoFailureMessage: 'Error marking feed item as done',
      feedItemActionType: FeedItemActionType.MarkDone,
    });
  }

  public async markFeedItemAsUndone(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {triageStatus: TriageStatus.Untriaged},
      undoState: {triageStatus: TriageStatus.Done},
      toastMessage: 'Feed item marked as undone',
      errorToastMessage: 'Error marking feed item as undone',
      undoMessage: 'Feed item marked as undone',
      undoFailureMessage: 'Error marking feed item as undone',
      feedItemActionType: FeedItemActionType.MarkUndone,
    });
  }

  public async markFeedItemAsRead(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {[`tagIds.${SystemTagId.Unread}`]: deleteField()} as Partial<FeedItem>,
      undoState: {[`tagIds.${SystemTagId.Unread}`]: true} as Partial<FeedItem>,
      toastMessage: 'Feed item marked as read',
      errorToastMessage: 'Error marking feed item as read',
      undoMessage: 'Feed item marked as unread',
      undoFailureMessage: 'Error marking feed item as unread',
      feedItemActionType: FeedItemActionType.MarkRead,
    });
  }

  public async markFeedItemAsUnread(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {[`tagIds.${SystemTagId.Unread}`]: true} as Partial<FeedItem>,
      undoState: {[`tagIds.${SystemTagId.Unread}`]: deleteField()} as Partial<FeedItem>,
      toastMessage: 'Feed item marked as unread',
      errorToastMessage: 'Error marking feed item as unread',
      undoMessage: 'Feed item marked as read',
      undoFailureMessage: 'Error marking feed item as read',
      feedItemActionType: FeedItemActionType.MarkUnread,
    });
  }

  public async starFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {[`tagIds.${SystemTagId.Starred}`]: true} as Partial<FeedItem>,
      undoState: {[`tagIds.${SystemTagId.Starred}`]: deleteField()} as Partial<FeedItem>,
      toastMessage: 'Feed item starred',
      errorToastMessage: 'Error starring feed item',
      undoMessage: 'Feed item unstarred',
      undoFailureMessage: 'Error unstarring feed item',
      feedItemActionType: FeedItemActionType.Star,
    });
  }

  public async unstarFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {[`tagIds.${SystemTagId.Starred}`]: deleteField()} as Partial<FeedItem>,
      undoState: {[`tagIds.${SystemTagId.Starred}`]: true} as Partial<FeedItem>,
      toastMessage: 'Feed item unstarred',
      errorToastMessage: 'Error unstarring feed item',
      undoMessage: 'Feed item starred',
      undoFailureMessage: 'Error starring feed item',
      feedItemActionType: FeedItemActionType.Unstar,
    });
  }

  public async saveFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {triageStatus: TriageStatus.Saved},
      undoState: {triageStatus: TriageStatus.Untriaged},
      toastMessage: 'Feed item saved',
      errorToastMessage: 'Error saving feed item',
      undoMessage: 'Feed item unsaved',
      undoFailureMessage: 'Error unsaving feed item',
      feedItemActionType: FeedItemActionType.Save,
    });
  }

  public async unsaveFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId,
      targetState: {triageStatus: TriageStatus.Untriaged},
      undoState: {triageStatus: TriageStatus.Saved},
      toastMessage: 'Feed item unsaved',
      errorToastMessage: 'Error unsaving feed item',
      undoMessage: 'Feed item saved',
      undoFailureMessage: 'Error saving feed item',
      feedItemActionType: FeedItemActionType.Unsave,
    });
  }

  public async retryImport(feedItem: FeedItem): AsyncResult<void> {
    return this.performFeedItemActionWithUndo({
      feedItemId: feedItem.feedItemId,
      targetState: {
        importState: {
          ...feedItem.importState,
          lastImportRequestedTime: new Date(),
          shouldFetch: true,
        },
      } as Partial<FeedItem>,
      undoState: {
        importState: feedItem.importState,
      },
      toastMessage: 'Feed item import retried',
      errorToastMessage: 'Error retrying feed item import',
      undoMessage: 'Feed item import failed',
      undoFailureMessage: 'Error retrying feed item import',
      feedItemActionType: FeedItemActionType.RetryImport,
    });
  }

  private async performFeedItemActionWithUndo(args: {
    readonly feedItemId: FeedItemId;
    readonly targetState: Partial<FeedItem>;
    readonly undoState: Partial<FeedItem>;
    readonly undoMessage: string | React.ReactNode;
    readonly undoFailureMessage: string | React.ReactNode;
    readonly feedItemActionType: FeedItemActionType;
    readonly toastMessage: string | React.ReactNode;
    readonly errorToastMessage: string | React.ReactNode;
  }): AsyncResult<void> {
    const {feedItemId, targetState, undoState, undoMessage, undoFailureMessage} = args;
    const {feedItemActionType, toastMessage, errorToastMessage} = args;

    const updateResult = await this.updateFeedItem(feedItemId, targetState);
    if (!updateResult.success) {
      toast.error(errorToastMessage);
      return updateResult;
    }

    void this.eventLogService.logFeedItemActionEvent({feedItemId, feedItemActionType});

    // Show a toast with an undo button.
    toastWithUndo({
      message: toastMessage,
      undoMessage: undoMessage,
      undoFailureMessage: undoFailureMessage,
      undoAction: async () => {
        const undoResult = await this.updateFeedItem(feedItemId, undoState);
        if (!undoResult.success) return undoResult;

        void this.eventLogService.logFeedItemActionEvent({
          feedItemId,
          feedItemActionType: FeedItemActionType.Undo,
          // TODO: Log the original action type as additional details.
        });

        return undoResult;
      },
    });

    return makeSuccessResult(undefined);
  }
}
