import {
  IMMEDIATE_DELIVERY_SCHEDULE,
  makeDaysAndTimesOfWeekDeliverySchedule,
  makeEveryNHoursDeliverySchedule,
  NEVER_DELIVERY_SCHEDULE,
} from '@shared/lib/deliverySchedules.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';

import type {DeliveryScheduleFromStorage} from '@shared/schemas/deliverySchedules.schema';

/**
 * Converts a {@link DeliveryScheduleFromStorage} into a {@link DeliverySchedule}.
 */
export function fromStorageDeliverySchedule(
  deliveryScheduleFromStorage: DeliveryScheduleFromStorage
): Result<DeliverySchedule> {
  switch (deliveryScheduleFromStorage.scheduleType) {
    case DeliveryScheduleType.Immediate:
      return makeSuccessResult(IMMEDIATE_DELIVERY_SCHEDULE);
    case DeliveryScheduleType.Never:
      return makeSuccessResult(NEVER_DELIVERY_SCHEDULE);
    case DeliveryScheduleType.DaysAndTimesOfWeek:
      return makeDaysAndTimesOfWeekDeliverySchedule({
        days: deliveryScheduleFromStorage.days,
        times: deliveryScheduleFromStorage.times,
      });
    case DeliveryScheduleType.EveryNHours:
      return makeEveryNHoursDeliverySchedule({hours: deliveryScheduleFromStorage.hours});
    default:
      assertNever(deliveryScheduleFromStorage);
  }
}

/**
 * Converts a {@link DeliverySchedule} into a {@link DeliveryScheduleFromStorage}.
 */
export function toStorageDeliverySchedule(
  deliverySchedule: DeliverySchedule
): DeliveryScheduleFromStorage {
  switch (deliverySchedule.scheduleType) {
    case DeliveryScheduleType.Immediate:
      return {
        scheduleType: DeliveryScheduleType.Immediate,
      };
    case DeliveryScheduleType.Never:
      return {
        scheduleType: DeliveryScheduleType.Never,
      };
    case DeliveryScheduleType.DaysAndTimesOfWeek:
      return {
        scheduleType: DeliveryScheduleType.DaysAndTimesOfWeek,
        days: deliverySchedule.days,
        times: deliverySchedule.times,
      };
    case DeliveryScheduleType.EveryNHours:
      return {
        scheduleType: DeliveryScheduleType.EveryNHours,
        hours: deliverySchedule.hours,
      };
    default:
      assertNever(deliverySchedule);
  }
}
