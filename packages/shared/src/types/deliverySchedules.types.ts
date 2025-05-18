import {z} from 'zod';

import {DayOfWeek, TimeOfDaySchema} from '@shared/types/datetime.types';
import type {TimeOfDay} from '@shared/types/datetime.types';

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

const BaseDeliveryScheduleFromStorageSchema = z.object({
  scheduleType: z.nativeEnum(DeliveryScheduleType),
});

const ImmediateDeliveryScheduleFromStorageSchema = BaseDeliveryScheduleFromStorageSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.Immediate),
});

const NeverDeliveryScheduleFromStorageSchema = BaseDeliveryScheduleFromStorageSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.Never),
});

const DaysAndTimesOfWeekDeliveryScheduleFromStorageSchema =
  BaseDeliveryScheduleFromStorageSchema.extend({
    scheduleType: z.literal(DeliveryScheduleType.DaysAndTimesOfWeek),
    days: z.array(z.nativeEnum(DayOfWeek)),
    times: z.array(TimeOfDaySchema),
  });

const EveryNHoursDeliveryScheduleFromStorageSchema = BaseDeliveryScheduleFromStorageSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.EveryNHours),
  hours: z.number().int().min(1).max(24),
});

/**
 * Zod schema for a {@link DeliverySchedule} persisted to Firestore.
 */
export const DeliveryScheduleFromStorageSchema = z.discriminatedUnion('scheduleType', [
  NeverDeliveryScheduleFromStorageSchema,
  ImmediateDeliveryScheduleFromStorageSchema,
  DaysAndTimesOfWeekDeliveryScheduleFromStorageSchema,
  EveryNHoursDeliveryScheduleFromStorageSchema,
]);

/**
 * Type for a {@link DeliverySchedule} persisted to Firestore.
 */
export type DeliveryScheduleFromStorage = z.infer<typeof DeliveryScheduleFromStorageSchema>;

/**
 * Zod schema for a {@link DeliveryScheduleType} persisted to Firestore.
 */
export const DeliveryScheduleTypeFromStorageSchema = z.nativeEnum(DeliveryScheduleType);

/**
 * Type for a {@link DeliveryScheduleType} persisted to Firestore.
 */
export type DeliveryScheduleTypeFromStorage = z.infer<typeof DeliveryScheduleTypeFromStorageSchema>;
