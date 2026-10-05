import { describe, expect, it, vi } from 'vitest';

import { Equatable } from '@fundamentry/trait';

import { type Either } from './Either.js';
import { Left } from './Left.js';
import { Right } from './Right.js';

describe('Left', () => {
  const value = Symbol('value');

  describe('[Equatable.symbol]', () => {
    it('must make Left Equatable', () => {
      expect(Equatable.is(new Left(value))).toBe(true);
    });

    it('must return true for a Left holding the same value', () => {
      expect(Equatable.equals(new Left(value), new Left(value))).toBe(true);
    });

    it('must return false for a Left holding a different value', () => {
      expect(
        Equatable.equals<unknown>(new Left(value), new Left(Symbol('other')))
      ).toBe(false);
    });

    it('must return false for a Right holding the same value', () => {
      expect(new Left(value)[Equatable.symbol](new Right(value))).toBe(false);
    });

    it('must return false for anything that is not a Left', () => {
      expect(new Left(value)[Equatable.symbol](value)).toBe(false);
      expect(new Left(value)[Equatable.symbol](null)).toBe(false);
    });

    it('must compare plain objects by reference', () => {
      const object = {};

      expect(Equatable.equals(new Left(object), new Left(object))).toBe(true);
      expect(Equatable.equals(new Left({}), new Left({}))).toBe(false);
    });

    it('must delegate to the value when it is Equatable', () => {
      const equals = vi.fn(() => true);
      const other = Symbol('other');

      const outcome = Equatable.equals<unknown>(
        new Left({ [Equatable.symbol]: equals }),
        new Left(other)
      );

      expect(equals).toHaveBeenCalledOnce();
      expect(equals).toHaveBeenCalledWith(other);
      expect(outcome).toBe(true);
    });

    it('must compare nested Eithers by value', () => {
      expect(
        Equatable.equals(new Left(new Left(1)), new Left(new Left(1)))
      ).toBe(true);
      expect(
        Equatable.equals(new Left(new Left(1)), new Left(new Left(2)))
      ).toBe(false);
    });
  });

  describe('[Symbol.toPrimitive]', () => {
    it('must return the string form of the value', () => {
      expect(new Left(value)[Symbol.toPrimitive]()).toBe('Symbol(value)');
    });

    it('must use the string form of a Stringable value', () => {
      expect(new Left(new Right(42))[Symbol.toPrimitive]()).toBe('42');
    });

    it('must be used when converted to a string', () => {
      const stringable: unknown = new Left(42);

      expect(String(stringable)).toBe('42');
    });
  });

  describe('isLeft', () => {
    it('must return true', () => {
      expect(new Left(value).isLeft()).toBe(true);
    });
  });

  describe('isRight', () => {
    it('must return false', () => {
      expect(new Left(value).isRight()).toBe(false);
    });
  });

  describe('left', () => {
    it('must return the value passed to the constructor', () => {
      expect(new Left(value).left()).toBe(value);
    });
  });

  describe('mapLeft', () => {
    it('must call the project with the value and wrap the result in a new Left', () => {
      const mapped = Symbol('mapped');
      const project = vi.fn(() => mapped);
      const left = new Left(value);

      const result = left.mapLeft(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(value);
      expect(result).toBeInstanceOf(Left);
      expect(result).not.toBe(left);
      expect(result.left()).toBe(mapped);
    });

    it('must leave the original Left unchanged', () => {
      const left = new Left(value);

      left.mapLeft(() => Symbol('mapped'));

      expect(left.left()).toBe(value);
    });
  });

  describe('mapRight', () => {
    it('must return itself unchanged', () => {
      const left = new Left(value);

      expect(left.mapRight(vi.fn())).toBe(left);
    });

    it('must not call a project passed through the wider Either contract', () => {
      const left = new Left(value);
      const either: Either<symbol, symbol> = left;
      const project = vi.fn();

      const outcome = either.mapRight(project);

      expect(project).not.toHaveBeenCalled();
      expect(outcome).toBe(left);
    });
  });

  describe('match', () => {
    it('must call onLeft with the value and return its result directly', () => {
      const matched = Symbol('matched');
      const onLeft = vi.fn(() => matched);
      const onRight = vi.fn();

      const result = new Left(value).match({ onLeft, onRight });

      expect(onLeft).toHaveBeenCalledOnce();
      expect(onLeft).toHaveBeenCalledWith(value);
      expect(onRight).not.toHaveBeenCalled();
      expect(result).toBe(matched);
    });

    it('must call onLeft when matched through the wider Either contract', () => {
      const matched = Symbol('matched');
      const either: Either<symbol, symbol> = new Left(value);
      const onLeft = vi.fn(() => matched);
      const onRight = vi.fn(() => Symbol('unexpected'));

      const outcome = either.match({ onLeft, onRight });

      expect(onLeft).toHaveBeenCalledWith(value);
      expect(onRight).not.toHaveBeenCalled();
      expect(outcome).toBe(matched);
    });
  });

  describe('merge', () => {
    it('must return the value passed to the constructor', () => {
      expect(new Left(value).merge()).toBe(value);
    });

    it('must return the value when merged through the wider Either contract', () => {
      const either: Either<symbol, symbol> = new Left(value);

      expect(either.merge()).toBe(value);
    });
  });

  describe('swap', () => {
    it('must return a new Right holding the value', () => {
      const left = new Left(value);

      const result = left.swap();

      expect(result).toBeInstanceOf(Right);
      expect(result.right()).toBe(value);
    });

    it('must round-trip back to a new Left holding the same value', () => {
      const left = new Left(value);

      const result = left.swap().swap();

      expect(result).toBeInstanceOf(Left);
      expect(result).not.toBe(left);
      expect(result.left()).toBe(value);
    });
  });
});
