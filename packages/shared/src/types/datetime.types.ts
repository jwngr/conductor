/**
 * A number representing a day of the week, where 0 is Sunday and 6 is the following Saturday.
 */
export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export enum DayOfWeek {
  Monday = 'MON',
  Tuesday = 'TUE',
  Wednesday = 'WED',
  Thursday = 'THU',
  Friday = 'FRI',
  Saturday = 'SAT',
  Sunday = 'SUN',
}

export interface TimeOfDay {
  readonly hour: number; // 0–23
  readonly minute: number; // 0–59
}
