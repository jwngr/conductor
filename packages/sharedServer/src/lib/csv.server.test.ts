import {expectErrorResult, expectSuccessResult} from '@shared/lib/testUtils.shared';

import {parseCsv} from '@sharedServer/lib/csv.server';

describe('parseCsv', () => {
  test('should parse valid CSV with headers', () => {
    const csv = `name,age,city
John,30,New York
Jane,25,Los Angeles`;

    const result = parseCsv<{name: string; age: string; city: string}>(csv);
    expectSuccessResult(result, [
      {name: 'John', age: '30', city: 'New York'},
      {name: 'Jane', age: '25', city: 'Los Angeles'},
    ]);
  });

  test('should handle empty CSV', () => {
    const csv = '';
    const result = parseCsv<Record<string, string>>(csv);
    expectSuccessResult(result, []);
  });

  test('should handle CSV with only headers', () => {
    const csv = 'name,age,city';
    const result = parseCsv<Record<string, string>>(csv);
    expectSuccessResult(result, []);
  });

  test('should handle malformed CSV', () => {
    const csv = 'name,age,city\nJohn,30\nJane,25,Los Angeles';
    const result = parseCsv<Record<string, string>>(csv);
    expectErrorResult(result);
  });

  test('should handle values with commas in quotes', () => {
    const csv = 'name,age,city\nJohn,30,"New York, NY"';
    const result = parseCsv<Record<string, string>>(csv);
    expectSuccessResult(result, [{name: 'John', age: '30', city: 'New York, NY'}]);
  });
});
