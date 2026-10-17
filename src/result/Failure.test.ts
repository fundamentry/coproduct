import { describe, expect, it, vi } from 'vitest';

import { Equatable } from '@fundamentry/trait';

import { Failure } from './Failure.js';
import { type Result } from './Result.js';
import { Success } from './Success.js';

describe('Failure', () => {
  const error = Symbol('error');

  describe('ok', () => {
    it('must return false', () => {
      expect(new Failure(error).ok()).toBe(false);
    });
  });

  describe('error', () => {
    it('must return the error passed to the constructor', () => {
      expect(new Failure(error).error()).toBe(error);
    });
  });

  describe('flatMap', () => {
    it('must return itself unchanged', () => {
      const failure = new Failure(error);

      expect(failure.flatMap(vi.fn())).toBe(failure);
    });

    it('must not call a project passed through the wider Result contract', () => {
      const failure = new Failure(error);
      const result: Result<symbol, symbol> = failure;
      const project = vi.fn();

      const outcome = result.flatMap(project);

      expect(project).not.toHaveBeenCalled();
      expect(outcome).toBe(failure);
    });
  });

  describe('getOrThrow', () => {
    it('must call the exception with the error and throw its result', () => {
      const thrown = new RangeError('expected');
      const exception = vi.fn(() => thrown);

      expect(() => new Failure(error).getOrThrow(exception)).toThrow(thrown);
      expect(exception).toHaveBeenCalledOnce();
      expect(exception).toHaveBeenCalledWith(error);
    });

    it('must throw when called through the wider Result contract', () => {
      const result: Result<symbol, symbol> = new Failure(error);

      expect(() =>
        result.getOrThrow(cause => new RangeError('expected', { cause }))
      ).toThrow(expect.objectContaining({ cause: error }));
    });
  });

  describe('map', () => {
    it('must return itself unchanged', () => {
      const failure = new Failure(error);

      expect(failure.map(vi.fn())).toBe(failure);
    });

    it('must not call a project passed through the wider Result contract', () => {
      const failure = new Failure(error);
      const result: Result<symbol, symbol> = failure;
      const project = vi.fn();

      const outcome = result.map(project);

      expect(project).not.toHaveBeenCalled();
      expect(outcome).toBe(failure);
    });
  });

  describe('mapError', () => {
    it('must call the project with the error and wrap the result in a new Failure', () => {
      const mapped = Symbol('mapped');
      const project = vi.fn(() => mapped);
      const failure = new Failure(error);

      const result = failure.mapError(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Failure);
      expect(result).not.toBe(failure);
      expect(result.error()).toBe(mapped);
    });

    it('must leave the original Failure unchanged', () => {
      const failure = new Failure(error);

      failure.mapError(() => Symbol('mapped'));

      expect(failure.error()).toBe(error);
    });
  });

  describe('match', () => {
    it('must call onFailure with the error and return its result directly', () => {
      const matched = Symbol('matched');
      const onSuccess = vi.fn();
      const onFailure = vi.fn(() => matched);

      const result = new Failure(error).match({ onSuccess, onFailure });

      expect(onFailure).toHaveBeenCalledOnce();
      expect(onFailure).toHaveBeenCalledWith(error);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(result).toBe(matched);
    });

    it('must call onFailure when matched through the wider Result contract', () => {
      const matched = Symbol('matched');
      const result: Result<symbol, symbol> = new Failure(error);
      const onSuccess = vi.fn(() => Symbol('unexpected'));
      const onFailure = vi.fn(() => matched);

      const outcome = result.match({ onSuccess, onFailure });

      expect(onFailure).toHaveBeenCalledWith(error);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(outcome).toBe(matched);
    });
  });

  describe('orElse', () => {
    it('must call the fallback with the error and return its result directly', () => {
      const returned = new Success(Symbol('value'));
      const fallback = vi.fn(() => returned);
      const failure = new Failure(error);

      const result = failure.orElse(fallback);

      expect(fallback).toHaveBeenCalledOnce();
      expect(fallback).toHaveBeenCalledWith(error);
      expect(result).toBe(returned);
    });
  });

  describe('[Equatable.symbol]', () => {
    it('must make Failure Equatable', () => {
      expect(Equatable.is(new Failure(error))).toBe(true);
    });

    it('must return true for a Failure holding the same error', () => {
      expect(Equatable.equals(new Failure(error), new Failure(error))).toBe(
        true
      );
    });

    it('must return false for a Failure holding a different error', () => {
      expect(
        Equatable.equals<unknown>(
          new Failure(error),
          new Failure(Symbol('other'))
        )
      ).toBe(false);
    });

    it('must return false for a Success holding the same value', () => {
      expect(new Failure(error)[Equatable.symbol](new Success(error))).toBe(
        false
      );
    });

    it('must return false for anything that is not a Failure', () => {
      expect(new Failure(error)[Equatable.symbol](error)).toBe(false);
      expect(new Failure(error)[Equatable.symbol](null)).toBe(false);
    });

    it('must compare plain objects by reference', () => {
      const object = {};

      expect(Equatable.equals(new Failure(object), new Failure(object))).toBe(
        true
      );
      expect(Equatable.equals(new Failure({}), new Failure({}))).toBe(false);
    });

    it('must delegate to the error when it is Equatable', () => {
      const equals = vi.fn(() => true);
      const other = Symbol('other');

      const outcome = Equatable.equals<unknown>(
        new Failure({ [Equatable.symbol]: equals }),
        new Failure(other)
      );

      expect(equals).toHaveBeenCalledOnce();
      expect(equals).toHaveBeenCalledWith(other);
      expect(outcome).toBe(true);
    });

    it('must compare nested Results by value', () => {
      expect(
        Equatable.equals(
          new Failure(new Failure(1)),
          new Failure(new Failure(1))
        )
      ).toBe(true);
      expect(
        Equatable.equals(
          new Failure(new Failure(1)),
          new Failure(new Failure(2))
        )
      ).toBe(false);
    });
  });
});
