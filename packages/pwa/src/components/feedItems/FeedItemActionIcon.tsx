import {
  getMarkDoneFeedItemActionInfo,
  getMarkUnreadFeedItemActionInfo,
  getSaveFeedItemActionInfo,
  getStarFeedItemActionInfo,
} from '@shared/lib/feedItems';
import {feedItemsService} from '@shared/lib/feedItemsServiceInstance';
import {FeedItemId, TriageStatus} from '@shared/types/feedItems';
import {SystemTagId} from '@shared/types/tags';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';

export const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const markDoneActionInfo = getMarkDoneFeedItemActionInfo();

  return (
    <ButtonIcon
      name={markDoneActionInfo.icon}
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

export const SaveFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const saveActionInfo = getSaveFeedItemActionInfo();

  return (
    <ButtonIcon
      name={saveActionInfo.icon}
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

export const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const markUnreadActionInfo = getMarkUnreadFeedItemActionInfo();

  return (
    <ButtonIcon
      name={markUnreadActionInfo.icon}
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

export const StarFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const starActionInfo = getStarFeedItemActionInfo();

  return (
    <ButtonIcon
      name={starActionInfo.icon}
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
