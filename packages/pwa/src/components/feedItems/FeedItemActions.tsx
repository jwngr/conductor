import {deleteField} from 'firebase/firestore';
import React from 'react';

import {
  FeedItemsService,
  getMarkDoneFeedItemActionInfo,
  getMarkUnreadFeedItemActionInfo,
  getSaveFeedItemActionInfo,
  getStarFeedItemActionInfo,
} from '@shared/lib/feedItems';
import {logger} from '@shared/lib/logger';

import {FeedItem, FeedItemActionType, TriageStatus} from '@shared/types/feedItems.types';
import {IconName} from '@shared/types/icons.types';
import {Result} from '@shared/types/result.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import {AsyncFunc, Func} from '@shared/types/utils.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';

import {useLoggedInUser} from '@src/lib/auth.pwa';
import {eventLogService} from '@src/lib/eventLog.pwa';
import {feedItemsService} from '@src/lib/feedItems.pwa';
import {useToast} from '@src/lib/toasts';

interface GenericFeedItemActionIconProps {
  readonly feedItem: FeedItem;
  readonly feedItemActionType: FeedItemActionType;
  readonly icon: IconName;
  readonly tooltip: string;
  readonly shortcutId?: KeyboardShortcutId;
  readonly getIsActive: Func<FeedItem, boolean>;
  readonly onAction: AsyncFunc<boolean, Result<void>>;
  readonly toastText: string;
  readonly errorMessage: string;
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
}) => {
  const loggedInUser = useLoggedInUser();
  const {showToast, showErrorToast} = useToast();

  const handleAction = async () => {
    const isCurrentlyActive = getIsActive(feedItem);
    const result = await onAction(isCurrentlyActive);

    if (result.success) {
      showToast({message: toastText});
      eventLogService.logFeedItemActionEvent({
        userId: loggedInUser.userId,
        feedItemId: feedItem.feedItemId,
        feedItemActionType,
      });
      return;
    }

    showErrorToast({message: `${errorMessage}: ${result.error.message}`});
    logger.error(errorMessage, {error: result.error, feedItemId: feedItem.feedItemId});
  };

  return (
    <ButtonIcon
      name={icon}
      tooltip={tooltip}
      size={40}
      onClick={handleAction}
      shortcutId={shortcutId}
    />
  );
};

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = getMarkDoneFeedItemActionInfo(feedItem);
  const isDone = FeedItemsService.isMarkedDone(feedItem);

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.MarkDone}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={FeedItemsService.isMarkedDone}
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
  const actionInfo = getSaveFeedItemActionInfo(feedItem);
  const isSaved = FeedItemsService.isSaved(feedItem);

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.Save}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={FeedItemsService.isSaved}
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
  const actionInfo = getMarkUnreadFeedItemActionInfo(feedItem);
  const isUnread = FeedItemsService.isUnread(feedItem);

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.MarkUnread}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={FeedItemsService.isUnread}
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
  const actionInfo = getStarFeedItemActionInfo(feedItem);
  const isStarred = FeedItemsService.isStarred(feedItem);

  return (
    <GenericFeedItemActionIcon
      feedItem={feedItem}
      feedItemActionType={FeedItemActionType.Star}
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      getIsActive={FeedItemsService.isStarred}
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

export const FeedItemActions: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  return (
    <FlexRow gap={12}>
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <StarFeedItemActionIcon feedItem={feedItem} />
    </FlexRow>
  );
};
