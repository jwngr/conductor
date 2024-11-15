import React from 'react';

import {
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
import {keyboardShortcutsService} from '@src/lib/shortcuts.pwa';
import {ToastType, useToast} from '@src/lib/toasts';

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const {showToast} = useToast();
  const markDoneActionInfo = getMarkDoneFeedItemActionInfo();

  const handleMarkDoneFeedItem = async () => {
    const handleMarkDoneFeedItemResult = await feedItemsService.updateFeedItem(
      feedItem.feedItemId,
      {
        triageStatus: TriageStatus.Done,
      }
    );

    if (!handleMarkDoneFeedItemResult.success) {
      const errorMessagePrefix = 'Error marking feed item as done';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleMarkDoneFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleMarkDoneFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    // TODO: Update based on if already done.
    showToast({message: 'Feed item marked as done'});
  };

  return (
    <ButtonIcon
      name={markDoneActionInfo.icon}
      tooltip={markDoneActionInfo.text}
      size={40}
      shortcut={keyboardShortcutsService.forToggleDone(feedItem)}
      onClick={handleMarkDoneFeedItem}
    />
  );
};

const SaveFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const saveActionInfo = getSaveFeedItemActionInfo();
  const {showToast} = useToast();

  const handleSaveFeedItem = async () => {
    const handleSaveFeedItemResult = await feedItemsService.updateFeedItem(feedItem.feedItemId, {
      triageStatus: TriageStatus.Saved,
    });

    if (!handleSaveFeedItemResult.success) {
      const errorMessagePrefix = 'Error saving feed item';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleSaveFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleSaveFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    // TODO: Update based on if already saved.
    showToast({message: 'Feed item saved'});
  };

  return (
    <ButtonIcon
      name={saveActionInfo.icon}
      tooltip={saveActionInfo.text}
      size={40}
      onClick={handleSaveFeedItem}
      shortcut={keyboardShortcutsService.forToggleSaved(feedItem)}
    />
  );
};

const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const {showToast} = useToast();
  const markUnreadActionInfo = getMarkUnreadFeedItemActionInfo();

  const handleMarkUnreadFeedItem = async () => {
    const handleMarkUnreadFeedItemResult =
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      await feedItemsService.updateFeedItem(feedItem.feedItemId, {
        [`tagIds.${SystemTagId.Unread}`]: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    if (!handleMarkUnreadFeedItemResult.success) {
      const errorMessagePrefix = 'Error marking feed item as unread';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleMarkUnreadFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleMarkUnreadFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    // TODO: Update based on if already unread.
    showToast({message: 'Feed item marked as unread'});
  };

  return (
    <ButtonIcon
      name={markUnreadActionInfo.icon}
      tooltip={markUnreadActionInfo.text}
      size={40}
      onClick={handleMarkUnreadFeedItem}
      shortcut={keyboardShortcutsService.forToggleUnread(feedItem)}
    />
  );
};

const StarFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const {showToast} = useToast();
  const starActionInfo = getStarFeedItemActionInfo();

  const handleStarFeedItem = async () => {
    const handleStarFeedItemResult =
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      await feedItemsService.updateFeedItem(feedItem.feedItemId, {
        [`tagIds.${SystemTagId.Starred}`]: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    if (!handleStarFeedItemResult.success) {
      const errorMessagePrefix = 'Error starring feed item';
      showToast({
        type: ToastType.Error,
        message: `${errorMessagePrefix}: ${handleStarFeedItemResult.error.message}`,
      });
      logger.error(errorMessagePrefix, {
        error: handleStarFeedItemResult.error,
        feedItemId: feedItem.feedItemId,
      });
      return;
    }

    // TODO: Update based on if already starred.
    showToast({message: 'Feed item starred'});
  };

  return (
    <ButtonIcon
      name={starActionInfo.icon}
      tooltip={starActionInfo.text}
      size={40}
      onClick={handleStarFeedItem}
      shortcut={keyboardShortcutsService.forToggleStarred(feedItem)}
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
