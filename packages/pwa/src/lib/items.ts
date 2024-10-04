import {SavedItem, SavedItemId} from '@shared/types';
import {collection, orderBy, query} from 'firebase/firestore';
import {useMemo} from 'react';

import {firestore, useFirestoreDoc, useFirestoreQuery} from './firebase';

export function useItems(): {
  readonly items: SavedItem[];
  readonly isLoading: boolean;
} {
  const itemsQuery = query(collection(firestore, 'items'), orderBy('createdAt', 'desc'));
  const {data: itemDocs, isLoading} = useFirestoreQuery(itemsQuery);
  const items = useMemo(
    () => itemDocs.map((itemDoc) => ({id: itemDoc.id, ...itemDoc.data()}) as SavedItem),
    [itemDocs]
  );
  return {items, isLoading};
}

export function useItem(itemId: SavedItemId): {
  readonly item: SavedItem | null;
  readonly isLoading: boolean;
} {
  const {data: itemDoc, isLoading} = useFirestoreDoc('items', itemId);
  const item = useMemo(
    () => (itemDoc ? ({id: itemDoc.id, ...itemDoc.data()} as SavedItem) : null),
    [itemDoc]
  );
  return {item, isLoading};
}
