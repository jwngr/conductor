import {useEffect, useMemo} from 'react';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AsyncState} from '@shared/types/asyncState.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import {useEventLogService} from '@sharedClient/services/eventLog.client';
import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';
import {ClientUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

const userFeedSubscriptionFirestoreConverter = makeFirestoreDataConverter(
  toStorageUserFeedSubscription,
  parseUserFeedSubscription
);

const userFeedSubscriptionsCollectionService = new ClientFirestoreCollectionService({
  collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
  converter: userFeedSubscriptionFirestoreConverter,
  parseId: parseUserFeedSubscriptionId,
});

export function useUserFeedSubscriptionsService(): ClientUserFeedSubscriptionsService {
  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService();

  const userFeedSubscriptionsService = useMemo(() => {
    return new ClientUserFeedSubscriptionsService({
      accountId: loggedInAccount.accountId,
      functions: firebaseService.functions,
      eventLogService: eventLogService,
      userFeedSubscriptionsCollectionService,
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
