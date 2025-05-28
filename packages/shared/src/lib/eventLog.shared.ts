import {makeUuid} from '@shared/lib/utils.shared';

import type {EventId} from '@shared/types/eventLog.types';

/**
 * Creates a new random {@link EventId}.
 */
export function makeEventId(): EventId {
  return makeUuid<EventId>();
}
