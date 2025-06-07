import {useEffect, useMemo} from 'react';

import type {AsyncState} from '@shared/types/asyncState.types';
import {Environment} from '@shared/types/environment.types';
import type {EventLogItem} from '@shared/types/eventLog.types';

import {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

// TODO: This is a somewhat arbitrary limit. Reconsider what the logic should be here.
const EVENT_LOG_LIMIT = 100;

export function useEventLogService(args: {
  readonly firebaseService: ClientFirebaseService;
}): ClientEventLogService {
  const {firebaseService} = args;

  const loggedInAccount = useLoggedInAccount();

  const eventLogService = useMemo(() => {
    return new ClientEventLogService({
      environment: Environment.PWA,
      accountId: loggedInAccount.accountId,
      firebaseService,
    });
  }, [loggedInAccount.accountId, firebaseService]);

  return eventLogService;
}

export function useEventLogItems(args: {
  readonly firebaseService: ClientFirebaseService;
}): AsyncState<EventLogItem[]> {
  const {firebaseService} = args;

  const eventLogService = useEventLogService({firebaseService});

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<EventLogItem[]>();

  useEffect(() => {
    setPending();
    const unsubscribe = eventLogService.watchEventLog({
      successCallback: (eventLogItems) => setSuccess(eventLogItems),
      errorCallback: (error) => setError(error),
      limit: EVENT_LOG_LIMIT,
    });
    return () => unsubscribe();
  }, [eventLogService, setPending, setError, setSuccess]);

  return asyncState;
}
