import {deleteField} from 'firebase/firestore';
import type React from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {noopFalse} from '@shared/lib/utils.shared';

import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import {
  FeedItemActionType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';
import type {IconName} from '@shared/types/icons.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {UndoableAction, UndoableActionFn} from '@shared/types/undo.types';
import type {Func, Task} from '@shared/types/utils.types';

import {useEventLogService} from '@sharedClient/services/eventLog.client';
import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import type {MouseEvent} from '@sharedClient/types/utils.client.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';

import {toast, toastWithUndo} from '@src/lib/toasts';

const performUpdateAndGetUndo = async (args: {
  readonly feedItemId: FeedItemId;
  readonly targetState: Partial<FeedItem> | Record<string, unknown>; // Allow deleteField
  readonly undoState: Partial<FeedItem> | Record<string, unknown>; // Allow deleteField
  readonly feedItemsService: ReturnType<typeof useFeedItemsService>;
  readonly undoMessage: string | React.ReactNode;
  readonly undoFailureMessage: string | React.ReactNode;
  readonly originalActionType: FeedItemActionType;
}): AsyncResult<UndoableAction> => {
  const {
    feedItemId,
    targetState,
    undoState,
    feedItemsService,
    undoMessage,
    undoFailureMessage,
    originalActionType,
  } = args;

  const updateResult = await feedItemsService.updateFeedItem(feedItemId, targetState);
  if (!updateResult.success) return updateResult;

  const undoAction = async (): AsyncResult<void> => {
    const undoResult = await feedItemsService.updateFeedItem(feedItemId, undoState);
    if (!undoResult.success) return undoResult;
    return makeSuccessResult(undefined);
  };

  return makeSuccessResult({
    undoAction,
    undoMessage,
    undoFailureMessage,
    originalActionType,
  });
};

interface GenericFeedItemActionIconProps {
  readonly feedItem: FeedItem;
  readonly feedItemActionType: FeedItemActionType;
  readonly icon: IconName;
  readonly tooltip: string;
  readonly shortcutId?: KeyboardShortcutId;
  readonly getIsActive: Func<FeedItem, boolean>;
  readonly performAction: UndoableActionFn;
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

  const handleAction = async (event?: MouseEvent<HTMLDivElement>): Promise<void> => {
    event?.stopPropagation();
    event?.preventDefault();

    if (disabled) return;

    const isCurrentlyActive = getIsActive(feedItem);
    const originalActionResult = await performAction({isActive: isCurrentlyActive});

    if (!originalActionResult.success) {
      toast.error(errorMessage, {description: originalActionResult.error.message});
      logger.error(prefixError(originalActionResult.error, errorMessage), {feedItemId});
      return;
    }

    // Log the original action.
    void eventLogService.logFeedItemActionEvent({feedItemId, feedItemActionType});

    const undoableAction = await originalActionResult.value;

    // Actions without undo just show a regular toast.
    if (undoableAction === null) {
      toast(toastText);
      return;
    }

    // Actions with undo show a toast with an undo button.
    toastWithUndo({
      message: toastText,
      undoMessage: undoableAction.undoMessage,
      undoFailureMessage: undoableAction.undoFailureMessage,
      originalActionType: undoableAction.originalActionType,
      undoAction: async () => {
        const undoResult = await undoableAction.undoAction();
        if (!undoResult.success) return undoResult;

        void eventLogService.logFeedItemActionEvent({
          feedItemId,
          feedItemActionType: FeedItemActionType.Undo,
          // TODO: Log the original action type as additional details.
        });

        return undoResult;
      },
    });
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

  const performAction: UndoableActionFn = async ({isActive}) => {
    const targetState = {triageStatus: isActive ? TriageStatus.Untriaged : TriageStatus.Done};
    const undoState = {triageStatus: isActive ? TriageStatus.Done : TriageStatus.Untriaged};

    return await performUpdateAndGetUndo({
      feedItemId: feedItem.feedItemId,
      targetState,
      undoState,
      feedItemsService,
      undoMessage: isDone ? 'Feed item marked as done' : 'Feed item marked as undone',
      undoFailureMessage: isDone
        ? 'Error marking feed item as done'
        : 'Error marking feed item as undone',
      originalActionType: FeedItemActionType.MarkDone,
    });
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

  const performAction: UndoableActionFn = async ({isActive}) => {
    const targetState = {triageStatus: isActive ? TriageStatus.Untriaged : TriageStatus.Saved};
    const undoState = {triageStatus: isActive ? TriageStatus.Saved : TriageStatus.Untriaged};

    return await performUpdateAndGetUndo({
      feedItemId: feedItem.feedItemId,
      targetState,
      undoState,
      feedItemsService,
      undoMessage: isSaved ? 'Feed item saved' : 'Feed item unsaved',
      undoFailureMessage: isSaved ? 'Error saving feed item' : 'Error unsaving feed item',
      originalActionType: FeedItemActionType.Save,
    });
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

  const performAction: UndoableActionFn = async ({isActive}) => {
    const targetState = {[`tagIds.${SystemTagId.Unread}`]: isActive ? deleteField() : true};
    const undoState = {[`tagIds.${SystemTagId.Unread}`]: isActive ? true : deleteField()};

    return await performUpdateAndGetUndo({
      feedItemId: feedItem.feedItemId,
      targetState,
      undoState,
      feedItemsService,
      undoMessage: isUnread ? 'Feed item marked as unread' : 'Feed item marked as read',
      undoFailureMessage: isUnread
        ? 'Error marking feed item as unread'
        : 'Error marking feed item as read',
      originalActionType: FeedItemActionType.MarkUnread,
    });
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

  const performAction: UndoableActionFn = async ({isActive}) => {
    const targetState = {[`tagIds.${SystemTagId.Starred}`]: isActive ? deleteField() : true};
    const undoState = {[`tagIds.${SystemTagId.Starred}`]: isActive ? true : deleteField()};

    return await performUpdateAndGetUndo({
      feedItemId: feedItem.feedItemId,
      targetState,
      undoState,
      feedItemsService,
      undoMessage: isStarred ? 'Feed item starred' : 'Feed item unstarred',
      undoFailureMessage: isStarred ? 'Error starring feed item' : 'Error unstarring feed item',
      originalActionType: FeedItemActionType.Star,
    });
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

  const performAction: UndoableActionFn = async () => {
    const updateResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
      importState: {
        ...feedItem.importState,
        lastImportRequestedTime: new Date(),
        shouldFetch: true,
      },
    } as Partial<FeedItem>);

    if (!updateResult.success) return updateResult;
    return makeSuccessResult(null);
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.RetryImport}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={noopFalse}
      disabled={feedItem.importState.status === FeedItemImportStatus.Processing}
      performAction={performAction}
      toastText="Feed item queued for re-import"
      errorMessage="Error queuing feed item for re-import"
    />
  );
};

const DebugSaveExampleActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getDebugSaveExampleFeedItemActionInfo();

  const performAction: UndoableActionFn = async () => {
    logger.log('DebugSaveExampleActionIcon action performed (TODO)', {
      feedItemId: feedItem.feedItemId,
    });

    return makeSuccessResult(null);
  };

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.DebugSaveExample}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={noopFalse}
      performAction={performAction}
      toastText="Feed item saved as example (TODO: Implement this)"
      errorMessage="Error saving feed item as example (TODO: Implement this)"
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
