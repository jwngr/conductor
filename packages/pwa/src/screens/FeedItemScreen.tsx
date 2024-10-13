import {useEffect} from 'react';
import {Navigate, Params, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {FeedItemId} from '@shared/types/core';
import {IconName} from '@shared/types/icons';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {Text} from '@src/components/atoms/Text';
import {useFeedItem, useUpdateFeedItem} from '@src/lib/items';

const FeedItemActionsWrapper = styled.div`
  border: solid 1px red;
`;

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

const MarkDoneFeedItemActionIcon: React.FC = () => {
  return (
    <ButtonIcon
      name={IconName.MarkDone}
      size={40}
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log('Mark done');
      }}
    />
  );
};

const FeedItemScreenInner: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const {item, isLoading} = useFeedItem(feedItemId);
  const updateFeedItem = useUpdateFeedItem();

  useEffect(() => {
    if (!item) return;
    updateFeedItem(feedItemId, {isRead: true});
  }, [item, feedItemId, updateFeedItem]);

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
        <MarkDoneFeedItemActionIcon />
      </FeedItemActionsWrapper>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </>
  );
};

export const FeedItemScreen = FeedItemScreenRouterWrapper;
