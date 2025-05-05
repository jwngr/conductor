import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {makeTimeOfDay, validateHour} from '@shared/lib/time.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {
  DaysAndTimesOfWeekDeliverySchedule,
  DeliverySchedule,
  EveryNHoursDeliverySchedule,
  ImmediateDeliverySchedule,
  NeverDeliverySchedule,
  TimeOfDay,
} from '@shared/types/deliverySchedules.types';
import {DayOfWeek, DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
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

  const now = new Date();

  // Find the most recent delivery time before current time
  let mostRecentDeliveryDate = new Date();
  mostRecentDeliveryDate.setDate(mostRecentDeliveryDate.getDate() - 7); // Start with a date in the past

  // For each day and time combination
  for (const day of days) {
    for (const time of times) {
      // Create a date for this day and time starting from current time
      const deliveryDateCandidate = new Date();

      // Set to the correct day of week (0-6, where 0 is Sunday)
      const dayIndex = Object.values(DayOfWeek).indexOf(day);
      const currentDayOfWeek = deliveryDateCandidate.getDay();
      const daysToAdd = (dayIndex - currentDayOfWeek + 7) % 7;
      deliveryDateCandidate.setDate(deliveryDateCandidate.getDate() + daysToAdd);

      // Set the time
      deliveryDateCandidate.setHours(time.hour, time.minute, 0, 0);

      // If this candidate is in the future or equal to current time, go back a week
      if (deliveryDateCandidate.getTime() >= now.getTime()) {
        deliveryDateCandidate.setDate(deliveryDateCandidate.getDate() - 7);
      }

      // Keep the most recent past delivery date
      if (deliveryDateCandidate.getTime() > mostRecentDeliveryDate.getTime()) {
        mostRecentDeliveryDate = deliveryDateCandidate;
      }
    }
  }

  // Find the next delivery date
  const nextDeliveryDate = new Date(mostRecentDeliveryDate);
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);

  // Item should be delivered if:
  // 1. It was created before or at the most recent delivery date AND
  // 2. The current time is after or equal to the most recent delivery date AND
  // 3. The current time is before the next delivery date
  return (
    createdTime.getTime() <= mostRecentDeliveryDate.getTime() &&
    now.getTime() >= mostRecentDeliveryDate.getTime() &&
    now.getTime() < nextDeliveryDate.getTime()
  );
}

function isDeliveredAccordingToEveryNHoursSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: EveryNHoursDeliverySchedule;
}): boolean {
  const {createdTime, deliverySchedule} = args;
  const {hours} = deliverySchedule;

  const now = new Date();

  // Calculate milliseconds for the interval
  const intervalMs = hours * 60 * 60 * 1000;

  // Calculate how many complete intervals have passed since creation
  const msSinceCreation = now.getTime() - createdTime.getTime();
  const completedIntervals = Math.floor(msSinceCreation / intervalMs);

  // Calculate the most recent delivery time before current time
  const mostRecentDeliveryTime = new Date(
    createdTime.getTime() + Math.max(0, completedIntervals - 1) * intervalMs
  );

  // Calculate the next delivery time
  const nextDeliveryTime = new Date(mostRecentDeliveryTime.getTime() + intervalMs);

  // Item should be delivered if:
  // 1. The current time is after or equal to the most recent delivery time AND
  // 2. The current time is before the next delivery time AND
  // 3. The item was created before or at the most recent delivery time
  return (
    now.getTime() >= mostRecentDeliveryTime.getTime() &&
    now.getTime() < nextDeliveryTime.getTime() &&
    createdTime.getTime() <= mostRecentDeliveryTime.getTime()
  );
}
