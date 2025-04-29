import {deleteField} from 'firebase/firestore';
import type React from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import {
  FeedItemActionType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';
import type {IconName} from '@shared/types/icons.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {Func} from '@shared/types/utils.types';

import {useUndoStore} from '@sharedClient/stores/UndoStore';
import type {UndoableActionResult, UndoAction} from '@sharedClient/stores/UndoStore';

import {useEventLogService} from '@sharedClient/services/eventLog.client';
import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import type {MouseEvent} from '@sharedClient/types/utils.client.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';

import {toast} from '@src/lib/toasts';

interface GenericFeedItemActionIconProps {
  readonly feedItem: FeedItem;
  readonly feedItemActionType: FeedItemActionType;
  readonly icon: IconName;
  readonly tooltip: string;
  readonly shortcutId?: KeyboardShortcutId;
  readonly getIsActive: Func<FeedItem, boolean>;
  readonly performAction: (args: {isActive: boolean}) => AsyncResult<UndoableActionResult>;
  readonly toastText: string;
  readonly errorMessage: string;
  readonly disabled?: boolean;
}

const GenericFeedItemActionIcon: React.FC<GenericFeedItemActionIconProps> = ({
  feedItem,
  feedItemActionType,
  icon,
  tooltip,
  shortcutId,
  getIsActive,
  performAction,
  toastText,
  errorMessage,
  disabled,
}) => {
  const {feedItemId} = feedItem;
  const eventLogService = useEventLogService();
  const pushUndoAction = useUndoStore((state) => state.pushUndoAction);

  const handleAction = async (event?: MouseEvent<HTMLDivElement>): Promise<void> => {
    event?.stopPropagation();
    event?.preventDefault();

    if (disabled) {
      return;
    }

    const isCurrentlyActive = getIsActive(feedItem);
    const result = await performAction({isActive: isCurrentlyActive});

    if (!result.success) {
      toast.error(errorMessage, {description: result.error.message});
      logger.error(prefixError(result.error, errorMessage), {feedItemId: feedItem.feedItemId});
      return;
    }

    const {undo} = result.value;

    const handleToastUndo: UndoAction = async () => {
      const undoResult = await undo();
      if (undoResult.success) {
        toast('Action undone');
      } else {
        toast.error('Failed to undo', {description: undoResult.error.message});
        logger.error(prefixError(undoResult.error, 'Toast undo action failed'), {feedItemId});
      }
      return undoResult;
    };

    toast.successWithUndo(toastText, handleToastUndo);
    pushUndoAction(undo);
    void eventLogService.logFeedItemActionEvent({feedItemId, feedItemActionType});
    return;
  };

  return (
    <ButtonIcon
      name={icon}
      tooltip={tooltip}
      size={40}
      onClick={handleAction}
      shortcutId={shortcutId}
      disabled={disabled}
    />
  );
};

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getMarkDoneFeedItemActionInfo(feedItem);
  const isDone = SharedFeedItemHelpers.isMarkedDone(feedItem);
  const feedItemsService = useFeedItemsService();
  const eventLogService = useEventLogService();

  const performAction = async (args: {isActive: boolean}): AsyncResult<UndoableActionResult> => {
    const {isActive} = args;
    const targetState = {triageStatus: isActive ? TriageStatus.Untriaged : TriageStatus.Done};
    const originalState = {triageStatus: isActive ? TriageStatus.Done : TriageStatus.Untriaged};

    const updateResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, targetState);

    if (!updateResult.success) return updateResult;

    const undo = async (): AsyncResult<void> => {
      const undoResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, originalState);
      if (!undoResult.success) return undoResult;

      void eventLogService.logFeedItemActionEvent({
        feedItemId: feedItem.feedItemId,
        feedItemActionType: FeedItemActionType.MarkDone,
      });
      return makeSuccessResult(undefined);
    };

    return makeSuccessResult({undo});
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.MarkDone}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isMarkedDone}
      performAction={performAction}
      toastText={isDone ? 'Feed item marked as undone' : 'Feed item marked as done'}
      errorMessage={
        isDone ? 'Error marking feed item as undone' : 'Error marking feed item as done'
      }
    />
  );
};

const SaveFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getSaveFeedItemActionInfo(feedItem);
  const isSaved = SharedFeedItemHelpers.isSaved(feedItem);
  const feedItemsService = useFeedItemsService();
  const eventLogService = useEventLogService();

  const performAction = async (args: {isActive: boolean}): AsyncResult<UndoableActionResult> => {
    const {isActive} = args;
    const targetState = {triageStatus: isActive ? TriageStatus.Untriaged : TriageStatus.Saved};
    const originalState = {triageStatus: isActive ? TriageStatus.Saved : TriageStatus.Untriaged};

    const updateResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, targetState);

    if (!updateResult.success) return updateResult;

    const undo = async (): AsyncResult<void> => {
      const undoResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, originalState);
      if (!undoResult.success) return undoResult;

      void eventLogService.logFeedItemActionEvent({
        feedItemId: feedItem.feedItemId,
        feedItemActionType: FeedItemActionType.Save,
      });
      return makeSuccessResult(undefined);
    };

    return makeSuccessResult({undo});
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.Save}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isSaved}
      performAction={performAction}
      toastText={isSaved ? 'Feed item unsaved' : 'Feed item saved'}
      errorMessage={isSaved ? 'Error unsaving feed item' : 'Error saving feed item'}
    />
  );
};

