import {logger} from '@shared/services/logger.shared';

import {assertNever} from '@shared/lib/utils.shared';

import type {
  DayOfWeek,
  DaysAndTimesOfWeekDeliverySchedule,
  DeliverySchedule,
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

export function isDeliveredAccordingToSchedule(args: {
  readonly createdTime: Date;
  readonly deliverySchedule: DeliverySchedule | null;
}): boolean {
  const {createdTime, deliverySchedule} = args;

  // Default to showing feed items without a delivery schedule to avoid hiding things by default.
  if (!deliverySchedule) return true;

  switch (deliverySchedule.type) {
    case DeliveryScheduleType.Immediate:
      // Immediate delivery schedules are always delivered.
      return true;
    case DeliveryScheduleType.Never:
      // Never delivery schedules are never delivered.
      return false;
    case DeliveryScheduleType.DaysAndTimesOfWeek:
    case DeliveryScheduleType.EveryNHours: {
      // TODO: Implement the correct logic here. Ideally build some interface that abstracts away
      // this entire switch statement and includes `Immediate` and `Never` as well.
      logger.log('WARNING: This logic is not fully implemented!');
      if (createdTime < new Date(Date.now() - 5000)) {
        return false;
      }
      return true;
    }
    default:
      assertNever(deliverySchedule);
  }
}
