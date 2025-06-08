import {z} from 'zod/v4';

import {DayOfWeek} from '@shared/types/datetime.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';

import {TimeOfDaySchema} from '@shared/schemas/datetime.schema';

const BaseDeliveryScheduleSchema = z.object({
  scheduleType: z.enum(DeliveryScheduleType),
});

const ImmediateDeliveryScheduleSchema = BaseDeliveryScheduleSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.Immediate),
});

const NeverDeliveryScheduleSchema = BaseDeliveryScheduleSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.Never),
});

const DaysAndTimesOfWeekDeliveryScheduleSchema = BaseDeliveryScheduleSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.DaysAndTimesOfWeek),
  days: z.array(z.enum(DayOfWeek)),
  times: z.array(TimeOfDaySchema),
});

const EveryNHoursDeliveryScheduleSchema = BaseDeliveryScheduleSchema.extend({
  scheduleType: z.literal(DeliveryScheduleType.EveryNHours),
  hours: z.number().int().min(1).max(24),
});

export const DeliveryScheduleSchema = z.discriminatedUnion('scheduleType', [
  NeverDeliveryScheduleSchema,
  ImmediateDeliveryScheduleSchema,
  DaysAndTimesOfWeekDeliveryScheduleSchema,
  EveryNHoursDeliveryScheduleSchema,
]);

/** Type for a {@link DeliverySchedule} persisted to Firestore. */
export type DeliveryScheduleFromStorage = z.infer<typeof DeliveryScheduleSchema>;
