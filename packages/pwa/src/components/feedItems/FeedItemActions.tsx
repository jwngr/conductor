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

import {FeedItem, TriageStatus} from '@shared/types/feedItems.types';
import {SystemTagId} from '@shared/types/tags.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';

import {feedItemsService} from '@src/lib/feedItems.pwa';
import {ToastType, useToast} from '@src/lib/toasts';

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const {showToast} = useToast();
  const markDoneActionInfo = getMarkDoneFeedItemActionInfo(feedItem);

  const handleToggleDoneFeedItem = async () => {
    const isAlreadyDone = FeedItemsService.isMarkedDone(feedItem);

    const handleToggleDoneFeedItemResult = await feedItemsService.updateFeedItem(
      feedItem.feedItemId,
      {
        triageStatus: isAlreadyDone ? TriageStatus.Untriaged : TriageStatus.Done,
      }
    );

    if (!handleToggleDoneFeedItemResult.success) {
      const errorMessagePrefix = isAlreadyDone
        ? 'Error marking feed item as undone'
        : 'Error marking feed item as done';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleToggleDoneFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleToggleDoneFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    showToast({message: isAlreadyDone ? 'Feed item marked as undone' : 'Feed item marked as done'});
  };

  return (
    <ButtonIcon
      name={markDoneActionInfo.icon}
      tooltip={markDoneActionInfo.text}
      size={40}
      shortcutId={markDoneActionInfo.shortcutId}
      onClick={handleToggleDoneFeedItem}
    />
  );
};

const SaveFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const saveActionInfo = getSaveFeedItemActionInfo(feedItem);
  const {showToast} = useToast();

  const handleToggleSavedFeedItem = async () => {
    const isAlreadySaved = FeedItemsService.isSaved(feedItem);

    const handleToggleSavedFeedItemResult = await feedItemsService.updateFeedItem(
      feedItem.feedItemId,
      {
        triageStatus: isAlreadySaved ? TriageStatus.Untriaged : TriageStatus.Saved,
      }
    );

    if (!handleToggleSavedFeedItemResult.success) {
      const errorMessagePrefix = isAlreadySaved
        ? 'Error unsaving feed item'
        : 'Error saving feed item';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleToggleSavedFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleToggleSavedFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    showToast({message: isAlreadySaved ? 'Feed item unsaved' : 'Feed item saved'});
  };

  return (
    <ButtonIcon
      name={saveActionInfo.icon}
      tooltip={saveActionInfo.text}
      size={40}
      onClick={handleToggleSavedFeedItem}
      shortcutId={saveActionInfo.shortcutId}
    />
  );
};

const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const {showToast} = useToast();
  const markUnreadActionInfo = getMarkUnreadFeedItemActionInfo(feedItem);

  const handleToggleUnreadFeedItem = async () => {
    const isAlreadyUnread = FeedItemsService.isUnread(feedItem);

    const handleToggleUnreadFeedItemResult =
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      await feedItemsService.updateFeedItem(feedItem.feedItemId, {
        [`tagIds.${SystemTagId.Unread}`]: isAlreadyUnread ? deleteField() : true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    if (!handleToggleUnreadFeedItemResult.success) {
      const errorMessagePrefix = 'Error marking feed item as unread';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleToggleUnreadFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleToggleUnreadFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    showToast({
      message: isAlreadyUnread ? 'Feed item marked as read' : 'Feed item marked as unread',
    });
  };

  return (
    <ButtonIcon
      name={markUnreadActionInfo.icon}
      tooltip={markUnreadActionInfo.text}
      size={40}
      onClick={handleToggleUnreadFeedItem}
      shortcutId={markUnreadActionInfo.shortcutId}
    />
  );
};

const StarFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const {showToast} = useToast();
  const starActionInfo = getStarFeedItemActionInfo(feedItem);

  const handleToggleStarFeedItem = async () => {
    const isAlreadyStarred = FeedItemsService.isStarred(feedItem);

    const handleToggleStarFeedItemResult =
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      await feedItemsService.updateFeedItem(feedItem.feedItemId, {
        [`tagIds.${SystemTagId.Starred}`]: isAlreadyStarred ? deleteField() : true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    if (!handleToggleStarFeedItemResult.success) {
      const errorMessagePrefix = isAlreadyStarred
        ? 'Error unstarring feed item'
        : 'Error starring feed item';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleToggleStarFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleToggleStarFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    showToast({message: isAlreadyStarred ? 'Feed item unstarred' : 'Feed item starred'});
  };

  return (
    <ButtonIcon
      name={starActionInfo.icon}
      tooltip={starActionInfo.text}
      size={40}
      onClick={handleToggleStarFeedItem}
      shortcutId={starActionInfo.shortcutId}
    />
  );
};

export const FeedItemActions: React.FC<{feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <FlexRow gap={12}>
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <StarFeedItemActionIcon feedItem={feedItem} />
    </FlexRow>
  );
};
