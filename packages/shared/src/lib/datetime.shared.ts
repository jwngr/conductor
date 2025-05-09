import {formatDistanceToNowStrict} from 'date-fns';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {DayOfWeek} from '@shared/types/datetime.types';
import type {DayOfWeekIndex, TimeOfDay} from '@shared/types/datetime.types';
import type {Result} from '@shared/types/results.types';

export function makeTimeOfDay(timeOfDay: TimeOfDay): Result<TimeOfDay> {
  const hourResult = validateHour(timeOfDay.hour);
  if (!hourResult.success) return hourResult;

  const minuteResult = validateMinute(timeOfDay.minute);
  if (!minuteResult.success) return minuteResult;

  return makeSuccessResult(timeOfDay);
}

export function validateHour(hour: number): Result<number> {
  if (hour < 0 || hour > 23) {
    return makeErrorResult(new Error('Hour must be between 0 and 23'));
  }

  if (hour % 1 !== 0) {
    return makeErrorResult(new Error('Hour must be an integer'));
  }

  return makeSuccessResult(hour);
}

export function validateMinute(minute: number): Result<number> {
  if (minute < 0 || minute > 59) {
    return makeErrorResult(new Error('Minute must be between 0 and 59'));
  }

  if (minute % 1 !== 0) {
    return makeErrorResult(new Error('Minute must be an integer'));
  }

  return makeSuccessResult(minute);
}

/**
 * Formats a date into a relative time string (e.g., "5 minutes ago", "yesterday").
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNowStrict(date, {addSuffix: true});
}

/**
 * Converts a {@link DayOfWeek} enum value to a numerical index, where 0 is Sunday and 6 is the
 * following Saturday.
 */
export function dayOfWeekToIndex(day: DayOfWeek): DayOfWeekIndex {
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
