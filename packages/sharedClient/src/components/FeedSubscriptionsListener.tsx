import {useEffect} from 'react';

import {useFeedSubscriptionsStore} from '@sharedClient/stores/FeedSubscriptionsStore';

import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

export const FeedSubscriptionsListener: React.FC<{
  readonly firebaseService: ClientFirebaseService;
}> = ({firebaseService}) => {
  const {registerService} = useFeedSubscriptionsStore();

  const {accountId} = useLoggedInAccount();
  const eventLogService = useEventLogService({firebaseService});

  useEffect(() => {
    const unsubscribe = registerService({accountId, firebaseService, eventLogService});
    return unsubscribe;
  }, [accountId, firebaseService, eventLogService, registerService]);

  return null;
};
