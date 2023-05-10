import { ColumnNumericTransformer } from './column-numeric-transform';

describe('ColumnNumericTransformer', () => {
  let transformer: ColumnNumericTransformer;

  beforeEach(() => {
    transformer = new ColumnNumericTransformer();
  });

  describe('to', () => {
    it('should return the input number', () => {
      expect(transformer.to(5)).toEqual(5);
    });

    it('should return null for undefined or null input', () => {
      expect(transformer.to(undefined)).toBeNull();
      expect(transformer.to(null)).toBeNull();
    });
  });

  describe('from', () => {
    it('should parse the input string to a number', () => {
      expect(transformer.from('5')).toEqual(5);
    });

    it('should return null for non-numeric input', () => {
      expect(transformer.from('foo')).toBeNull();
    });

    it('should return null for undefined or null input', () => {
      expect(transformer.from(undefined)).toBeNull();
      expect(transformer.from(null)).toBeNull();
    });
  });
});
