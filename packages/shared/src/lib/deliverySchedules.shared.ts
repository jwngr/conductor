import type {
  DayOfWeek,
  DaysAndTimesOfWeekDeliverySchedule,
  EveryNHoursDeliverySchedule,
  ImmediateDeliverySchedule,
  NeverDeliverySchedule,
  TimeOfDay,
} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

export function makeTimeOfDay(hour: number, minute: number): TimeOfDay {
  return {
    hour,
    minute,
  };
}

export function makeImmediateDeliverySchedule(args: {
  userFeedSubscriptionId: UserFeedSubscriptionId;
}): ImmediateDeliverySchedule {
  const {userFeedSubscriptionId} = args;

  return {
    type: DeliveryScheduleType.Immediate,
    userFeedSubscriptionId,
  };
}

export function makeNeverDeliverySchedule(args: {
  userFeedSubscriptionId: UserFeedSubscriptionId;
}): NeverDeliverySchedule {
  const {userFeedSubscriptionId} = args;

  return {
    type: DeliveryScheduleType.Never,
    userFeedSubscriptionId,
  };
}

export function makeDaysAndTimesOfWeekDeliverySchedule(args: {
  days: DayOfWeek[];
  times: TimeOfDay[];
  userFeedSubscriptionId: UserFeedSubscriptionId;
}): DaysAndTimesOfWeekDeliverySchedule {
  const {days, times, userFeedSubscriptionId} = args;

  return {
    type: DeliveryScheduleType.DaysAndTimesOfWeek,
    days,
    times,
    userFeedSubscriptionId,
  };
}

export function makeEveryNHoursDeliverySchedule(args: {
  hours: number;
  userFeedSubscriptionId: UserFeedSubscriptionId;
}): EveryNHoursDeliverySchedule {
  const {hours, userFeedSubscriptionId} = args;

  return {
    type: DeliveryScheduleType.EveryNHours,
    hours,
    userFeedSubscriptionId,
  };
}
