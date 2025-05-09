import {setHours, setMinutes, subDays} from 'date-fns';

import {makeTimeOfDay} from '@shared/lib/datetime.shared';
import {
  findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule,
  findMostRecentDeliveryDateForEveryNHourSchedule,
  IMMEDIATE_DELIVERY_SCHEDULE,
  isDeliveredAccordingToSchedule,
  makeDaysAndTimesOfWeekDeliverySchedule,
  makeEveryNHoursDeliverySchedule,
  NEVER_DELIVERY_SCHEDULE,
} from '@shared/lib/deliverySchedules.shared';

import {DayOfWeek, DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {
  DaysAndTimesOfWeekDeliverySchedule,
  EveryNHoursDeliverySchedule,
  TimeOfDay,
} from '@shared/types/deliverySchedules.types';

const EVERY_DAY_OF_WEEK = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

/** Unsafe test helper for creating a {@link TimeOfDay} briefly. */
function timeOfDay(hour: number, minute: number): TimeOfDay {
  const result = makeTimeOfDay({hour, minute});
  if (!result.success) {
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(result.error.message);
  }
  return result.value;
}

// Constants for test dates
const MONDAY_JAN_1_2024 = new Date(2024, 0, 1); // Monday January 1, 2024
const TUESDAY_JAN_2_2024 = new Date(2024, 0, 2); // Tuesday January 2, 2024
const WEDNESDAY_JAN_3_2024 = new Date(2024, 0, 3); // Wednesday January 3, 2024

describe('deliverySchedules', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Set a default time.
    jest.setSystemTime(setHours(setMinutes(MONDAY_JAN_1_2024, 0), 9)); // Mon 9:00 AM
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('No schedule', () => {
    it('should always deliver', () => {
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 2), 17); // Mon 2:17 AM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: null})).toBe(true);
    });
  });

  describe('Immediate schedule', () => {
    it('should always deliver', () => {
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 2), 17); // Mon 2:17 AM

      expect(
        isDeliveredAccordingToSchedule({createdTime, deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE})
      ).toBe(true);
    });
  });

  describe('Never schedule', () => {
    it('should never deliver', () => {
      const createdTime = setHours(MONDAY_JAN_1_2024, 22); // Mon 10:00 PM

      expect(
        isDeliveredAccordingToSchedule({createdTime, deliverySchedule: NEVER_DELIVERY_SCHEDULE})
      ).toBe(false);
    });
  });

  describe('DaysAndTimesOfWeek schedule', () => {
    let mondaySchedule: DaysAndTimesOfWeekDeliverySchedule;
    let multiDaySchedule: DaysAndTimesOfWeekDeliverySchedule;

    beforeEach(() => {
      // Create a schedule for Monday at 9:00 AM.
      const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
        days: [DayOfWeek.Monday],
        times: [timeOfDay(9, 0)],
      });
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;
      mondaySchedule = scheduleResult.value;

      // Create a schedule for Monday and Wednesday at 9:00 AM and 3:00 PM.
      const multiDayResult = makeDaysAndTimesOfWeekDeliverySchedule({
        days: [DayOfWeek.Monday, DayOfWeek.Wednesday],
        times: [timeOfDay(9, 0), timeOfDay(15, 0)],
      });
      expect(multiDayResult.success).toBe(true);
      if (!multiDayResult.success) return;
      multiDaySchedule = multiDayResult.value;
    });

    describe('makeDaysAndTimesOfWeekDeliverySchedule', () => {
      it('should accept a single day and time', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday],
          times: [timeOfDay(9, 0)],
        });
        expect(scheduleResult.success).toBe(true);
        if (!scheduleResult.success) return;

        expect(scheduleResult.value).toEqual({
          type: DeliveryScheduleType.DaysAndTimesOfWeek,
          days: [DayOfWeek.Monday],
          times: [timeOfDay(9, 0)],
        });
      });

      it('should accept multiple days and times', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday, DayOfWeek.Wednesday],
          times: [timeOfDay(9, 0), timeOfDay(15, 0)],
        });
        expect(scheduleResult.success).toBe(true);
        if (!scheduleResult.success) return;

        expect(scheduleResult.value).toEqual({
          type: DeliveryScheduleType.DaysAndTimesOfWeek,
          days: [DayOfWeek.Monday, DayOfWeek.Wednesday],
          times: [timeOfDay(9, 0), timeOfDay(15, 0)],
        });
      });

      it('should accept every day of the week', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: EVERY_DAY_OF_WEEK,
          times: [timeOfDay(9, 0)],
        });
        expect(scheduleResult.success).toBe(true);
        if (!scheduleResult.success) return;

        expect(scheduleResult.value).toEqual({
          type: DeliveryScheduleType.DaysAndTimesOfWeek,
          days: EVERY_DAY_OF_WEEK,
          times: [timeOfDay(9, 0)],
        });
      });

      it('should reject empty days array', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [],
          times: [timeOfDay(9, 0)],
        });
        expect(scheduleResult.success).toBe(false);
      });

      it('should reject empty times array', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday],
          times: [],
        });
        expect(scheduleResult.success).toBe(false);
      });

      it('should reject invalid times array', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday],
          times: [{hour: 100, minute: 0}],
        });
        expect(scheduleResult.success).toBe(false);
      });

      it('should reject days array with duplicate days', () => {
        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday, DayOfWeek.Monday],
          times: [timeOfDay(9, 0)],
        });
        expect(scheduleResult.success).toBe(false);
      });
    });

    describe('findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule', () => {
      it('should return the first scheduled time of the day before the second one has occurred', () => {
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 10)); // Mon 10:00 AM
        const date = findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule({
          deliverySchedule: multiDaySchedule,
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 9)); // Mon 9:00 AM
      });

      it('should return the second scheduled time of the day as soon as it occurs', () => {
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 15)); // Mon 3:00 PM
        const date = findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule({
          deliverySchedule: multiDaySchedule,
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 15)); // Mon 3:00 PM
      });

      it('should return the second scheduled time of the day after it occurs', () => {
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 16)); // Mon 4:00 PM
        const date = findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule({
          deliverySchedule: multiDaySchedule,
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 15)); // Mon 3:00 PM
      });

      it("should return a preceding day's last scheduled time if the first scheduled time of the day has not occurred", () => {
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 8)); // Mon 8:00 AM
        const date = findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule({
          deliverySchedule: multiDaySchedule,
        });
        expect(date).toEqual(setHours(subDays(MONDAY_JAN_1_2024, 5), 15)); // Previous Wed 3:00 PM
      });

      it('should return now if no scheduled times', () => {
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 8)); // Mon 8:00 AM
        const date = findMostRecentDeliveryDateForDaysAndTimesOfWeekSchedule({
          deliverySchedule: {
            type: DeliveryScheduleType.DaysAndTimesOfWeek,
            days: [],
            times: [],
          },
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 8)); // Mon 8:00 AM
      });
    });

    describe('isDeliveredAccordingToDaysAndTimesOfWeekSchedule', () => {
      describe('single day and time schedule', () => {
        it('should not be delivered 1 minute before scheduled time', () => {
          const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Mon 8:00 AM
          const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 8), 59); // Mon 8:59 AM
          jest.setSystemTime(currentTime);

          expect(
            isDeliveredAccordingToSchedule({createdTime, deliverySchedule: mondaySchedule})
          ).toBe(false);
        });

        it('should be delivered exactly at scheduled time', () => {
          const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Mon 8:00 AM
          const currentTime = setHours(MONDAY_JAN_1_2024, 9); // Mon 9:00 AM
          jest.setSystemTime(currentTime);

          expect(
            isDeliveredAccordingToSchedule({createdTime, deliverySchedule: mondaySchedule})
          ).toBe(true);
        });

        it('should be delivered 1 minute after scheduled time', () => {
          const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Mon 8:00 AM
          const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 9), 1); // Mon 9:01 AM
          jest.setSystemTime(currentTime);

          expect(
            isDeliveredAccordingToSchedule({createdTime, deliverySchedule: mondaySchedule})
          ).toBe(true);
        });

        it('should not be delivered if today has no delivery times', () => {
          const createdTime = setHours(TUESDAY_JAN_2_2024, 8); // Tue 8:00 AM
          const currentTime = setHours(TUESDAY_JAN_2_2024, 22); // Tue 10:00 PM
          jest.setSystemTime(currentTime);

          expect(
            isDeliveredAccordingToSchedule({createdTime, deliverySchedule: mondaySchedule})
          ).toBe(false);
        });

        it('should be delivered the following day which has a scheduled delivery time', () => {
          const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Mon 8:00 AM
          const currentTime = setHours(WEDNESDAY_JAN_3_2024, 9); // Wed 9:00 AM
          jest.setSystemTime(currentTime);

          expect(
            isDeliveredAccordingToSchedule({createdTime, deliverySchedule: mondaySchedule})
          ).toBe(true);
        });
      });

      describe('multiple days and times schedule', () => {
        it('should deliver 1 minute after first scheduled time on first day', () => {
          // Set current time to Monday at 9:01 AM
          const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 9), 1);
          jest.setSystemTime(currentTime);

          const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Created at 8:00 AM

          expect(
            isDeliveredAccordingToSchedule({
              createdTime,
              deliverySchedule: multiDaySchedule,
            })
          ).toBe(true);
        });

        it('should deliver 1 minute after second scheduled time on first day', () => {
          // Set current time to Monday at 3:01 PM
          const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 15), 1);
          jest.setSystemTime(currentTime);

          const createdTime = setHours(MONDAY_JAN_1_2024, 14); // Created at 2:00 PM

          expect(
            isDeliveredAccordingToSchedule({
              createdTime,
              deliverySchedule: multiDaySchedule,
            })
          ).toBe(true);
        });

        it('should deliver 1 minute after scheduled time on second day', () => {
          // Set current time to Wednesday at 9:01 AM
          const currentTime = setMinutes(setHours(WEDNESDAY_JAN_3_2024, 9), 1);
          jest.setSystemTime(currentTime);

          const createdTime = setHours(WEDNESDAY_JAN_3_2024, 8); // Created at 8:00 AM

          expect(
            isDeliveredAccordingToSchedule({
              createdTime,
              deliverySchedule: multiDaySchedule,
            })
          ).toBe(true);
        });

        it('should not deliver on an unscheduled day', () => {
          // Set current time to Tuesday at 9:01 AM
          const currentTime = setMinutes(setHours(TUESDAY_JAN_2_2024, 9), 1);
          jest.setSystemTime(currentTime);

          const createdTime = setHours(TUESDAY_JAN_2_2024, 8); // Created at 8:00 AM

          expect(
            isDeliveredAccordingToSchedule({
              createdTime,
              deliverySchedule: multiDaySchedule,
            })
          ).toBe(false);
        });
      });
    });
  });

  describe('EveryNHours schedule', () => {
    let every4HoursSchedule: EveryNHoursDeliverySchedule;

    beforeEach(() => {
      const scheduleResult = makeEveryNHoursDeliverySchedule({hours: 4});
      expect(scheduleResult.success).toBe(true);
      if (scheduleResult.success) {
        every4HoursSchedule = scheduleResult.value;
      }
    });

    describe('makeEveryNHoursDeliverySchedule', () => {
      it('should throw on invalid hours', () => {
        const result1 = makeEveryNHoursDeliverySchedule({hours: -1});
        expect(result1.success).toBe(false);

        const result2 = makeEveryNHoursDeliverySchedule({hours: 0});
        expect(result2.success).toBe(false);

        const result3 = makeEveryNHoursDeliverySchedule({hours: 1.5});
        expect(result3.success).toBe(false);

        const result4 = makeEveryNHoursDeliverySchedule({hours: 25});
        expect(result4.success).toBe(false);
      });

      it('should not throw on valid hours', () => {
        const result1 = makeEveryNHoursDeliverySchedule({hours: 1});
        expect(result1.success).toBe(true);

        const result2 = makeEveryNHoursDeliverySchedule({hours: 12});
        expect(result2.success).toBe(true);

        const result3 = makeEveryNHoursDeliverySchedule({hours: 24});
        expect(result3.success).toBe(true);
      });
    });

    describe('findMostRecentDeliveryDateForEveryNHourSchedule', () => {
      it('should return midnight if the first delivery is today', () => {
        jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 0), 1)); // Mon 12:01 AM
        const date = findMostRecentDeliveryDateForEveryNHourSchedule({
          deliverySchedule: every4HoursSchedule,
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 0)); // Mon 12:00 AM
      });

      it('should return the most recent delivery date when in between deliveries', () => {
        jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 11), 59)); // Mon 11:59 AM
        const date = findMostRecentDeliveryDateForEveryNHourSchedule({
          deliverySchedule: every4HoursSchedule,
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 8)); // Mon 12:00 PM
      });

      it('should return now if now is exactly the delivery time', () => {
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 12)); // Mon 12:00 PM
        const date = findMostRecentDeliveryDateForEveryNHourSchedule({
          deliverySchedule: every4HoursSchedule,
        });
        expect(date).toEqual(setHours(MONDAY_JAN_1_2024, 12)); // Mon 12:00 PM
      });
    });

    describe('isDeliveredAccordingToEveryNHoursSchedule', () => {
      it('should not be delivered just before the next interval', () => {
        const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 0), 1); // 12:01 AM
        const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 3), 59); // 3:59 AM
        jest.setSystemTime(currentTime);

        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(false);
      });

      it('should be delivered exactly at the next interval', () => {
        const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 3), 59); // 3:59 AM
        const currentTime = setHours(MONDAY_JAN_1_2024, 4); // 4:00 AM
        jest.setSystemTime(currentTime);

        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });

      it('should be delivered just after the next interval passes', () => {
        const createdTime = setHours(MONDAY_JAN_1_2024, 2); // 2:00 AM
        const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 4), 1); // 4:01 AM
        jest.setSystemTime(currentTime);

        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });

      it('should be delivered if created exactly at delivery time', () => {
        const createdTime = setHours(MONDAY_JAN_1_2024, 8); // 8:00 AM
        jest.setSystemTime(createdTime); // 8:00 AM

        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });

      it('should be delivered at midnight', () => {
        const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 20), 30); // Mon 8:30 PM

        // Test at 11 PM same day => not delivered
        jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 23)); // Mon 11:00 PM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(false);

        // Test at 11:29 PM same day => not delivered
        jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 23), 29)); // Mon 11:29 PM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(false);

        // Test at 11:30 PM same day => delivered
        jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 23), 30)); // Mon 11:30 PM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(false);

        // Test at 11:59 PM same day => not delivered
        jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 23), 59)); // Mon 11:59 PM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(false);

        // Test at midnight, which is considered the next day => delivered
        jest.setSystemTime(setHours(TUESDAY_JAN_2_2024, 0)); // Tue 12:00 AM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);

        // Test at 12:01 AM next day => delivered
        jest.setSystemTime(setMinutes(setHours(TUESDAY_JAN_2_2024, 0), 1)); // Tue 12:01 AM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });

      it('should handle intervals that span multiple days', () => {
        const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 9), 15); // Mon 9:15 AM
        jest.setSystemTime(setMinutes(setHours(WEDNESDAY_JAN_3_2024, 9), 15)); // Wed 9:15 AM
        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });
    });
  });
});
