import {collection} from 'firebase/firestore';
import {useEffect, useState} from 'react';

import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants';
import {EventLogService} from '@shared/lib/eventLog';

import {EventId, EventLogItem} from '@shared/types/eventLog.types';
import {ViewType} from '@shared/types/query.types';

import {useLoggedInUser} from '@src/lib/auth.pwa';
import {firebaseService} from '@src/lib/firebase.pwa';

// TODO: This is a somewhat arbitrary limit. Reconsider what the logic should be here.
const EVENT_LOG_LIMIT = 100;

const eventLogDbRef = collection(firebaseService.firestore, EVENT_LOG_DB_COLLECTION);

export const eventLogService = new EventLogService(eventLogDbRef);

export function useEventLogItem(eventId: EventId): {
  readonly eventLogItem: EventLogItem | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
} {
  const [state, setState] = useState<{
    readonly eventLogItem: EventLogItem | null;
    readonly isLoading: boolean;
    readonly error: Error | null;
  }>({eventLogItem: null, isLoading: true, error: null});

  useEffect(() => {
    const unsubscribe = eventLogService.watchEventLogItem(
      eventId,
      (eventLogItem) => setState({eventLogItem, isLoading: false, error: null}),
      (error) => setState({eventLogItem: null, isLoading: false, error})
    );
    return () => unsubscribe();
  }, [eventId]);

  return state;
}

export function useEventLogItems({viewType}: {readonly viewType: ViewType}): {
  readonly eventLogItems: EventLogItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly limit: number;
} {
  const [state, setState] = useState<{
    readonly eventLogItems: EventLogItem[];
    readonly isLoading: boolean;
    readonly error: Error | null;
    readonly limit: number;
  }>({eventLogItems: [], isLoading: true, error: null, limit: 0});
  const loggedInUser = useLoggedInUser();

  useEffect(() => {
    const unsubscribe = eventLogService.watchEventLog({
      userId: loggedInUser.userId,
      successCallback: (eventLogItems) =>
        setState({eventLogItems, isLoading: false, error: null, limit: EVENT_LOG_LIMIT}),
      errorCallback: (error) =>
        setState({eventLogItems: [], isLoading: false, error, limit: EVENT_LOG_LIMIT}),
    });
    return () => unsubscribe();
  }, [viewType, loggedInUser.userId]);

  return state;
}
