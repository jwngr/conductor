import React from 'react';

import {
  getMarkDoneFeedItemActionInfo,
  getMarkUnreadFeedItemActionInfo,
  getSaveFeedItemActionInfo,
  getStarFeedItemActionInfo,
} from '@shared/lib/feedItems';
import {logger} from '@shared/lib/logger';

import {FeedItemId, TriageStatus} from '@shared/types/feedItems.types';
import {SystemTagId} from '@shared/types/tags.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';

import {feedItemsService} from '@src/lib/feedItems.pwa';

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const markDoneActionInfo = getMarkDoneFeedItemActionInfo();

  const handleMarkDoneFeedItem = async () => {
    const handleMarkDoneFeedItemResult = await feedItemsService.updateFeedItem(feedItemId, {
      triageStatus: TriageStatus.Done,
    });
    if (!handleMarkDoneFeedItemResult.success) {
      // TODO: Show error toast.
      logger.error('Error marking feed item as done:', {
        error: handleMarkDoneFeedItemResult.error,
        feedItemId,
      });
    }
  };

  return (
    <ButtonIcon
      name={markDoneActionInfo.icon}
      tooltip={markDoneActionInfo.text}
      size={40}
      onClick={handleMarkDoneFeedItem}
    />
  );
};

const SaveFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const saveActionInfo = getSaveFeedItemActionInfo();

  const handleSaveFeedItem = async () => {
    const handleSaveFeedItemResult = await feedItemsService.updateFeedItem(feedItemId, {
      triageStatus: TriageStatus.Saved,
    });
    if (!handleSaveFeedItemResult.success) {
      // TODO: Show error toast.
      logger.error('Error saving feed item:', {error: handleSaveFeedItemResult.error, feedItemId});
    }
  };

  return (
    <ButtonIcon
      name={saveActionInfo.icon}
      tooltip={saveActionInfo.text}
      size={40}
      onClick={handleSaveFeedItem}
    />
  );
};

const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const markUnreadActionInfo = getMarkUnreadFeedItemActionInfo();

  const handleMarkUnreadFeedItem = async () => {
    const handleMarkUnreadFeedItemResult =
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      await feedItemsService.updateFeedItem(feedItemId, {
        [`tagIds.${SystemTagId.Unread}`]: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    if (!handleMarkUnreadFeedItemResult.success) {
      // TODO: Show error toast.
      logger.error('Error marking feed item as unread:', {
        error: handleMarkUnreadFeedItemResult.error,
        feedItemId,
      });
    }
  };

  return (
    <ButtonIcon
      name={markUnreadActionInfo.icon}
      tooltip={markUnreadActionInfo.text}
      size={40}
      onClick={handleMarkUnreadFeedItem}
    />
  );
};

const StarFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const starActionInfo = getStarFeedItemActionInfo();

  const handleStarFeedItem = async () => {
    const handleStarFeedItemResult =
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      await feedItemsService.updateFeedItem(feedItemId, {
        [`tagIds.${SystemTagId.Starred}`]: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    if (!handleStarFeedItemResult.success) {
      // TODO: Show error toast.
      logger.error('Error starring feed item:', {
        error: handleStarFeedItemResult.error,
        feedItemId,
      });
      return;
    }
  };

  return (
    <ButtonIcon
      name={starActionInfo.icon}
      tooltip={starActionInfo.text}
      size={40}
      onClick={handleStarFeedItem}
    />
  );
};

export const FeedItemActions: React.FC<{feedItemId: FeedItemId}> = ({feedItemId}) => {
  return (
    <FlexRow gap={12}>
      <MarkDoneFeedItemActionIcon feedItemId={feedItemId} />
      <SaveFeedItemActionIcon feedItemId={feedItemId} />
      <MarkUnreadFeedItemActionIcon feedItemId={feedItemId} />
      <StarFeedItemActionIcon feedItemId={feedItemId} />
    </FlexRow>
  );
};
