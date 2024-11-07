import React from 'react';

import {
  feedItemsService,
  getMarkDoneFeedItemActionInfo,
  getMarkUnreadFeedItemActionInfo,
  getSaveFeedItemActionInfo,
  getStarFeedItemActionInfo,
} from '@shared/services/feedItemsService';

import {FeedItemId, TriageStatus} from '@shared/types/feedItems';
import {SystemTagId} from '@shared/types/tags';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const markDoneActionInfo = getMarkDoneFeedItemActionInfo();

  return (
    <ButtonIcon
      name={markDoneActionInfo.icon}
      tooltip={markDoneActionInfo.text}
      size={40}
      onClick={async () => {
        try {
          await feedItemsService.updateFeedItem(feedItemId, {triageStatus: TriageStatus.Done});
        } catch (error) {
          // TODO: Show error toast.
          // eslint-disable-next-line no-console
          console.error('Error marking feed item as done:', {error});
        }
      }}
    />
  );
};

const SaveFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const saveActionInfo = getSaveFeedItemActionInfo();

  return (
    <ButtonIcon
      name={saveActionInfo.icon}
      tooltip={saveActionInfo.text}
      size={40}
      onClick={async () => {
        try {
          await feedItemsService.updateFeedItem(feedItemId, {triageStatus: TriageStatus.Saved});
        } catch (error) {
          // TODO: Show error toast.
          // eslint-disable-next-line no-console
          console.error('Error saving feed item:', {error});
        }
      }}
    />
  );
};

const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const markUnreadActionInfo = getMarkUnreadFeedItemActionInfo();

  return (
    <ButtonIcon
      name={markUnreadActionInfo.icon}
      tooltip={markUnreadActionInfo.text}
      size={40}
      onClick={async () => {
        try {
          // TODO: Consider using a Firestore converter to handle this.
          // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
          await feedItemsService.updateFeedItem(feedItemId, {
            [`tagIds.${SystemTagId.Unread}`]: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        } catch (error) {
          // TODO: Show error toast.
          // eslint-disable-next-line no-console
          console.error('Error marking feed item as unread:', {error});
        }
      }}
    />
  );
};

const StarFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const starActionInfo = getStarFeedItemActionInfo();

  return (
    <ButtonIcon
      name={starActionInfo.icon}
      tooltip={starActionInfo.text}
      size={40}
      onClick={async () => {
        try {
          // TODO: Consider using a Firestore converter to handle this.
          // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
          await feedItemsService.updateFeedItem(feedItemId, {
            [`tagIds.${SystemTagId.Starred}`]: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        } catch (error) {
          // TODO: Show error toast.
          // eslint-disable-next-line no-console
          console.error('Error starring feed item:', {error});
        }
      }}
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
