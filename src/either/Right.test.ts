import { describe, expect, it, vi } from 'vitest';

import { Equatable } from '@fundamentry/trait';

import { type Either } from './Either.js';
import { Left } from './Left.js';
import { Right } from './Right.js';

describe('Right', () => {
  const value = Symbol('value');

  describe('[Equatable.symbol]', () => {
    it('must make Right Equatable', () => {
      expect(Equatable.is(new Right(value))).toBe(true);
    });

    it('must return true for a Right holding the same value', () => {
      expect(Equatable.equals(new Right(value), new Right(value))).toBe(true);
    });

    it('must return false for a Right holding a different value', () => {
      expect(
        Equatable.equals<unknown>(new Right(value), new Right(Symbol('other')))
      ).toBe(false);
    });

    it('must return false for a Left holding the same value', () => {
      expect(new Right(value)[Equatable.symbol](new Left(value))).toBe(false);
    });

    it('must return false for anything that is not a Right', () => {
      expect(new Right(value)[Equatable.symbol](value)).toBe(false);
      expect(new Right(value)[Equatable.symbol](null)).toBe(false);
    });

    it('must compare plain objects by reference', () => {
      const object = {};

      expect(Equatable.equals(new Right(object), new Right(object))).toBe(true);
      expect(Equatable.equals(new Right({}), new Right({}))).toBe(false);
    });

    it('must delegate to the value when it is Equatable', () => {
      const equals = vi.fn(() => true);
      const other = Symbol('other');

      const outcome = Equatable.equals<unknown>(
        new Right({ [Equatable.symbol]: equals }),
        new Right(other)
      );

      expect(equals).toHaveBeenCalledOnce();
      expect(equals).toHaveBeenCalledWith(other);
      expect(outcome).toBe(true);
    });

    it('must compare nested Eithers by value', () => {
      expect(
        Equatable.equals(new Right(new Right(1)), new Right(new Right(1)))
      ).toBe(true);
      expect(
        Equatable.equals(new Right(new Right(1)), new Right(new Right(2)))
      ).toBe(false);
    });
  });

  describe('[Symbol.toPrimitive]', () => {
    it('must return the string form of the value', () => {
      expect(new Right(value)[Symbol.toPrimitive]()).toBe('Symbol(value)');
    });

    it('must use the string form of a Stringable value', () => {
      expect(new Right(new Left(42))[Symbol.toPrimitive]()).toBe('42');
    });

    it('must be used when converted to a string', () => {
      const stringable: unknown = new Right(42);

      expect(String(stringable)).toBe('42');
    });
  });

  describe('isLeft', () => {
    it('must return false', () => {
      expect(new Right(value).isLeft()).toBe(false);
    });
  });

  describe('isRight', () => {
    it('must return true', () => {
      expect(new Right(value).isRight()).toBe(true);
    });
  });

  describe('right', () => {
    it('must return the value passed to the constructor', () => {
      expect(new Right(value).right()).toBe(value);
    });
  });

  describe('mapLeft', () => {
    it('must return itself unchanged', () => {
      const right = new Right(value);

      expect(right.mapLeft(vi.fn())).toBe(right);
    });

    it('must not call a project passed through the wider Either contract', () => {
      const right = new Right(value);
      const either: Either<symbol, symbol> = right;
      const project = vi.fn();

      const outcome = either.mapLeft(project);

      expect(project).not.toHaveBeenCalled();
      expect(outcome).toBe(right);
    });
  });

  describe('mapRight', () => {
    it('must call the project with the value and wrap the result in a new Right', () => {
      const mapped = Symbol('mapped');
      const project = vi.fn(() => mapped);
      const right = new Right(value);

      const result = right.mapRight(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(value);
      expect(result).toBeInstanceOf(Right);
      expect(result).not.toBe(right);
      expect(result.right()).toBe(mapped);
    });

    it('must leave the original Right unchanged', () => {
      const right = new Right(value);

      right.mapRight(() => Symbol('mapped'));

      expect(right.right()).toBe(value);
    });
  });

  describe('match', () => {
    it('must call onRight with the value and return its result directly', () => {
      const matched = Symbol('matched');
      const onLeft = vi.fn();
      const onRight = vi.fn(() => matched);

      const result = new Right(value).match({ onLeft, onRight });

      expect(onRight).toHaveBeenCalledOnce();
      expect(onRight).toHaveBeenCalledWith(value);
      expect(onLeft).not.toHaveBeenCalled();
      expect(result).toBe(matched);
    });

    it('must call onRight when matched through the wider Either contract', () => {
      const matched = Symbol('matched');
      const either: Either<symbol, symbol> = new Right(value);
      const onLeft = vi.fn(() => Symbol('unexpected'));
      const onRight = vi.fn(() => matched);

      const outcome = either.match({ onLeft, onRight });

      expect(onRight).toHaveBeenCalledWith(value);
      expect(onLeft).not.toHaveBeenCalled();
      expect(outcome).toBe(matched);
    });
  });

  describe('merge', () => {
    it('must return the value passed to the constructor', () => {
      expect(new Right(value).merge()).toBe(value);
    });

    it('must return the value when merged through the wider Either contract', () => {
      const either: Either<symbol, symbol> = new Right(value);

      expect(either.merge()).toBe(value);
    });
  });

  describe('swap', () => {
    it('must return a new Left holding the value', () => {
      const right = new Right(value);

      const result = right.swap();

      expect(result).toBeInstanceOf(Left);
      expect(result.left()).toBe(value);
    });

    it('must round-trip back to a new Right holding the same value', () => {
      const right = new Right(value);

      const result = right.swap().swap();

      expect(result).toBeInstanceOf(Right);
      expect(result).not.toBe(right);
      expect(result.right()).toBe(value);
    });
  });
});
