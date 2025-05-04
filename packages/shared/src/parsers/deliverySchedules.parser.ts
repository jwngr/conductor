import {logger} from '@shared/services/logger.shared';

import {
  IMMEDIATE_DELIVERY_SCHEDULE,
  makeDaysAndTimesOfWeekDeliverySchedule,
  makeEveryNHoursDeliverySchedule,
  NEVER_DELIVERY_SCHEDULE,
} from '@shared/lib/deliverySchedules.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

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
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid delivery schedule');
  }

  const parsedDeliverySchedule = parsedResult.value;

  switch (parsedDeliverySchedule.type) {
    case DeliveryScheduleType.Immediate:
      return makeSuccessResult(IMMEDIATE_DELIVERY_SCHEDULE);
    case DeliveryScheduleType.Never:
      return makeSuccessResult(NEVER_DELIVERY_SCHEDULE);
    case DeliveryScheduleType.DaysAndTimesOfWeek:
      return makeSuccessResult(
        makeDaysAndTimesOfWeekDeliverySchedule({
          days: parsedDeliverySchedule.days,
          times: parsedDeliverySchedule.times,
        })
      );
    case DeliveryScheduleType.EveryNHours:
      return makeSuccessResult(
        makeEveryNHoursDeliverySchedule({hours: parsedDeliverySchedule.hours})
      );
    default: {
      const error = new Error('Unknown delivery schedule type');
      logger.error(error, {parsedDeliverySchedule});
      return makeErrorResult(error);
    }
  }
}

/**
 * Converts a {@link DeliverySchedule} to a {@link DeliveryScheduleFromStorage} object that can
 * be persisted to Firestore.
 */
export function toStorageDeliverySchedule(
  deliverySchedule: DeliverySchedule
): DeliveryScheduleFromStorage {
  switch (deliverySchedule.type) {
    case DeliveryScheduleType.Immediate:
      return {
        type: DeliveryScheduleType.Immediate,
      };
    case DeliveryScheduleType.Never:
      return {
        type: DeliveryScheduleType.Never,
      };
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
      return {
        type: DeliveryScheduleType.Immediate,
      };
  }
}
