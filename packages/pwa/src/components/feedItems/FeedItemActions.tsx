import {deleteField} from 'firebase/firestore';
import type React from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import {
  FeedItemActionType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';
import type {IconName} from '@shared/types/icons.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {Func} from '@shared/types/utils.types';

import {useEventLogService} from '@sharedClient/services/eventLog.client';
import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';

import {toast} from '@src/lib/toasts';

interface GenericFeedItemActionIconProps {
  readonly feedItem: FeedItem;
  readonly feedItemActionType: FeedItemActionType;
  readonly icon: IconName;
  readonly tooltip: string;
  readonly shortcutId?: KeyboardShortcutId;
  readonly getIsActive: Func<FeedItem, boolean>;
  readonly onAction: Func<boolean, AsyncResult<void>>;
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
  onAction,
  toastText,
  errorMessage,
  disabled,
}) => {
  const {feedItemId} = feedItem;
  const eventLogService = useEventLogService();

  const handleAction = async (): Promise<void> => {
    if (disabled) {
      return;
    }

    const isCurrentlyActive = getIsActive(feedItem);
    const result = await onAction(isCurrentlyActive);

    if (result.success) {
      toast(toastText);
      void eventLogService.logFeedItemActionEvent({feedItemId, feedItemActionType});
      return;
    }

    toast.error(errorMessage, {description: result.error.message});
    logger.error(prefixError(result.error, errorMessage), {feedItemId: feedItem.feedItemId});
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

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.MarkDone}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isMarkedDone}
      onAction={async (isActive) => {
        const result = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
          triageStatus: isActive ? TriageStatus.Untriaged : TriageStatus.Done,
        });
        return result;
      }}
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

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.Save}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isSaved}
      onAction={async (isActive) => {
        const result = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
          triageStatus: isActive ? TriageStatus.Untriaged : TriageStatus.Saved,
        });
        return result;
      }}
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

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.MarkUnread}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isUnread}
      onAction={async (isActive) => {
        const result = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
          [`tagIds.${SystemTagId.Unread}`]: isActive ? deleteField() : true,
        } as Partial<FeedItem>);
        return result;
      }}
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

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.Star}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isStarred}
      onAction={async (isActive) => {
        const result = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
          [`tagIds.${SystemTagId.Starred}`]: isActive ? deleteField() : true,
        } as Partial<FeedItem>);
        return result;
      }}
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

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.RetryImport}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={() => false}
      disabled={feedItem.importState.status === FeedItemImportStatus.Processing}
      onAction={async () => {
        const result = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
          importState: {
            ...feedItem.importState,
            shouldFetch: true,
          },
        } as Partial<FeedItem>);
        return result;
      }}
      toastText={'Feed item queued for re-import'}
      errorMessage={'Error queuing feed item for re-import'}
    />
  );
};

const DebugSaveExampleActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getDebugSaveExampleFeedItemActionInfo();

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.DebugSaveExample}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={SharedFeedItemHelpers.isStarred}
      onAction={async () => {
        // TODO: Implement this.
        return makeSuccessResult(undefined);
      }}
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
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <StarFeedItemActionIcon feedItem={feedItem} />
      <DebugSaveExampleActionIcon feedItem={feedItem} />
      <RetryImportActionIcon feedItem={feedItem} />
    </div>
  );
};
