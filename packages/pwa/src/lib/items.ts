import {FEED_ITEM_COLLECTION} from '@shared/lib/constants';
import {FeedItem, FeedItemId} from '@shared/types';
import {collection, orderBy, query} from 'firebase/firestore';
import {useMemo} from 'react';

import {firestore, useFirestoreDoc, useFirestoreQuery} from './firebase';

export function useFeedItems(): {
  readonly feedItems: FeedItem[];
  readonly isLoading: boolean;
} {
  const itemsQuery = useMemo(
    () => query(collection(firestore, FEED_ITEM_COLLECTION), orderBy('createdAt', 'desc')),
    []
  );
  const {data: itemDocs, isLoading} = useFirestoreQuery(itemsQuery);
  const feedItems = useMemo(
    () => itemDocs.map((itemDoc) => itemDoc.data() as FeedItem),
    [itemDocs]
  );
  return {feedItems, isLoading};
}

export function useFeedItem(itemId: FeedItemId): {
  readonly item: FeedItem | null;
  readonly isLoading: boolean;
} {
  const {data: itemDoc, isLoading} = useFirestoreDoc('feedItems', itemId);
  const item = useMemo(() => (itemDoc ? (itemDoc.data() as FeedItem) : null), [itemDoc]);
  return {item, isLoading};
}
