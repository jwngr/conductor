import {SavedItemId} from '@shared/types';
import {Navigate, Params, useParams} from 'react-router-dom';

import {useItem} from '../lib/items';

interface ItemScreenParams extends Params {
  readonly itemId: SavedItemId;
}

const ItemScreenRouterWrapper: React.FC = () => {
  const {itemId} = useParams<ItemScreenParams>();

  if (!itemId) {
    // eslint-disable-next-line no-console
    console.warn('No item ID provided to `/items` route');
    return <Navigate to="/" />;
  }

  return <ItemScreenInner itemId={itemId} />;
};

const ItemScreenInner: React.FC<{
  readonly itemId: SavedItemId;
}> = ({itemId}) => {
  const {item, isLoading} = useItem(itemId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!item) {
    // eslint-disable-next-line no-console
    console.warn('Invalid item ID provided to `/items` route:', itemId);
    return <Navigate to="/" />;
  }

  return (
    <>
      <div>Item {itemId}</div>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </>
  );
};

export const ItemScreen = ItemScreenRouterWrapper;
