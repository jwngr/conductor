import {useEffect, useMemo} from 'react';

import type {AsyncState} from '@shared/types/asyncState.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  clientUserFeedSubscriptionsCollectionService,
  ClientUserFeedSubscriptionsService,
} from '@sharedClient/services/userFeedSubscriptions.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

export function useUserFeedSubscriptionsService(): ClientUserFeedSubscriptionsService {
  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService();

  const userFeedSubscriptionsService = useMemo(() => {
    return new ClientUserFeedSubscriptionsService({
      accountId: loggedInAccount.accountId,
      functions: firebaseService.functions,
      eventLogService: eventLogService,
      userFeedSubscriptionsCollectionService: clientUserFeedSubscriptionsCollectionService,
    });
  }, [loggedInAccount.accountId, eventLogService]);

  return userFeedSubscriptionsService;
}

export function useUserFeedSubscription(
  userFeedSubscriptionId: UserFeedSubscriptionId
): AsyncState<UserFeedSubscription | null> {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const {asyncState, setPending, setError, setSuccess} =
    useAsyncState<UserFeedSubscription | null>();

  useEffect(() => {
    setPending();
    const unsubscribe = userFeedSubscriptionsService.watchSubscription({
      userFeedSubscriptionId,
      successCallback: setSuccess,
      errorCallback: setError,
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService, setPending, setError, setSuccess, userFeedSubscriptionId]);

  return asyncState;
}

export function useUserFeedSubscriptions(): AsyncState<UserFeedSubscription[]> {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<UserFeedSubscription[]>();

  useEffect(() => {
    setPending();
    const unsubscribe = userFeedSubscriptionsService.watchAllSubscriptions({
      successCallback: setSuccess,
      errorCallback: setError,
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService, setPending, setError, setSuccess]);

  return asyncState;
}
