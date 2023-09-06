import { expect, test } from '@jest/globals';
import { isStringSetAndNotEmpty } from './string-helper';

describe('isStringSetAndNotEmpty', () => {
  test('should return false if value is undefined', () => {
    expect(isStringSetAndNotEmpty(undefined)).toBeFalsy();
  });

  test('should return false if value is null', () => {
    expect(isStringSetAndNotEmpty(null)).toBeFalsy();
  });

  test('should return false if value is empty string', () => {
    expect(isStringSetAndNotEmpty('')).toBeFalsy();
  });

  test('should return false if value is string of all spaces', () => {
    expect(isStringSetAndNotEmpty(' ')).toBeFalsy();
  });

  test('should return true if value is non-empty string', () => {
    expect(isStringSetAndNotEmpty('Hello')).toBeTruthy();
  });
});