const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getMarkUnreadFeedItemActionInfo(feedItem);
  const isUnread = SharedFeedItemHelpers.isUnread(feedItem);
  const feedItemsService = useFeedItemsService();
  const eventLogService = useEventLogService();

  const performAction = async (args: {isActive: boolean}): AsyncResult<UndoableActionResult> => {
    const {isActive} = args;
    const targetState = {[`tagIds.${SystemTagId.Unread}`]: isActive ? deleteField() : true};
    const originalState = {[`tagIds.${SystemTagId.Unread}`]: isActive ? true : deleteField()};

    const updateResult = await feedItemsService.updateFeedItem(
      feedItem.feedItemId,
      targetState as Partial<FeedItem>
    );

    if (!updateResult.success) return updateResult;

    const undo = async (): AsyncResult<void> => {
      const undoResult = await feedItemsService.updateFeedItem(
        feedItem.feedItemId,
        originalState as Partial<FeedItem>
      );
      if (!undoResult.success) return undoResult;

      void eventLogService.logFeedItemActionEvent({
        feedItemId: feedItem.feedItemId,
        feedItemActionType: FeedItemActionType.MarkUnread,
      });
      return makeSuccessResult(undefined);
    };

    return makeSuccessResult({undo});
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.MarkUnread}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isUnread}
      performAction={performAction}
      toastText={isUnread ? 'Feed item marked as read' : 'Feed item marked as unread'}
      errorMessage={
        isUnread ? 'Error marking feed item as read' : 'Error marking feed item as unread'
      }
    />
  );
};

const StarFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getStarFeedItemActionInfo(feedItem);
  const isStarred = SharedFeedItemHelpers.isStarred(feedItem);
  const feedItemsService = useFeedItemsService();
  const eventLogService = useEventLogService();

  const performAction = async (args: {isActive: boolean}): AsyncResult<UndoableActionResult> => {
    const {isActive} = args;
    const targetState = {[`tagIds.${SystemTagId.Starred}`]: isActive ? deleteField() : true};
    const originalState = {[`tagIds.${SystemTagId.Starred}`]: isActive ? true : deleteField()};

    const updateResult = await feedItemsService.updateFeedItem(
      feedItem.feedItemId,
      targetState as Partial<FeedItem>
    );

    if (!updateResult.success) return updateResult;

    const undo = async (): AsyncResult<void> => {
      const undoResult = await feedItemsService.updateFeedItem(
        feedItem.feedItemId,
        originalState as Partial<FeedItem>
      );
      if (!undoResult.success) return undoResult;

      void eventLogService.logFeedItemActionEvent({
        feedItemId: feedItem.feedItemId,
        feedItemActionType: FeedItemActionType.Star,
      });
      return makeSuccessResult(undefined);
    };

    return makeSuccessResult({undo});
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.Star}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isStarred}
      performAction={performAction}
      toastText={isStarred ? 'Feed item unstarred' : 'Feed item starred'}
      errorMessage={isStarred ? 'Error unstarring feed item' : 'Error starring feed item'}
    />
  );
};

const RetryImportActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getRetryImportFeedItemActionInfo();
  const feedItemsService = useFeedItemsService();

  const performAction = async (): AsyncResult<UndoableActionResult> => {
    const updateResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
      importState: {
        ...feedItem.importState,
        lastImportRequestedTime: new Date(),
        shouldFetch: true,
      },
    } as Partial<FeedItem>);

    if (!updateResult.success) return updateResult;

    const undo = async (): AsyncResult<void> => {
      logger.warn('Cannot undo Retry Import action', {feedItemId: feedItem.feedItemId});
      return makeSuccessResult(undefined);
    };

    return makeSuccessResult({undo});
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.RetryImport}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={() => false}
      disabled={feedItem.importState.status === FeedItemImportStatus.Processing}
      performAction={performAction}
      toastText={'Feed item queued for re-import'}
      errorMessage={'Error queuing feed item for re-import'}
    />
  );
};

const DebugSaveExampleActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getDebugSaveExampleFeedItemActionInfo();

  const performAction = async (): AsyncResult<UndoableActionResult> => {
    logger.log('DebugSaveExampleActionIcon action performed (TODO)', {
      feedItemId: feedItem.feedItemId,
    });

    const undo = async (): AsyncResult<void> => {
      logger.warn('Cannot undo Debug Save Example action (TODO)', {
        feedItemId: feedItem.feedItemId,
      });
      return makeSuccessResult(undefined);
    };

    return makeSuccessResult({undo});
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.DebugSaveExample}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={() => false}
      performAction={performAction}
      toastText={'Feed item saved as example (TODO: Implement this)'}
      errorMessage={'Error saving feed item as example (TODO: Implement this)'}
    />
  );
};

export const FeedItemActions: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  return (
    <div className="flex flex-row items-center gap-3">
      <RetryImportActionIcon feedItem={feedItem} />
      <DebugSaveExampleActionIcon feedItem={feedItem} />
      <StarFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
    </div>
  );
};

export const HoverFeedItemActions: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  return (
    <div className="flex flex-row items-center gap-3">
      <StarFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
    </div>
  );
};
