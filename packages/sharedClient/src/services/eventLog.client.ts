import {collection} from 'firebase/firestore';
import {useEffect, useMemo, useState} from 'react';

import {SharedEventLogService} from '@shared/services/eventLog.shared';

import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';

import type {EventId, EventLogItem} from '@shared/types/eventLog.types';
import type {ViewType} from '@shared/types/query.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

import {useLoggedInUser} from '@sharedClient/hooks/auth.hooks';

// TODO: This is a somewhat arbitrary limit. Reconsider what the logic should be here.
const EVENT_LOG_LIMIT = 100;

const eventLogDbRef = collection(firebaseService.firestore, EVENT_LOG_DB_COLLECTION);

export const useEventLogService = () => {
  const loggedInUser = useLoggedInUser();

  const eventLogService = useMemo(
    () => new SharedEventLogService({eventLogDbRef, userId: loggedInUser.userId}),
    [loggedInUser.userId]
  );

  return eventLogService;
};

interface EventLogItemState {
  readonly eventLogItem: EventLogItem | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

// TODO: Ideally these hooks would live in the `shared` package.
export function useEventLogItem(eventId: EventId): EventLogItemState {
  const eventLogService = useEventLogService();

  const [state, setState] = useState<EventLogItemState>({
    eventLogItem: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = eventLogService.watchEventLogItem(
      eventId,
      (eventLogItem) => setState({eventLogItem, isLoading: false, error: null}),
      (error) => setState({eventLogItem: null, isLoading: false, error})
    );
    return () => unsubscribe();
  }, [eventId, eventLogService]);

  return state;
}

interface EventLogItemsState {
  readonly eventLogItems: EventLogItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly limit: number;
}

export function useEventLogItems({viewType}: {readonly viewType: ViewType}): EventLogItemsState {
  const eventLogService = useEventLogService();

  const [state, setState] = useState<EventLogItemsState>({
    eventLogItems: [],
    isLoading: true,
    error: null,
    limit: 0,
  });

  useEffect(() => {
    const unsubscribe = eventLogService.watchEventLog({
      successCallback: (eventLogItems) =>
        setState({eventLogItems, isLoading: false, error: null, limit: EVENT_LOG_LIMIT}),
      errorCallback: (error) =>
        setState({eventLogItems: [], isLoading: false, error, limit: EVENT_LOG_LIMIT}),
    });
    return () => unsubscribe();
  }, [viewType, eventLogService]);

  return state;
}
