import {formatDistanceToNowStrict} from 'date-fns';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {TimeOfDay} from '@shared/types/deliverySchedules.types';
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
  return makeSuccessResult(hour);
}

export function validateMinute(minute: number): Result<number> {
  if (minute < 0 || minute > 59) {
    return makeErrorResult(new Error('Minute must be between 0 and 59'));
  }
  return makeSuccessResult(minute);
}

/**
 * Formats a date into a relative time string (e.g., "5 minutes ago", "yesterday").
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNowStrict(date, {addSuffix: true});
}
