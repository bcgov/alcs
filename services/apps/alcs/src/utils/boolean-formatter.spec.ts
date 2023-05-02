import { formatBooleanToYesNoString } from './boolean-formatter';

describe('formatBooleanToYesNoString', () => {
  it('should convert true to "Yes"', () => {
    expect(formatBooleanToYesNoString(true)).toEqual('Yes');
  });

  it('should convert false to "No"', () => {
    expect(formatBooleanToYesNoString(false)).toEqual('No');
  });

  it('should return undefined for null or undefined input', () => {
    expect(formatBooleanToYesNoString(null)).toBeUndefined();
    expect(formatBooleanToYesNoString(undefined)).toBeUndefined();
  });
});
