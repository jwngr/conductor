import {FeedItemId} from '@shared/types/core';
import {useFeedItem, useUpdateFeedItem} from '@src/lib/items';
import {useEffect} from 'react';
import {Navigate, Params, useParams} from 'react-router-dom';

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
      <div>Feed item {feedItemId}</div>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </>
  );
};

export const FeedItemScreen = FeedItemScreenRouterWrapper;
