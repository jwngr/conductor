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

import {DayOfWeek} from '@shared/types/deliverySchedules.types';
import type {
  DaysAndTimesOfWeekDeliverySchedule,
  EveryNHoursDeliverySchedule,
  TimeOfDay,
} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';

function timeOfDay(hour: number, minute: number): Result<TimeOfDay> {
  return makeTimeOfDay({hour, minute});
}

describe('deliverySchedules', () => {
  // Constants for test dates
  const MONDAY_JAN_1_2024 = new Date(2024, 0, 1); // Monday January 1, 2024
  const TUESDAY_JAN_2_2024 = new Date(2024, 0, 2); // Tuesday January 2, 2024
  const WEDNESDAY_JAN_3_2024 = new Date(2024, 0, 3); // Wednesday January 3, 2024

  beforeEach(() => {
    jest.useFakeTimers();
    // Set a default time of Monday, January 1, 2024 at 9:00 AM
    jest.setSystemTime(setHours(setMinutes(MONDAY_JAN_1_2024, 0), 9));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('factory functions', () => {
    describe('timeOfDay', () => {
      it('should create a valid time of day', () => {
        const result = timeOfDay(9, 0);
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.value).toEqual({hour: 9, minute: 0});
      });

      it('should reject invalid hour', () => {
        const result = timeOfDay(24, 0);
        expect(result.success).toBe(false);
      });

      it('should reject invalid minute', () => {
        const result = timeOfDay(9, 60);
        expect(result.success).toBe(false);
      });
    });

    describe('makeDaysAndTimesOfWeekDeliverySchedule', () => {
      it('should create a valid schedule', () => {
        const timeResult = timeOfDay(9, 0);
        expect(timeResult.success).toBe(true);
        if (!timeResult.success) return;

        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday],
          times: [timeResult.value],
        });
        expect(scheduleResult.success).toBe(true);
      });

      it('should reject empty days array', () => {
        const timeResult = timeOfDay(9, 0);
        expect(timeResult.success).toBe(true);
        if (!timeResult.success) return;

        const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [],
          times: [timeResult.value],
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
    });

    describe('makeEveryNHoursDeliverySchedule', () => {
      it('should create a valid schedule', () => {
        const scheduleResult = makeEveryNHoursDeliverySchedule({hours: 4});
        expect(scheduleResult.success).toBe(true);
      });

      it('should reject invalid hours', () => {
        const scheduleResult = makeEveryNHoursDeliverySchedule({hours: -1});
        expect(scheduleResult.success).toBe(false);
      });
    });
  });

  describe('Immediate schedule', () => {
    it('should always deliver', () => {
      const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Monday at 8:00 AM

      expect(
        isDeliveredAccordingToSchedule({
          createdTime,
          deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
        })
      ).toBe(true);
    });
  });

  describe('Never schedule', () => {
    it('should never deliver', () => {
      const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Monday at 8:00 AM

      expect(
        isDeliveredAccordingToSchedule({
          createdTime,
          deliverySchedule: NEVER_DELIVERY_SCHEDULE,
        })
      ).toBe(false);
    });
  });

  describe('DaysAndTimesOfWeek schedule', () => {
    let mondaySchedule: DaysAndTimesOfWeekDeliverySchedule;
    let multiDaySchedule: DaysAndTimesOfWeekDeliverySchedule;

    beforeEach(() => {
      // Create a schedule for Monday at 9:00 AM
      const timeOfDayResult = timeOfDay(9, 0);
      expect(timeOfDayResult.success).toBe(true);
      if (!timeOfDayResult.success) return;

      const scheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
        days: [DayOfWeek.Monday],
        times: [timeOfDayResult.value],
      });
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;
      mondaySchedule = scheduleResult.value;

      // Create a schedule for Monday and Wednesday at 9:00 AM and 3:00 PM
      const time1Result = timeOfDay(9, 0);
      const time2Result = timeOfDay(15, 0);
      expect(time1Result.success).toBe(true);
      expect(time2Result.success).toBe(true);
      if (!time1Result.success || !time2Result.success) return;

      const multiDayResult = makeDaysAndTimesOfWeekDeliverySchedule({
        days: [DayOfWeek.Monday, DayOfWeek.Wednesday],
        times: [time1Result.value, time2Result.value],
      });
      expect(multiDayResult.success).toBe(true);
      if (!multiDayResult.success) return;
      multiDaySchedule = multiDayResult.value;
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
    });

    describe('single day and time schedule', () => {
      it('should deliver 1 minute after scheduled time', () => {
        // Set current time to Monday at 9:01 AM
        const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 9), 1);
        jest.setSystemTime(currentTime);

        const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Created at 8:00 AM

        expect(
          isDeliveredAccordingToSchedule({
            createdTime,
            deliverySchedule: mondaySchedule,
          })
        ).toBe(true);
      });

      it('should not deliver 1 minute before scheduled time', () => {
        // Set current time to Monday at 8:59 AM
        const currentTime = setMinutes(setHours(MONDAY_JAN_1_2024, 8), 59);
        jest.setSystemTime(currentTime);

        const createdTime = setHours(MONDAY_JAN_1_2024, 8); // Created at 8:00 AM

        expect(
          isDeliveredAccordingToSchedule({
            createdTime,
            deliverySchedule: mondaySchedule,
          })
        ).toBe(false);
      });

      it('should not deliver on a different day', () => {
        // Set current time to Tuesday at 9:01 AM
        const currentTime = setMinutes(setHours(TUESDAY_JAN_2_2024, 9), 1);
        jest.setSystemTime(currentTime);

        const createdTime = setHours(TUESDAY_JAN_2_2024, 8); // Created at 8:00 AM

        expect(
          isDeliveredAccordingToSchedule({
            createdTime,
            deliverySchedule: mondaySchedule,
          })
        ).toBe(false);
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
      it('should deliver 1 hour after the interval has passed', () => {
        // Set current time to 5 hours after creation (4 hour interval + 1 hour).
        const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 0), 1); // 12:01 AM
        const currentTime = setHours(MONDAY_JAN_1_2024, 5); // 5:00 AM
        jest.setSystemTime(currentTime);

        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });

      it('should deliver if created at exact time that schedule triggers', () => {
        // Set current time to same as created time.
        const createdTime = setHours(MONDAY_JAN_1_2024, 8); // 8:00 AM
        jest.setSystemTime(createdTime); // 8:00 AM

        expect(
          isDeliveredAccordingToSchedule({createdTime, deliverySchedule: every4HoursSchedule})
        ).toBe(true);
      });

      it('should deliver at midnight', () => {
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

      it('should consider midnight a delivery time', () => {
        const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 23), 59); // Mon 11:59 PM

        jest.setSystemTime(setMinutes(setHours(TUESDAY_JAN_2_2024, 0), 1)); // Tues 12:01 AM
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
