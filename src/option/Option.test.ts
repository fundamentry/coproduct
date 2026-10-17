import { describe, expect, expectTypeOf, it } from 'vitest';

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

  describe('filter', () => {
    interface Circle {
      kind: 'circle';
      radius: number;
    }

    interface Square {
      kind: 'square';
      side: number;
    }

    type Shape = Circle | Square;

    const option: Option<Shape> = Option.from<Shape>({
      kind: 'circle',
      radius: 1,
    });

    it('must narrow the value type with a type guard', () => {
      const result = option.filter(
        (shape): shape is Circle => shape.kind === 'circle'
      );

      expectTypeOf(result).toEqualTypeOf<Option<Circle>>();
    });

    it('must keep the value type with a boolean predicate', () => {
      const predicate = (shape: Shape): boolean => shape.kind === 'circle';

      const result = option.filter(predicate);

      expectTypeOf(result).toEqualTypeOf<Option<Shape>>();
    });
  });
});
