import { formatNameSearchString } from './search-helper';

describe('formatStringToSearchStringWithWildCard', () => {
  test('should format string correctly when input contains single word', () => {
    const input = 'word';
    const expectedOutput = 'word';
    const actualOutput = formatNameSearchString(input);
    expect(actualOutput).toBe(expectedOutput);
  });

  test('should format string correctly when input contains multiple words', () => {
    const input = 'multiple words';
    const expectedOutput = 'multiple words';
    const actualOutput = formatNameSearchString(input);
    expect(actualOutput).toBe(expectedOutput);
  });

  test('should format string correctly when input contains ending wildcards', () => {
    const input = 'multiple %words';
    const expectedOutput = 'multiple %words';
    const actualOutput = formatNameSearchString(input);
    expect(actualOutput).toBe(expectedOutput);
  });

  test('should trim input and format string correctly', () => {
    const input = '   trimmed word  ';
    const expectedOutput = 'trimmed word';
    const actualOutput = formatNameSearchString(input);
    expect(actualOutput).toBe(expectedOutput);
  });

  it('should handle empty string correctly', () => {
    const input = '';
    const expectedOutput = '';
    expect(formatNameSearchString(input)).toBe(expectedOutput);
  });
});
