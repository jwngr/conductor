import {logger} from '@shared/services/logger.shared';

import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {
  DeliverySchedule,
  DeliveryScheduleFromStorage,
} from '@shared/types/deliverySchedules.types';
import {
  DeliveryScheduleFromStorageSchema,
  DeliveryScheduleType,
} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';

/**
 * Parses a {@link DeliverySchedule} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseDeliverySchedule(maybeDeliverySchedule: unknown): Result<DeliverySchedule> {
  const parsedResult = parseZodResult(DeliveryScheduleFromStorageSchema, maybeDeliverySchedule);
  return prefixResultIfError(parsedResult, 'Invalid delivery schedule');
}

/**
 * Converts a {@link DeliverySchedule} to a {@link DeliveryScheduleFromStorage} object that can
 * be persisted to Firestore.
 */
export function toStorageDeliverySchedule(
  deliverySchedule: DeliverySchedule
): DeliveryScheduleFromStorage {
  switch (deliverySchedule.type) {
    case DeliveryScheduleType.Immediately:
      return {type: DeliveryScheduleType.Immediately};
    case DeliveryScheduleType.Never:
      return {type: DeliveryScheduleType.Never};
    case DeliveryScheduleType.DaysAndTimesOfWeek:
      return {
        type: DeliveryScheduleType.DaysAndTimesOfWeek,
        days: deliverySchedule.days,
        times: deliverySchedule.times,
      };
    case DeliveryScheduleType.EveryNHours:
      return {
        type: DeliveryScheduleType.EveryNHours,
        hours: deliverySchedule.hours,
      };
    default:
      logger.error(new Error('Unknown delivery schedule type'), {deliverySchedule});
      // Fallback to an immediate delivery schedule to avoid missing items.
      return {type: DeliveryScheduleType.Immediately};
  }
}
