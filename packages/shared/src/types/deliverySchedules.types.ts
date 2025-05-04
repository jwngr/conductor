import {z} from 'zod';

export enum DeliveryScheduleType {
  Immediately = 'IMMEDIATELY',
  Never = 'NEVER',
  DaysAndTimesOfWeek = 'DAYS_AND_TIMES_OF_WEEK',
  EveryNHours = 'EVERY_N_HOURS',
}

interface BaseDeliverySchedule {
  readonly type: DeliveryScheduleType;
}

export interface NeverDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.Never;
}

export interface ImmediatelyDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.Immediately;
}

export interface DaysAndTimesOfWeekDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.DaysAndTimesOfWeek;
  readonly days: DayOfWeek[];
  readonly times: TimeOfDay[];
}

export interface EveryNHoursDeliverySchedule extends BaseDeliverySchedule {
  readonly type: DeliveryScheduleType.EveryNHours;
  readonly hours: number;
}

export type DeliverySchedule =
  | NeverDeliverySchedule
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

/**
 * Zod schema for a {@link DeliverySchedule} persisted to Firestore.
 */
export const DeliveryScheduleFromStorageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(DeliveryScheduleType.Immediately),
  }),
  z.object({
    type: z.literal(DeliveryScheduleType.Never),
  }),
  z.object({
    type: z.literal(DeliveryScheduleType.DaysAndTimesOfWeek),
    days: z.array(z.nativeEnum(DayOfWeek)),
    times: z.array(
      z.object({
        hour: z.number(),
        minute: z.number(),
      })
    ),
  }),
  z.object({
    type: z.literal(DeliveryScheduleType.EveryNHours),
    hours: z.number(),
  }),
]);

/**
 * Type for a {@link DeliverySchedule} persisted to Firestore.
 */
export type DeliveryScheduleFromStorage = z.infer<typeof DeliveryScheduleFromStorageSchema>;
