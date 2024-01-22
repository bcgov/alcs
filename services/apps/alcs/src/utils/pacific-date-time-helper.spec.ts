/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  getNextDayToPacific,
  getStartOfDayToPacific,
  isDST,
} from './pacific-date-time-helper';

describe('Pacific date helpers', () => {
  test('tests getNextDayToPacific function', () => {
    const mockTimestamp = 1633024800000;
    const expectedDate = new Date('2021-10-01T07:00:00.000Z');

    const result = getNextDayToPacific(mockTimestamp);
    expect(result).toEqual(expectedDate);
  });

  test('tests getStartOfDayToPacific function', () => {
    const mockTimestamp = 1633024800000;
    const expectedDate = new Date('2021-09-30T07:00:00.000Z');

    const result = getStartOfDayToPacific(mockTimestamp);
    expect(result).toEqual(expectedDate);
  });
});

describe('isDST function', () => {
  // Test when it's daylight saving time
  it("should return true when it's daylight saving time", () => {
    jest.useFakeTimers().setSystemTime(new Date('2021-07-01'));

    expect(isDST()).toBe(true);
    jest.useRealTimers();
  });

  // Test when it's not daylight saving time
  it("should return false when it's not daylight saving time", () => {
    jest.useFakeTimers().setSystemTime(new Date('2021-01-01'));

    expect(isDST()).toBe(false);
    jest.useRealTimers();
  });
});
