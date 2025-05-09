import {addHours, startOfDay, subDays} from 'date-fns';

import {makeTimeOfDay} from '@shared/lib/datetime.shared';
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

  if (new Set(days).size !== days.length) {
    return makeErrorResult(new Error('Days must not contain duplicates'));
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

  // For now, this schedule only supports hour increments within a single day.
  if (hours < 1 || hours > 24) {
    return makeErrorResult(new Error('Hours must be between 1 and 24'));
  }

  if (hours % 1 !== 0) {
    return makeErrorResult(new Error('Hours must be an integer'));
  }

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

type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Converts a {@link DayOfWeek} enum value to a numerical index, where 0 is Sunday and 6 is the
 * following Saturday.
 */
function dayOfWeekToIndex(day: DayOfWeek): DayOfWeekIndex {
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
}

/**
 * Creates a Date object set to the specified time on the given date
 */
function createDateWithTime(date: Date, time: TimeOfDay): Date {
  const result = new Date(date);
  result.setHours(time.hour, time.minute, 0, 0);
  return result;
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

  // If the item was created before the most recent delivery, it is delivered.
  const mostRecentDeliveryDate = findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule({
    deliverySchedule,
  });
  return createdTime.getTime() <= mostRecentDeliveryDate.getTime();
}

/**
 * Returns the most recent {@link TimeOfDay} that a delivery schedule includes that has already
 * happened today. Returns null if no such time exists.
 */
function getMostRecentDeliveryTimeToday(times: TimeOfDay[]): Date | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (let i = times.length - 1; i >= 0; i--) {
    const time = times[i];
    if (currentHour > time.hour || (currentHour === time.hour && currentMinute >= time.minute)) {
      return createDateWithTime(now, time);
    }
  }

  return null;
}

/**
 * Returns the most recent time before now that the provided delivery schedule delivered.
 */
export function findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule(args: {
  readonly deliverySchedule: DaysAndTimesOfWeekDeliverySchedule;
}): Date {
  const {deliverySchedule} = args;
  const {days, times} = deliverySchedule;

  const now = new Date();
  const currentDayOfWeek = now.getDay();

  const dayIndices = days.map(dayOfWeekToIndex);

  // Check today first.
  if (dayIndices.includes(currentDayOfWeek as DayOfWeekIndex)) {
    const mostRecentDeliveryTime = getMostRecentDeliveryTimeToday(times);
    if (mostRecentDeliveryTime) return mostRecentDeliveryTime;
  }

  // Check the preceding 6 days.
  for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
    const pastDate = subDays(now, daysAgo);
    const pastDayOfWeek = pastDate.getDay() as DayOfWeekIndex;

    if (dayIndices.includes(pastDayOfWeek)) {
      // This entire day is in the past, so the last time of the day will be most recent.
      const lastTime = times[times.length - 1];
      return createDateWithTime(pastDate, lastTime);
    }
  }

  // This should never happen, but return `now` if no delivery time is found. This ensures items
  // default to being shown if the delivery schedule is not set instead of hiding them forever.
  return now;
}

/**
 * Determines if a feed item should be delivered according to an "Every N hours" delivery schedule.
 */
function isDeliveredAccordingToEveryNHoursSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: EveryNHoursDeliverySchedule;
}): boolean {
  const {createdTime, deliverySchedule} = args;

  // If the item was created before the most recent delivery, it is delivered.
  const mostRecentDeliveryDate = findMostRecentDeliveryDateForEveryNHourSchedule({
    deliverySchedule,
  });
  return createdTime.getTime() <= mostRecentDeliveryDate.getTime();
}

/**
 * Returns the most recent time before now that the provided delivery schedule delivered. Midnight
 * is always considered a delivery time, which is why this is always guaranteed to return a date.
 */
export function findMostRecentDeliveryDateForEveryNHourSchedule(args: {
  readonly deliverySchedule: EveryNHoursDeliverySchedule;
}): Date {
  const {deliverySchedule} = args;

  const now = new Date();

  // Find the most recent completed delivery from today. Midnight is always considered a delivery
  // time, so start there.
  let mostRecentDeliveryDate = startOfDay(now);
  let nextDeliveryDate = addHours(mostRecentDeliveryDate, deliverySchedule.hours);
  while (nextDeliveryDate.getTime() <= now.getTime()) {
    mostRecentDeliveryDate = nextDeliveryDate;
    nextDeliveryDate = addHours(nextDeliveryDate, deliverySchedule.hours);
  }

  return mostRecentDeliveryDate;
}
