import {formatDistanceToNowStrict} from 'date-fns';

/**
 * Formats a date into a relative time string (e.g., "5 minutes ago", "yesterday").
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNowStrict(date, {addSuffix: true});
}
