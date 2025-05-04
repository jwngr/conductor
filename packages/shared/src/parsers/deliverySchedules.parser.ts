import {logger} from '@shared/services/logger.shared';

import {
  makeDaysAndTimesOfWeekDeliverySchedule,
  makeEveryNHoursDeliverySchedule,
  makeImmediateDeliverySchedule,
  makeNeverDeliverySchedule,
} from '@shared/lib/deliverySchedules.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import type {
  DeliverySchedule,
  DeliveryScheduleFromStorage,
} from '@shared/types/deliverySchedules.types';
import {
  DeliveryScheduleFromStorageSchema,
  DeliveryScheduleType,
} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';
import {INVALID_USER_FEED_SUBSCRIPTION_ID} from '@shared/types/userFeedSubscriptions.types';

/**
 * Parses a {@link DeliverySchedule} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseDeliverySchedule(maybeDeliverySchedule: unknown): Result<DeliverySchedule> {
  const parsedResult = parseZodResult(DeliveryScheduleFromStorageSchema, maybeDeliverySchedule);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid delivery schedule');
  }
  const parsedFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedFeedSubscriptionIdResult.success) {
    return prefixErrorResult(parsedFeedSubscriptionIdResult, 'Invalid user feed subscription ID');
  }

  const parsedDeliverySchedule = parsedResult.value;
  const userFeedSubscriptionId = parsedFeedSubscriptionIdResult.value;

  switch (parsedDeliverySchedule.type) {
    case DeliveryScheduleType.Immediate:
      return makeSuccessResult(makeImmediateDeliverySchedule({userFeedSubscriptionId}));
    case DeliveryScheduleType.Never:
      return makeSuccessResult(makeNeverDeliverySchedule({userFeedSubscriptionId}));
    case DeliveryScheduleType.DaysAndTimesOfWeek:
      return makeSuccessResult(
        makeDaysAndTimesOfWeekDeliverySchedule({
          userFeedSubscriptionId,
          days: parsedDeliverySchedule.days,
          times: parsedDeliverySchedule.times,
        })
      );
    case DeliveryScheduleType.EveryNHours:
      return makeSuccessResult(
        makeEveryNHoursDeliverySchedule({
          userFeedSubscriptionId,
          hours: parsedDeliverySchedule.hours,
        })
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
        userFeedSubscriptionId: deliverySchedule.userFeedSubscriptionId,
      };
    case DeliveryScheduleType.Never:
      return {
        type: DeliveryScheduleType.Never,
        userFeedSubscriptionId: deliverySchedule.userFeedSubscriptionId,
      };
    case DeliveryScheduleType.DaysAndTimesOfWeek:
      return {
        type: DeliveryScheduleType.DaysAndTimesOfWeek,
        days: deliverySchedule.days,
        times: deliverySchedule.times,
        userFeedSubscriptionId: deliverySchedule.userFeedSubscriptionId,
      };
    case DeliveryScheduleType.EveryNHours:
      return {
        type: DeliveryScheduleType.EveryNHours,
        hours: deliverySchedule.hours,
        userFeedSubscriptionId: deliverySchedule.userFeedSubscriptionId,
      };
    default:
      logger.error(new Error('Unknown delivery schedule type'), {deliverySchedule});
      // Fallback to an immediate delivery schedule to avoid missing items.
      // TODO: Filter these out somewhere downstream to avoid issues when this ID is used.
      return {
        type: DeliveryScheduleType.Immediate,
        userFeedSubscriptionId: INVALID_USER_FEED_SUBSCRIPTION_ID,
      };
  }
}
