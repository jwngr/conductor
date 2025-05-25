import {z} from 'zod';

import {DayOfWeek} from '@shared/types/datetime.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';

import {TimeOfDaySchema} from '@shared/schemas/datetime.schema';

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
