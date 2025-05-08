import {addHours, setHours} from 'date-fns';

import {makeTimeOfDay, validateHour} from '@shared/lib/datetime.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
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

/**
 * Determines if a feed item should be delivered according to a "Days and times of week" delivery
 * schedule.
 */
function isDeliveredAccordingToDaysAndTimesOfWeekSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: DaysAndTimesOfWeekDeliverySchedule;
}): boolean {
  const {createdTime, deliverySchedule} = args;
  const {days, times} = deliverySchedule;

  const now = new Date();

  // Convert DayOfWeek enum values to JavaScript day indices (0=Sunday, 1=Monday, etc.)
  const dayIndices = days.map((day) => {
    switch (day) {
      case DayOfWeek.Sunday:
        return 0;
      case DayOfWeek.Monday:
        return 1;
      case DayOfWeek.Tuesday:
        return 2;
      case DayOfWeek.Wednesday:
        return 3;
      case DayOfWeek.Thursday:
        return 4;
      case DayOfWeek.Friday:
        return 5;
      case DayOfWeek.Saturday:
        return 6;
      default:
        assertNever(day);
    }
  }) as Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;

  const currentDayOfWeek = now.getDay(); // 0-6, where 0 is Sunday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if today is a delivery day
  if (dayIndices.includes(currentDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
    // Check if current time is after any scheduled delivery time today
    for (const time of times) {
      if (currentHour > time.hour || (currentHour === time.hour && currentMinute >= time.minute)) {
        // Current time is after this delivery time and it's a delivery day
        // Check if the item was created before this delivery time
        const deliveryTimeToday = new Date(now);
        deliveryTimeToday.setHours(time.hour, time.minute, 0, 0);

        if (createdTime.getTime() <= deliveryTimeToday.getTime()) {
          return true;
        }
      }
    }
  }

  // If not delivered today, check if it should be delivered based on previous delivery days
  // Find the most recent delivery day before today
  const msPerDay = 24 * 60 * 60 * 1000;
  let mostRecentDeliveryDate: Date | null = null;

  // Check the past 7 days to find the most recent delivery day
  for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
    const pastDate = new Date(now.getTime() - daysAgo * msPerDay);
    const pastDayOfWeek = pastDate.getDay();

    if (dayIndices.includes(pastDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
      // This past day is a delivery day, check all delivery times
      for (const time of times) {
        const pastDeliveryTime = new Date(pastDate);
        pastDeliveryTime.setHours(time.hour, time.minute, 0, 0);

        // If this past delivery time is the most recent we've found so far
        if (
          mostRecentDeliveryDate === null ||
          pastDeliveryTime.getTime() > mostRecentDeliveryDate.getTime()
        ) {
          mostRecentDeliveryDate = pastDeliveryTime;
        }
      }
    }
  }

  // If we found a most recent delivery date and the item was created before it
  if (
    mostRecentDeliveryDate !== null &&
    createdTime.getTime() <= mostRecentDeliveryDate.getTime() &&
    now.getTime() >= mostRecentDeliveryDate.getTime()
  ) {
    return true;
  }

  return false;
}

/**
 * Determines if a feed item should be delivered according to an "Every N hours" delivery schedule.
 */
function isDeliveredAccordingToEveryNHoursSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: EveryNHoursDeliverySchedule;
}): boolean {
  const {createdTime, deliverySchedule} = args;

  const now = new Date();
  const startOfToday = setHours(new Date(), 0);

  // If right now exactly matches a delivery time, return true since everything is delivered.
  const millisSinceStartOfToday = now.getTime() - startOfToday.getTime();
  const hoursSinceStartOfToday = millisSinceStartOfToday / MILLIS_PER_HOUR;
  const isNowADeliveryTime =
    millisSinceStartOfToday % MILLIS_PER_HOUR === 0 &&
    hoursSinceStartOfToday % deliverySchedule.hours === 0;
  if (isNowADeliveryTime) {
    return true;
  }

  // TODO: This might mess up the first delivery if it's not actually schedule at midnight.

  // Find the latest delivery before now, considering midnight as a delivery time.
  let latestDeliveryDateBeforeNow = new Date(startOfToday.getTime());
  let nextOccurrence = new Date(startOfToday.getTime());
  while (nextOccurrence < now) {
    latestDeliveryDateBeforeNow = new Date(nextOccurrence.getTime());
    nextOccurrence = addHours(nextOccurrence, deliverySchedule.hours);
  }

  // If the item was created before the latest delivery, it is delivered.
  return createdTime.getTime() <= latestDeliveryDateBeforeNow.getTime();
}
