import {formatDistanceToNowStrict} from 'date-fns';

/**
 * Formats a date into a relative time string (e.g., "5 minutes ago", "yesterday").
 * @param date The date to format.
 * @returns A string representing the relative time.
 */
export function formatRelativeTime(date: Date): string {
  // You can customize options here if needed later
  return formatDistanceToNowStrict(date, {addSuffix: true});
}
