export enum DeliveryScheduleType {
  Immediately = 'IMMEDIATELY',
  DaysAndTimesOfWeek = 'DAYS_AND_TIMES_OF_WEEK',
  EveryNHours = 'EVERY_N_HOURS',
}

interface BaseDeliverySchedule {
  readonly type: DeliveryScheduleType;
}

interface ImmediatelyDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.Immediately;
}

interface DaysAndTimesOfWeekDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.DaysAndTimesOfWeek;
  readonly days: DayOfWeek[];
  readonly times: TimeOfDay[];
}

interface EveryNHoursDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.EveryNHours;
  readonly hours: number;
}

export type DeliverySchedule =
  | ImmediatelyDeliverySchedule
  | DaysAndTimesOfWeekDeliverySchedule
  | EveryNHoursDeliverySchedule;

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
