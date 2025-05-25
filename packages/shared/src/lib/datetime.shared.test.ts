import {
  dayOfWeekToIndex,
  formatRelativeTime,
  makeTimeOfDay,
  validateHour,
  validateMinute,
} from '@shared/lib/datetime.shared';
import {expectErrorResult, expectSuccessResult} from '@shared/lib/testUtils.shared';

import {DayOfWeek} from '@shared/types/datetime.types';

describe('validateHour', () => {
  it('should accept valid hours', () => {
    expect(validateHour(0).success).toBe(true);
    expect(validateHour(12).success).toBe(true);
    expect(validateHour(23).success).toBe(true);
  });

  it('should reject invalid hours', () => {
    expect(validateHour(-1).success).toBe(false);
    expect(validateHour(1.5).success).toBe(false);
    expect(validateHour(24).success).toBe(false);
    expect(validateHour(100).success).toBe(false);
  });

  it('should return the same hour on success', () => {
    const result = validateHour(12);
    expectSuccessResult(result, 12);
  });

  it('should return an error message for hours outside the valid range', () => {
    const result = validateHour(100);
    expectErrorResult(result);
  });

  it('should return an error message for non-integer hours', () => {
    const result = validateHour(1.5);
    expectErrorResult(result);
  });
});

describe('validateMinute', () => {
  it('should accept valid minutes', () => {
    expectSuccessResult(validateMinute(0), 0);
    expectSuccessResult(validateMinute(30), 30);
    expectSuccessResult(validateMinute(59), 59);
  });

  it('should reject invalid minutes', () => {
    expectErrorResult(validateMinute(-1));
    expectErrorResult(validateMinute(1.5));
    expectErrorResult(validateMinute(60));
    expectErrorResult(validateMinute(100));
  });

  it('should return the same minute on success', () => {
    const result = validateMinute(30);
    expectSuccessResult(result, 30);
  });

  it('should return an error message for minutes outside the valid range', () => {
    const result = validateMinute(60);
    expectErrorResult(result);
  });

  it('should return an error message for non-integer minutes', () => {
    const result = validateMinute(1.5);
    expectErrorResult(result);
  });
});

describe('makeTimeOfDay', () => {
  it('should accept valid time of day', () => {
    const result = makeTimeOfDay({hour: 12, minute: 30});
    expectSuccessResult(result, {hour: 12, minute: 30});
  });

  it('should reject invalid hours', () => {
    const result1 = makeTimeOfDay({hour: 24, minute: 30});
    expectErrorResult(result1);

    const result2 = makeTimeOfDay({hour: 33, minute: 30});
    expectErrorResult(result2);

    const result3 = makeTimeOfDay({hour: -1, minute: 30});
    expectErrorResult(result3);

    const result4 = makeTimeOfDay({hour: 12, minute: 1.5});
    expectErrorResult(result4);
  });

  it('should reject invalid minutes', () => {
    const result1 = makeTimeOfDay({hour: 12, minute: 60});
    expectErrorResult(result1);

    const result2 = makeTimeOfDay({hour: 12, minute: 100});
    expectErrorResult(result2);

    const result3 = makeTimeOfDay({hour: 12, minute: -1});
    expectErrorResult(result3);

    const result4 = makeTimeOfDay({hour: 12, minute: 1.5});
    expectErrorResult(result4);
  });

  it('should reject both invalid hour and minute', () => {
    const result = makeTimeOfDay({hour: -1, minute: -1});
    expectErrorResult(result);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should format time as "now" for current time', () => {
    const now = new Date();
    jest.setSystemTime(now);
    expect(formatRelativeTime(now)).toBe('0 seconds ago');
  });

  it('should format time in seconds', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('30 seconds ago');
  });

  it('should format time in minutes', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('should format time in hours', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });

  it('should format time in days', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
  });

  it('should format future times correctly', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesFromNow)).toBe('in 5 minutes');
  });

  it('should handle dates far in the past', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneYearAgo)).toBe('1 year ago');
  });

  it('should handle dates far in the future', () => {
    const now = new Date();
    jest.setSystemTime(now);
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneYearFromNow)).toBe('in 1 year');
  });
});

describe('dayOfWeekToIndex', () => {
  it('should be correct for every day of the week', () => {
    expect(dayOfWeekToIndex(DayOfWeek.Sunday)).toBe(0);
    expect(dayOfWeekToIndex(DayOfWeek.Monday)).toBe(1);
    expect(dayOfWeekToIndex(DayOfWeek.Tuesday)).toBe(2);
    expect(dayOfWeekToIndex(DayOfWeek.Wednesday)).toBe(3);
    expect(dayOfWeekToIndex(DayOfWeek.Thursday)).toBe(4);
    expect(dayOfWeekToIndex(DayOfWeek.Friday)).toBe(5);
    expect(dayOfWeekToIndex(DayOfWeek.Saturday)).toBe(6);
  });
});
