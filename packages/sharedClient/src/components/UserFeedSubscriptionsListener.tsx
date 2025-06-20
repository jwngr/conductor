import {useEffect} from 'react';

import {useUserFeedSubscriptionsStore} from '@sharedClient/stores/UserFeedSubscriptionsStore';

import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

export const UserFeedSubscriptionsListener: React.FC<{
  readonly firebaseService: ClientFirebaseService;
}> = ({firebaseService}) => {
  const {registerService} = useUserFeedSubscriptionsStore();

  const {accountId} = useLoggedInAccount();
  const eventLogService = useEventLogService({firebaseService});

  useEffect(() => {
    const unsubscribe = registerService({accountId, firebaseService, eventLogService});
    return unsubscribe;
  }, [accountId, firebaseService, eventLogService, registerService]);

  return null;
};
