import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {validateHour, validateTimeOfDay} from '@shared/lib/time.shared';
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

export function makeTimeOfDay(hour: number, minute: number): Result<TimeOfDay> {
  return validateTimeOfDay({hour, minute});
}

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
    const timeValidationResult = validateTimeOfDay(time);
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
      return isDeliveredAccordingToDaysAndTimesOfWeekSchedule({
        createdTime,
        deliverySchedule,
      });
    case DeliveryScheduleType.EveryNHours:
      return isDeliveredAccordingToEveryNHoursSchedule({
        createdTime,
        deliverySchedule,
      });
    default:
      assertNever(deliverySchedule);
  }
}

function isDeliveredAccordingToDaysAndTimesOfWeekSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: DaysAndTimesOfWeekDeliverySchedule;
}): boolean {
  const {createdTime, deliverySchedule} = args;

  const {days, times} = deliverySchedule;

  return false;
}

function isDeliveredAccordingToEveryNHoursSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: EveryNHoursDeliverySchedule;
}): boolean {
  const {createdTime, deliverySchedule} = args;

  const hours = deliverySchedule.hours;

  const previousInstance = createdTime.getTime() - hours * 60 * 60 * 1000;
  const nextInstance = createdTime.getTime() + hours * 60 * 60 * 1000;

  return false;
}
