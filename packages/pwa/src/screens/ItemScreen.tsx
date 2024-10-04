import {FeedItemId} from '@shared/types';
import {Navigate, Params, useParams} from 'react-router-dom';

import {useFeedItem} from '../lib/items';

interface ItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

const ItemScreenRouterWrapper: React.FC = () => {
  const {feedItemId} = useParams<ItemScreenParams>();

  if (!feedItemId) {
    // eslint-disable-next-line no-console
    console.warn('No feed item ID in URL');
    return <Navigate to="/" />;
  }

  return <ItemScreenInner feedItemId={feedItemId} />;
};

const ItemScreenInner: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const {item, isLoading} = useFeedItem(feedItemId);

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

export const ItemScreen = ItemScreenRouterWrapper;
