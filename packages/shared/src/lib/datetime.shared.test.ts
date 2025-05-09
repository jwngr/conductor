import {
  formatRelativeTime,
  makeTimeOfDay,
  validateHour,
  validateMinute,
} from '@shared/lib/datetime.shared';

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
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toBe(12);
  });

  it('should return an error message for hours outside the valid range', () => {
    const result = validateHour(100);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe('Hour must be between 0 and 23');
  });

  it('should return an error message for non-integer hours', () => {
    const result = validateHour(1.5);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe('Hour must be an integer');
  });
});

describe('validateMinute', () => {
  it('should accept valid minutes', () => {
    expect(validateMinute(0).success).toBe(true);
    expect(validateMinute(30).success).toBe(true);
    expect(validateMinute(59).success).toBe(true);
  });

  it('should reject invalid minutes', () => {
    expect(validateMinute(-1).success).toBe(false);
    expect(validateMinute(1.5).success).toBe(false);
    expect(validateMinute(60).success).toBe(false);
    expect(validateMinute(100).success).toBe(false);
  });

  it('should return the same minute on success', () => {
    const result = validateMinute(30);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toBe(30);
  });

  it('should return an error message for minutes outside the valid range', () => {
    const result = validateMinute(60);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe('Minute must be between 0 and 59');
  });

  it('should return an error message for non-integer minutes', () => {
    const result = validateMinute(1.5);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe('Minute must be an integer');
  });
});

describe('makeTimeOfDay', () => {
  it('should accept valid time of day', () => {
    const result = makeTimeOfDay({hour: 12, minute: 30});
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.hour).toEqual(12);
    expect(result.value.minute).toEqual(30);
  });

  it('should reject invalid hours', () => {
    const result1 = makeTimeOfDay({hour: 24, minute: 30});
    expect(result1.success).toBe(false);

    const result2 = makeTimeOfDay({hour: 33, minute: 30});
    expect(result2.success).toBe(false);

    const result3 = makeTimeOfDay({hour: -1, minute: 30});
    expect(result3.success).toBe(false);

    const result4 = makeTimeOfDay({hour: 12, minute: 1.5});
    expect(result4.success).toBe(false);
  });

  it('should reject invalid minutes', () => {
    const result1 = makeTimeOfDay({hour: 12, minute: 60});
    expect(result1.success).toBe(false);

    const result2 = makeTimeOfDay({hour: 12, minute: 100});
    expect(result2.success).toBe(false);

    const result3 = makeTimeOfDay({hour: 12, minute: -1});
    expect(result3.success).toBe(false);

    const result4 = makeTimeOfDay({hour: 12, minute: 1.5});
    expect(result4.success).toBe(false);
  });

  it('should reject both invalid hour and minute', () => {
    const result = makeTimeOfDay({hour: -1, minute: -1});
    expect(result.success).toBe(false);
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
