import { describe, expect, it } from 'vitest';

import { Absent } from './Absent.js';
import { Option } from './Option.js';
import { Present } from './Present.js';

describe('Option', () => {
  describe('from', () => {
    it('must return a Present holding the value', () => {
      const value = Symbol('value');

      const result = Option.from(value);

      expect(result).toBeInstanceOf(Present);
      expect(result.present() && result.value()).toBe(value);
    });

    it('must return an Absent for undefined', () => {
      expect(Option.from(undefined)).toBeInstanceOf(Absent);
    });

    it('must return an Absent for null', () => {
      expect(Option.from(null)).toBeInstanceOf(Absent);
    });

    it.each([
      { name: 'false', value: false },
      { name: 'zero', value: 0 },
      { name: 'NaN', value: Number.NaN },
      { name: 'an empty string', value: '' },
    ])('must return a Present holding $name', ({ value }) => {
      const result = Option.from(value);

      expect(result).toBeInstanceOf(Present);
      expect(result.present() && result.value()).toBe(value);
    });
  });
});
