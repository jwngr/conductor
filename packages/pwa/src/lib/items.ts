import {FEED_ITEM_COLLECTION} from '@shared/lib/constants';
import {FeedItem, FeedItemId} from '@shared/types';
import {fromFilterOperator, ViewType} from '@shared/types/query';
import {collection, doc, query, updateDoc, where} from 'firebase/firestore';
import {useMemo} from 'react';

import {firestore, useFirestoreDoc, useFirestoreQuery} from './firebase';
import {Views} from './views';

interface UseFeedItemsArgs {
  readonly viewType: ViewType;
}

interface UseFeedItemsResult {
  readonly feedItems: FeedItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useFeedItems({viewType}: UseFeedItemsArgs): UseFeedItemsResult {
  // Construct Firestore queries from the view config.
  const itemsQuery = useMemo(() => {
    const viewConfig = Views.get(viewType);
    const whereClauses = viewConfig.filters.map((filter) =>
      where(filter.field, fromFilterOperator(filter.op), filter.value)
    );
    return query(
      collection(firestore, FEED_ITEM_COLLECTION),
      ...whereClauses
      // orderBy(viewConfig.sort.field, fromSortDirection(viewConfig.sort.direction))
    );
  }, [viewType]);

  // Fetch data from Firestore.
  const {data: itemDocs, isLoading, error} = useFirestoreQuery(itemsQuery);

  // Materialize Firestore documents as feed items.
  const feedItems = useMemo(
    () => itemDocs.map((itemDoc) => itemDoc.data() as FeedItem),
    [itemDocs]
  );

  return {feedItems, isLoading, error};
}

export function useFeedItem(itemId: FeedItemId): {
  readonly item: FeedItem | null;
  readonly isLoading: boolean;
} {
  const {data: itemDoc, isLoading} = useFirestoreDoc('feedItems', itemId);
  const item = useMemo(() => (itemDoc ? (itemDoc.data() as FeedItem) : null), [itemDoc]);
  return {item, isLoading};
}

export function useUpdateFeedItem(): (
  itemId: FeedItemId,
  item: Partial<FeedItem>
) => Promise<void> {
  return async (itemId, item) => {
    const itemDoc = doc(collection(firestore, FEED_ITEM_COLLECTION), itemId);
    await updateDoc(itemDoc, item);
  };
}
