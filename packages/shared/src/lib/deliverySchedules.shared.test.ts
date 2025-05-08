import {setHours, setMinutes} from 'date-fns';

import {makeTimeOfDay} from '@shared/lib/datetime.shared';
import {
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
    let schedule: EveryNHoursDeliverySchedule;

    beforeEach(() => {
      const scheduleResult = makeEveryNHoursDeliverySchedule({hours: 4});
      expect(scheduleResult.success).toBe(true);
      if (scheduleResult.success) {
        schedule = scheduleResult.value;
      }
    });

    it('should deliver 1 hour after the interval has passed', () => {
      // Set current time to 5 hours after creation (4 hour interval + 1 hour)
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 0), 1); // 12:01 AM
      const currentTime = setHours(MONDAY_JAN_1_2024, 5); // 5:00 AM
      jest.setSystemTime(currentTime);

      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);
    });

    it('should deliver if created at exact time that schedule triggers', () => {
      // Set current time to same as created time.
      const createdTime = setHours(MONDAY_JAN_1_2024, 8); // 8:00 AM
      jest.setSystemTime(createdTime); // 8:00 AM

      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);
    });

    it('should not deliver 1 hour before the interval has passed', () => {
      // Set current time to 3 hours after creation (4 hour interval - 1 hour)
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 0), 1); // 12:01 AM
      const currentTime = setHours(MONDAY_JAN_1_2024, 3); // 3:00 AM
      jest.setSystemTime(currentTime);

      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(false);
    });

    it('should deliver 1 minute after midnight when created in the evening', () => {
      const createdTime = setHours(MONDAY_JAN_1_2024, 21); // 9:00 PM

      jest.setSystemTime(setMinutes(setHours(TUESDAY_JAN_2_2024, 0), 1)); // 12:01 AM next day
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);
    });

    it('should not deliver 1 minute before midnight when created in the evening', () => {
      const createdTime = setHours(MONDAY_JAN_1_2024, 21); // 9:00 PM

      jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 23), 59)); // 11:59 PM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(false);
    });

    it('should handle multiple intervals across days', () => {
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 20), 1); // Mon 8:01 PM

      // Test at 11 PM same day => not delivered
      jest.setSystemTime(setHours(MONDAY_JAN_1_2024, 23)); // Mon 11:00 PM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(false);

      // Test at 11:59 PM same day => not delivered
      jest.setSystemTime(setMinutes(setHours(MONDAY_JAN_1_2024, 23), 59)); // Mon 11:59 PM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(false);

      // Test at 12:01 AM next day => delivered
      jest.setSystemTime(setHours(TUESDAY_JAN_2_2024, 0)); // Tue 12:00 AM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);

      // Test at 12:01 AM next day => delivered
      jest.setSystemTime(setMinutes(setHours(TUESDAY_JAN_2_2024, 0), 1)); // Tue 12:01 AM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);

      // Test at 4 AM next day => delivered
      jest.setSystemTime(setHours(TUESDAY_JAN_2_2024, 4)); // Tue 4:00 AM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);
    });

    it('should consider midnight a delivery time', () => {
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 23), 59); // Mon 11:59 PM

      jest.setSystemTime(setMinutes(setHours(TUESDAY_JAN_2_2024, 0), 1)); // Tues 12:01 AM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);
    });

    it('should handle intervals that span multiple days', () => {
      const createdTime = setMinutes(setHours(MONDAY_JAN_1_2024, 9), 15); // Mon 9:15 AM

      jest.setSystemTime(setMinutes(setHours(WEDNESDAY_JAN_3_2024, 9), 15)); // Wed 9:15 AM
      expect(isDeliveredAccordingToSchedule({createdTime, deliverySchedule: schedule})).toBe(true);
    });
  });
});
