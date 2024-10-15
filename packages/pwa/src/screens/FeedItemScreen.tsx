import {deleteField} from 'firebase/firestore';
import {useEffect, useRef} from 'react';
import {Navigate, Params, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {
  getMarkDoneFeedItemActionInfo,
  getMarkUnreadFeedItemActionInfo,
  getSaveFeedItemActionInfo,
  getStarFeedItemActionInfo,
} from '@shared/lib/feedItems';
import {FeedItemId, TriageStatus} from '@shared/types/core';
import {SystemTagId} from '@shared/types/tags';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {useFeedItem, useUpdateFeedItem} from '@src/lib/feedItems';

const FeedItemActionsWrapper = styled(FlexRow).attrs({gap: 12})``;

interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

const FeedItemScreenRouterWrapper: React.FC = () => {
  const {feedItemId} = useParams<FeedItemScreenParams>();

  if (!feedItemId) {
    // eslint-disable-next-line no-console
    console.warn('No feed item ID in URL');
    return <Navigate to="/" />;
  }

  return <FeedItemScreenInner feedItemId={feedItemId} />;
};

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const updateFeedItem = useUpdateFeedItem();
  const markDoneActionInfo = getMarkDoneFeedItemActionInfo();

  return (
    <ButtonIcon
      name={markDoneActionInfo.icon}
      size={40}
      onClick={async () => {
        try {
          await updateFeedItem(feedItemId, {triageStatus: TriageStatus.Done});
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
  const updateFeedItem = useUpdateFeedItem();
  const saveActionInfo = getSaveFeedItemActionInfo();

  return (
    <ButtonIcon
      name={saveActionInfo.icon}
      size={40}
      onClick={async () => {
        try {
          await updateFeedItem(feedItemId, {triageStatus: TriageStatus.Saved});
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
  const updateFeedItem = useUpdateFeedItem();
  const markUnreadActionInfo = getMarkUnreadFeedItemActionInfo();

  return (
    <ButtonIcon
      name={markUnreadActionInfo.icon}
      size={40}
      onClick={async () => {
        try {
          // TODO: Consider using a Firestore converter to handle this.
          // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await updateFeedItem(feedItemId, {[`tagIds.${SystemTagId.Unread}`]: true} as any);
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
  const updateFeedItem = useUpdateFeedItem();
  const starActionInfo = getStarFeedItemActionInfo();

  return (
    <ButtonIcon
      name={starActionInfo.icon}
      size={40}
      onClick={async () => {
        try {
          // TODO: Consider using a Firestore converter to handle this.
          // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await updateFeedItem(feedItemId, {[`tagIds.${SystemTagId.Starred}`]: true} as any);
        } catch (error) {
          // TODO: Show error toast.
          // eslint-disable-next-line no-console
          console.error('Error starring feed item:', {error});
        }
      }}
    />
  );
};

const FeedItemScreenInner: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const {item, isLoading} = useFeedItem(feedItemId);
  const updateFeedItem = useUpdateFeedItem();
  const alreadyMarkedRead = useRef(false);

  useEffect(() => {
    if (item === null) return;

    // Only mark the feed item as read once. This prevents the feed item from being marked as read
    // immediately after the user clicks the "Mark unread" button.
    if (alreadyMarkedRead.current) return;
    alreadyMarkedRead.current = true;

    updateFeedItem(feedItemId, {
      [`tagIds.${SystemTagId.Unread}`]: deleteField(),
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }, [item, feedItemId, updateFeedItem, alreadyMarkedRead]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!item) {
    // eslint-disable-next-line no-console
    console.warn('Invalid feed item ID in URL:', feedItemId);
    return <Navigate to="/" />;
  }

  return (
    <>
      <Text as="h1" bold>
        Feed item {feedItemId}
      </Text>
      <FeedItemActionsWrapper>
        <MarkDoneFeedItemActionIcon feedItemId={feedItemId} />
        <SaveFeedItemActionIcon feedItemId={feedItemId} />
        <MarkUnreadFeedItemActionIcon feedItemId={feedItemId} />
        <StarFeedItemActionIcon feedItemId={feedItemId} />
      </FeedItemActionsWrapper>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </>
  );
};

export const FeedItemScreen = FeedItemScreenRouterWrapper;
