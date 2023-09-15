/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getNextDayToUtc, getStartOfDayToUtc } from './utc-date-time-helper';

describe('utc date helpers', () => {
  test('tests getNextDayToUtc function', () => {
    const mockTimestamp = 1633024800000;
    const expectedDate = new Date('2021-10-01T00:00:00.000Z');

    const result = getNextDayToUtc(mockTimestamp);
    expect(result).toEqual(expectedDate);
  });

  test('tests getStartOfDayToUtc function', () => {
    const mockTimestamp = 1633024800000;
    const expectedDate = new Date('2021-09-30T00:00:00.000Z');

    const result = getStartOfDayToUtc(mockTimestamp);
    expect(result).toEqual(expectedDate);
  });
});
