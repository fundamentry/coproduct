import { describe, expect, it, vi } from 'vitest';

import { Equatable } from '@fundamentry/trait';

import { Success } from '#project/result';

import { Absent } from './Absent.js';
import { Present } from './Present.js';

describe('Present', () => {
  const value = Symbol('value');

  describe('present', () => {
    it('must return true', () => {
      expect(new Present(value).present()).toBe(true);
    });
  });

  describe('value', () => {
    it('must return the value passed to the constructor', () => {
      expect(new Present(value).value()).toBe(value);
    });
  });

  describe('filter', () => {
    it('must call the predicate with the value and return itself when it passes', () => {
      const predicate = vi.fn(() => true);
      const present = new Present(value);

      const result = present.filter(predicate);

      expect(predicate).toHaveBeenCalledOnce();
      expect(predicate).toHaveBeenCalledWith(value);
      expect(result).toBe(present);
    });

    it('must return an Absent when the predicate fails', () => {
      expect(new Present(value).filter(() => false)).toBeInstanceOf(Absent);
    });

    it('must narrow the value type with a type guard', () => {
      const option = new Present('text');

      const result = option.filter(
        (current): current is string => typeof current === 'string'
      );

      expect(result).toBe(option);
    });
  });

  describe('flatMap', () => {
    it('must call the project with the value and return its result directly', () => {
      const returned = new Absent();
      const project = vi.fn(() => returned);
      const present = new Present(value);

      const result = present.flatMap(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(value);
      expect(result).toBe(returned);
    });
  });

  describe('getOr', () => {
    it('must return the value instead of the fallback', () => {
      expect(new Present(value).getOr(Symbol('fallback'))).toBe(value);
    });

    it('must return the value when called through the wider Option contract', () => {
      const option = new Present(value);

      const outcome = option.getOr(undefined);

      expect(outcome).toBe(value);
    });
  });

  describe('getOrThrow', () => {
    it('must return the value without calling the exception', () => {
      const exception = vi.fn(() => new Error('unexpected'));

      const result = new Present(value).getOrThrow(exception);

      expect(exception).not.toHaveBeenCalled();
      expect(result).toBe(value);
    });

    it('must return the value when called through the wider Option contract', () => {
      const option = new Present(value);
      const exception = vi.fn(() => new Error('unexpected'));

      const outcome: symbol = option.getOrThrow(exception);

      expect(exception).not.toHaveBeenCalled();
      expect(outcome).toBe(value);
    });
  });

  describe('map', () => {
    it('must call the project with the value and wrap the result in a new Present', () => {
      const mapped = Symbol('mapped');
      const project = vi.fn(() => mapped);
      const present = new Present(value);

      const result = present.map(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(value);
      expect(result).toBeInstanceOf(Present);
      expect(result).not.toBe(present);
      expect(result.value()).toBe(mapped);
    });

    it('must leave the original Present unchanged', () => {
      const present = new Present(value);

      present.map(() => Symbol('mapped'));

      expect(present.value()).toBe(value);
    });
  });

  describe('match', () => {
    it('must call onPresent with the value and return its result directly', () => {
      const matched = Symbol('matched');
      const onPresent = vi.fn(() => matched);
      const onAbsent = vi.fn();

      const result = new Present(value).match({ onPresent, onAbsent });

      expect(onPresent).toHaveBeenCalledOnce();
      expect(onPresent).toHaveBeenCalledWith(value);
      expect(onAbsent).not.toHaveBeenCalled();
      expect(result).toBe(matched);
    });

    it('must call onPresent when matched through the wider Option contract', () => {
      const matched = Symbol('matched');
      const option = new Present(value);
      const onPresent = vi.fn(() => matched);
      const onAbsent = vi.fn(() => Symbol('unexpected'));

      const outcome = option.match({ onPresent, onAbsent });

      expect(onPresent).toHaveBeenCalledWith(value);
      expect(onAbsent).not.toHaveBeenCalled();
      expect(outcome).toBe(matched);
    });
  });

  describe('orElse', () => {
    it('must return itself unchanged', () => {
      const present = new Present(value);

      expect(present.orElse(vi.fn())).toBe(present);
    });

    it('must not call a fallback passed through the wider Option contract', () => {
      const present = new Present(value);
      const option = present;
      const fallback = vi.fn(() => new Present(Symbol('fallback')));

      const outcome = option.orElse(fallback);

      expect(fallback).not.toHaveBeenCalled();
      expect(outcome).toBe(present);
    });
  });

  describe('orFail', () => {
    it('must return a new Success holding the value', () => {
      const result = new Present(value).orFail(Symbol('error'));

      expect(result).toBeInstanceOf(Success);
      expect(result.value()).toBe(value);
    });

    it('must return a Success when converted through the wider Option contract', () => {
      const option = new Present(value);

      const result = option.orFail(Symbol('error'));

      expect(Equatable.equals(result, new Success(value))).toBe(true);
    });
  });

  describe('[Equatable.symbol]', () => {
    it('must make Present Equatable', () => {
      expect(Equatable.is(new Present(value))).toBe(true);
    });

    it('must return true for a Present holding the same value', () => {
      expect(Equatable.equals(new Present(value), new Present(value))).toBe(
        true
      );
    });

    it('must return false for a Present holding a different value', () => {
      expect(
        Equatable.equals<unknown>(
          new Present(value),
          new Present(Symbol('other'))
        )
      ).toBe(false);
    });

    it('must return false for an Absent', () => {
      expect(new Present(value)[Equatable.symbol](new Absent())).toBe(false);
    });

    it('must return false for anything that is not a Present', () => {
      expect(new Present(value)[Equatable.symbol](value)).toBe(false);
      expect(new Present(value)[Equatable.symbol](null)).toBe(false);
    });

    it('must compare plain objects by reference', () => {
      const object = {};

      expect(Equatable.equals(new Present(object), new Present(object))).toBe(
        true
      );
      expect(Equatable.equals(new Present({}), new Present({}))).toBe(false);
    });

    it('must delegate to the value when it is Equatable', () => {
      const equals = vi.fn(() => true);
      const other = Symbol('other');

      const outcome = Equatable.equals<unknown>(
        new Present({ [Equatable.symbol]: equals }),
        new Present(other)
      );

      expect(equals).toHaveBeenCalledOnce();
      expect(equals).toHaveBeenCalledWith(other);
      expect(outcome).toBe(true);
    });

    it('must compare nested Options by value', () => {
      expect(
        Equatable.equals(
          new Present(new Present(1)),
          new Present(new Present(1))
        )
      ).toBe(true);
      expect(
        Equatable.equals(
          new Present(new Present(1)),
          new Present(new Present(2))
        )
      ).toBe(false);
      expect(
        Equatable.equals(new Present(new Absent()), new Present(new Absent()))
      ).toBe(true);
    });
  });
});
