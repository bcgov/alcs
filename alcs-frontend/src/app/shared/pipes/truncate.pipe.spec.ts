import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeAll(() => {
    pipe = new TruncatePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should not shorten the string shorter than the limit', () => {
    expect(pipe.transform('sampletext', 20)).toBe('sampletext');
  });

  it('should shorten the string longer than the limit', () => {
    expect(pipe.transform('sampletext', 5)).toBe('sampl...');
  });

});
