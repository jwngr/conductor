import {parseCsv} from '@sharedClient/lib/csv.client';

describe('parseCsv', () => {
  test('should parse valid CSV with headers', () => {
    const csv = `name,age,city
John,30,New York
Jane,25,Los Angeles`;

    const result = parseCsv<{name: string; age: string; city: string}>(csv);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value).toEqual([
      {name: 'John', age: '30', city: 'New York'},
      {name: 'Jane', age: '25', city: 'Los Angeles'},
    ]);
  });

  test('should handle empty CSV', () => {
    const csv = '';
    const result = parseCsv<Record<string, string>>(csv);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toEqual([]);
  });

  test('should handle CSV with only headers', () => {
    const csv = 'name,age,city';
    const result = parseCsv<Record<string, string>>(csv);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toEqual([]);
  });

  test('should handle malformed CSV', () => {
    const csv = 'name,age,city\nJohn,30\nJane,25,Los Angeles';
    const result = parseCsv<Record<string, string>>(csv);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBeDefined();
  });

  test('should handle values with commas in quotes', () => {
    const csv = 'name,age,city\nJohn,30,"New York, NY"';
    const result = parseCsv<Record<string, string>>(csv);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toEqual([{name: 'John', age: '30', city: 'New York, NY'}]);
  });
});
