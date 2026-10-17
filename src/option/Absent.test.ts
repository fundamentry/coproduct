import { describe, expect, it, vi } from 'vitest';

import { Equatable } from '@fundamentry/trait';

import { Failure } from '#project/result';

import { Absent } from './Absent.js';
import { Present } from './Present.js';

describe('Absent', () => {
  describe('present', () => {
    it('must return false', () => {
      expect(new Absent().present()).toBe(false);
    });
  });

  describe('filter', () => {
    it('must return itself unchanged', () => {
      const absent = new Absent();

      expect(absent.filter(vi.fn())).toBe(absent);
    });

    it('must not call a predicate passed through the wider Option contract', () => {
      const absent = new Absent();
      const option = absent;
      const predicate = vi.fn(() => true);

      const outcome = option.filter(predicate);

      expect(predicate).not.toHaveBeenCalled();
      expect(outcome).toBe(absent);
    });
  });

  describe('flatMap', () => {
    it('must return itself unchanged', () => {
      const absent = new Absent();

      expect(absent.flatMap(vi.fn())).toBe(absent);
    });

    it('must not call a project passed through the wider Option contract', () => {
      const absent = new Absent();
      const option = absent;
      const project = vi.fn(() => new Present(Symbol('projected')));

      const outcome = option.flatMap(project);

      expect(project).not.toHaveBeenCalled();
      expect(outcome).toBe(absent);
    });
  });

  describe('getOr', () => {
    it('must return the fallback', () => {
      const fallback = Symbol('fallback');

      expect(new Absent().getOr(fallback)).toBe(fallback);
    });

    it('must return the fallback when called through the wider Option contract', () => {
      const option = new Absent();

      const outcome = option.getOr(undefined);

      expect(outcome).toBeUndefined();
    });
  });

  describe('getOrThrow', () => {
    it('must call the exception and throw its result', () => {
      const thrown = new RangeError('expected');
      const exception = vi.fn(() => thrown);

      expect(() => new Absent().getOrThrow(exception)).toThrow(thrown);
      expect(exception).toHaveBeenCalledOnce();
      expect(exception).toHaveBeenCalledWith();
    });

    it('must throw when called through the wider Option contract', () => {
      const option = new Absent();
      const thrown = new RangeError('expected');

      expect(() => option.getOrThrow(() => thrown)).toThrow(thrown);
    });
  });

  describe('map', () => {
    it('must return itself unchanged', () => {
      const absent = new Absent();

      expect(absent.map(vi.fn())).toBe(absent);
    });

    it('must not call a project passed through the wider Option contract', () => {
      const absent = new Absent();
      const option = absent;
      const project = vi.fn();

      const outcome = option.map(project);

      expect(project).not.toHaveBeenCalled();
      expect(outcome).toBe(absent);
    });
  });

  describe('match', () => {
    it('must call onAbsent and return its result directly', () => {
      const matched = Symbol('matched');
      const onPresent = vi.fn();
      const onAbsent = vi.fn(() => matched);

      const result = new Absent().match({ onPresent, onAbsent });

      expect(onAbsent).toHaveBeenCalledOnce();
      expect(onAbsent).toHaveBeenCalledWith();
      expect(onPresent).not.toHaveBeenCalled();
      expect(result).toBe(matched);
    });

    it('must call onAbsent when matched through the wider Option contract', () => {
      const matched = Symbol('matched');
      const option = new Absent();
      const onPresent = vi.fn(() => Symbol('unexpected'));
      const onAbsent = vi.fn(() => matched);

      const outcome = option.match({ onPresent, onAbsent });

      expect(onAbsent).toHaveBeenCalledOnce();
      expect(onPresent).not.toHaveBeenCalled();
      expect(outcome).toBe(matched);
    });
  });

  describe('orElse', () => {
    it('must call the fallback and return its result directly', () => {
      const returned = new Present(Symbol('value'));
      const fallback = vi.fn(() => returned);

      const result = new Absent().orElse(fallback);

      expect(fallback).toHaveBeenCalledOnce();
      expect(fallback).toHaveBeenCalledWith();
      expect(result).toBe(returned);
    });
  });

  describe('orFail', () => {
    it('must return a new Failure holding the error', () => {
      const error = Symbol('error');

      const result = new Absent().orFail(error);

      expect(result).toBeInstanceOf(Failure);
      expect(result.error()).toBe(error);
    });

    it('must return a Failure when converted through the wider Option contract', () => {
      const error = Symbol('error');
      const option = new Absent();

      const result = option.orFail(error);

      expect(Equatable.equals(result, new Failure(error))).toBe(true);
    });
  });

  describe('[Equatable.symbol]', () => {
    it('must make Absent Equatable', () => {
      expect(Equatable.is(new Absent())).toBe(true);
    });

    it('must return true for another Absent', () => {
      expect(Equatable.equals(new Absent(), new Absent())).toBe(true);
    });

    it('must return false for a Present', () => {
      expect(new Absent()[Equatable.symbol](new Present(undefined))).toBe(
        false
      );
    });

    it('must return false for anything that is not an Absent', () => {
      expect(new Absent()[Equatable.symbol](undefined)).toBe(false);
      expect(new Absent()[Equatable.symbol](null)).toBe(false);
    });
  });
});
