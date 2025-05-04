import type {
  DayOfWeek,
  DaysAndTimesOfWeekDeliverySchedule,
  EveryNHoursDeliverySchedule,
  ImmediatelyDeliverySchedule,
  NeverDeliverySchedule,
  TimeOfDay,
} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';

export function makeTimeOfDay(hour: number, minute: number): TimeOfDay {
  return {
    hour,
    minute,
  };
}

export const IMMEDIATELY_DELIVERY_SCHEDULE: ImmediatelyDeliverySchedule = {
  type: DeliveryScheduleType.Immediately,
} as const;

export const NEVER_DELIVERY_SCHEDULE: NeverDeliverySchedule = {
  type: DeliveryScheduleType.Never,
} as const;

export function makeDaysAndTimesOfWeekDeliverySchedule(args: {
  days: DayOfWeek[];
  times: TimeOfDay[];
}): DaysAndTimesOfWeekDeliverySchedule {
  const {days, times} = args;

  return {
    type: DeliveryScheduleType.DaysAndTimesOfWeek,
    days,
    times,
  };
}

export function makeEveryNHoursDeliverySchedule(args: {
  hours: number;
}): EveryNHoursDeliverySchedule {
  const {hours} = args;

  return {
    type: DeliveryScheduleType.EveryNHours,
    hours,
  };
}
