import {makeTimeOfDay, validateHour, validateMinute} from '@shared/lib/datetime.shared';

describe('Time validation', () => {
  describe('validateHour', () => {
    it('should accept valid hours', () => {
      expect(validateHour(0).success).toBe(true);
      expect(validateHour(12).success).toBe(true);
      expect(validateHour(23).success).toBe(true);
    });

    it('should reject invalid hours', () => {
      expect(validateHour(-1).success).toBe(false);
      expect(validateHour(24).success).toBe(false);
      expect(validateHour(100).success).toBe(false);
    });

    it('should return the same hour on success', () => {
      const result = validateHour(12);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.value).toBe(12);
    });

    it('should return an error message on failure', () => {
      const result = validateHour(100);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toBe('Hour must be between 0 and 23');
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
      expect(validateMinute(60).success).toBe(false);
      expect(validateMinute(100).success).toBe(false);
    });

    it('should return the same minute on success', () => {
      const result = validateMinute(30);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.value).toBe(30);
    });

    it('should return an error message on failure', () => {
      const result = validateMinute(60);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toBe('Minute must be between 0 and 59');
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
      if (result1.success) return;
      expect(result1.error.message).toBe('Hour must be between 0 and 23');

      const result2 = makeTimeOfDay({hour: 33, minute: 30});
      expect(result2.success).toBe(false);
      if (result2.success) return;
      expect(result2.error.message).toBe('Hour must be between 0 and 23');

      const result3 = makeTimeOfDay({hour: -1, minute: 30});
      expect(result3.success).toBe(false);
      if (result3.success) return;
      expect(result3.error.message).toBe('Hour must be between 0 and 23');
    });

    it('should reject invalid minutes', () => {
      const result1 = makeTimeOfDay({hour: 12, minute: 60});
      expect(result1.success).toBe(false);
      if (result1.success) return;
      expect(result1.error.message).toBe('Minute must be between 0 and 59');

      const result2 = makeTimeOfDay({hour: 12, minute: 100});
      expect(result2.success).toBe(false);
      if (result2.success) return;
      expect(result2.error.message).toBe('Minute must be between 0 and 59');

      const result3 = makeTimeOfDay({hour: 12, minute: -1});
      expect(result3.success).toBe(false);
      if (result3.success) return;
      expect(result3.error.message).toBe('Minute must be between 0 and 59');
    });

    it('should reject both invalid hour and minute', () => {
      const result = makeTimeOfDay({hour: -1, minute: -1});
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toBe('Hour must be between 0 and 23');
    });
  });
});
