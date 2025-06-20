import {useEffect, useMemo} from 'react';

import type {AsyncState} from '@shared/types/asyncState.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';
import {ClientUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

export function useUserFeedSubscriptionsService(args: {
  readonly firebaseService: ClientFirebaseService;
}): ClientUserFeedSubscriptionsService {
  const {firebaseService} = args;

  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService({firebaseService});

  const userFeedSubscriptionsService = useMemo(() => {
    return new ClientUserFeedSubscriptionsService({
      accountId: loggedInAccount.accountId,
      firebaseService,
      eventLogService,
    });
  }, [loggedInAccount.accountId, eventLogService, firebaseService]);

  return userFeedSubscriptionsService;
}

export function useUserFeedSubscription(args: {
  readonly firebaseService: ClientFirebaseService;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}): AsyncState<UserFeedSubscription | null> {
  const {firebaseService, userFeedSubscriptionId} = args;

  const userFeedSubscriptionsService = useUserFeedSubscriptionsService({firebaseService});

  const {asyncState, setPending, setError, setSuccess} =
    useAsyncState<UserFeedSubscription | null>();

  useEffect(() => {
    setPending();
    const unsubscribe = userFeedSubscriptionsService.watchSubscription({
      userFeedSubscriptionId,
      onData: setSuccess,
      onError: setError,
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService, setPending, setError, setSuccess, userFeedSubscriptionId]);

  return asyncState;
}

export function useLoggedInUserFeedSubscriptions(args: {
  readonly firebaseService: ClientFirebaseService;
}): AsyncState<Record<UserFeedSubscriptionId, UserFeedSubscription>> {
  const {firebaseService} = args;

  const userFeedSubscriptionsService = useUserFeedSubscriptionsService({firebaseService});

  const {asyncState, setPending, setError, setSuccess} =
    useAsyncState<Record<UserFeedSubscriptionId, UserFeedSubscription>>();

  useEffect(() => {
    setPending();
    const unsubscribe = userFeedSubscriptionsService.watchAllSubscriptions({
      onData: setSuccess,
      onError: setError,
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService, setPending, setError, setSuccess]);

  return asyncState;
}
