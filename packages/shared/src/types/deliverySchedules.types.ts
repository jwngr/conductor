import type {DayOfWeek, TimeOfDay} from '@shared/types/datetime.types';

export enum DeliveryScheduleType {
  Immediate = 'IMMEDIATE',
  Never = 'NEVER',
  DaysAndTimesOfWeek = 'DAYS_AND_TIMES_OF_WEEK',
  EveryNHours = 'EVERY_N_HOURS',
}

interface BaseDeliverySchedule {
  readonly scheduleType: DeliveryScheduleType;
}

export interface NeverDeliverySchedule extends BaseDeliverySchedule {
  readonly scheduleType: DeliveryScheduleType.Never;
}

export interface ImmediateDeliverySchedule extends BaseDeliverySchedule {
  readonly scheduleType: DeliveryScheduleType.Immediate;
}

export interface DaysAndTimesOfWeekDeliverySchedule extends BaseDeliverySchedule {
  readonly scheduleType: DeliveryScheduleType.DaysAndTimesOfWeek;
  readonly days: DayOfWeek[];
  readonly times: TimeOfDay[];
}

export interface EveryNHoursDeliverySchedule extends BaseDeliverySchedule {
  readonly scheduleType: DeliveryScheduleType.EveryNHours;
  readonly hours: number;
}

export type DeliverySchedule =
  | NeverDeliverySchedule
  | ImmediateDeliverySchedule
  | DaysAndTimesOfWeekDeliverySchedule
  | EveryNHoursDeliverySchedule;
