import {SavedItem} from '@shared/types';
import {Link} from 'react-router-dom';

import {useFirestoreCollection} from '../lib/firebase';

export const HomeScreen: React.FC = () => {
  const {data: itemDocs, isLoading} = useFirestoreCollection('items');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (itemDocs.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {itemDocs.map((itemDoc) => {
        const item = itemDoc.data() as SavedItem;
        return (
          <li key={itemDoc.id}>
            <Link key={itemDoc.id} to={`/items/${itemDoc.id}`}>
              <p>{item.url}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
