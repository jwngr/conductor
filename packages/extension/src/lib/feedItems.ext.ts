import {collection} from 'firebase/firestore';
import {ref as storageRef} from 'firebase/storage';
import {useMemo} from 'react';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants';
import {FeedItemsService} from '@shared/lib/feedItems';

import {firebaseService} from '@sharedClient/lib/firebase.client';

import {useLoggedInUser} from '@sharedClient/hooks/auth.hooks';

const feedItemsDbRef = collection(firebaseService.firestore, FEED_ITEMS_DB_COLLECTION);
const importQueueDbRef = collection(firebaseService.firestore, IMPORT_QUEUE_DB_COLLECTION);
const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

export function useFeedItemsService(): FeedItemsService {
  const loggedInUser = useLoggedInUser();

  const feedItemsService = useMemo(() => {
    return new FeedItemsService(
      feedItemsDbRef,
      importQueueDbRef,
      feedItemsStorageRef,
      loggedInUser.userId
    );
  }, [loggedInUser]);

  return feedItemsService;
}
