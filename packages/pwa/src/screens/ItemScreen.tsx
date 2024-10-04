import {Params, useParams} from 'react-router-dom';

import {SavedItemId} from '../types/savedItems';

interface ItemScreenParams extends Params {
  readonly itemId: SavedItemId;
}

export const ItemScreen: React.FC = () => {
  const {itemId} = useParams<ItemScreenParams>();
  return <div>Item {itemId}</div>;
};
