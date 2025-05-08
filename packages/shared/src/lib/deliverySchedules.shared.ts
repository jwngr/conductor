import {logger} from '@shared/services/logger.shared';

import {makeTimeOfDay, validateHour} from '@shared/lib/datetime.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {
  DayOfWeek,
  DaysAndTimesOfWeekDeliverySchedule,
  DeliverySchedule,
  EveryNHoursDeliverySchedule,
  ImmediateDeliverySchedule,
  NeverDeliverySchedule,
  TimeOfDay,
} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';

export const IMMEDIATE_DELIVERY_SCHEDULE: ImmediateDeliverySchedule = {
  type: DeliveryScheduleType.Immediate,
};

export const NEVER_DELIVERY_SCHEDULE: NeverDeliverySchedule = {
  type: DeliveryScheduleType.Never,
};

export function makeDaysAndTimesOfWeekDeliverySchedule(args: {
  days: DayOfWeek[];
  times: TimeOfDay[];
}): Result<DaysAndTimesOfWeekDeliverySchedule> {
  const {days, times} = args;

  if (days.length === 0) {
    return makeErrorResult(new Error('Days must not be empty'));
  }

  if (times.length === 0) {
    return makeErrorResult(new Error('Times must not be empty'));
  }

  for (const time of times) {
    const timeValidationResult = makeTimeOfDay(time);
    if (!timeValidationResult.success) return timeValidationResult;
  }

  return makeSuccessResult({
    type: DeliveryScheduleType.DaysAndTimesOfWeek,
    days,
    times,
  });
}

export function makeEveryNHoursDeliverySchedule(args: {
  hours: number;
}): Result<EveryNHoursDeliverySchedule> {
  const {hours} = args;

  const hoursResult = validateHour(hours);
  if (!hoursResult.success) return hoursResult;

  return makeSuccessResult({
    type: DeliveryScheduleType.EveryNHours,
    hours,
  });
}

export function isDeliveredAccordingToSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: DeliverySchedule | null;
}): boolean {
  const {createdTime, deliverySchedule} = args;

  // Default to showing feed items without a delivery schedule to avoid hiding things by default.
  if (!deliverySchedule) return true;

  switch (deliverySchedule.type) {
    case DeliveryScheduleType.Immediate:
      // Immediate delivery schedules are always delivered.
      return true;
    case DeliveryScheduleType.Never:
      // Never delivery schedules are never delivered.
      return false;
    case DeliveryScheduleType.DaysAndTimesOfWeek:
    case DeliveryScheduleType.EveryNHours: {
      // TODO: Implement the correct logic here. Ideally build some interface that abstracts away
      // this entire switch statement and includes `Immediate` and `Never` as well.
      logger.log('WARNING: This logic is not fully implemented!');
      if (createdTime < new Date(Date.now() - 5000)) {
        return false;
      }
      return true;
    }
    default:
      assertNever(deliverySchedule);
  }
}
