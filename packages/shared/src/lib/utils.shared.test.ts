import {pluralizeWithCount} from '@shared/lib/utils.shared';

describe('pluralizeWithCount', () => {
  test('should return singular form with count of 1', () => {
    expect(pluralizeWithCount(1, 'item')).toBe('1 item');
  });

  test('should return plural form with count > 1', () => {
    expect(pluralizeWithCount(2, 'item')).toBe('2 items');
  });

  test('should return plural form with count of 0', () => {
    expect(pluralizeWithCount(0, 'item')).toBe('0 items');
  });

  test('should use provided plural form when available', () => {
    expect(pluralizeWithCount(1, 'person', 'people')).toBe('1 person');
    expect(pluralizeWithCount(2, 'person', 'people')).toBe('2 people');
  });

  test('should handle singular words ending with "s" correctly', () => {
    expect(pluralizeWithCount(1, 'class')).toBe('1 class');
    expect(pluralizeWithCount(2, 'class')).toBe('2 classes');
  });

  test('should format numbers with commas for large values', () => {
    expect(pluralizeWithCount(1000, 'item')).toBe('1,000 items');
    expect(pluralizeWithCount(1000000, 'download')).toBe('1,000,000 downloads');
  });
});
