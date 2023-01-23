import { formatIncomingDate } from './incoming-date.formatter';

describe('incoming-date.formatter.ts', () => {
  it('should be defined', () => {
    expect(formatIncomingDate).toBeDefined();
    const result = formatIncomingDate(null);
    expect(result).toEqual(null);
  });

  it('should return null if null passed', () => {
    const result = formatIncomingDate(null);
    expect(result).toEqual(null);
  });

  it('should return undefined if undefined passed', () => {
    const result = formatIncomingDate(undefined);
    expect(result).toEqual(undefined);
  });

  it('should return Date if number passed', () => {
    const epoch = 1674496837;
    const result = formatIncomingDate(epoch);
    expect(result).toEqual(new Date(epoch));
  });
});
