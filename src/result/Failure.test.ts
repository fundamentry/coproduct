import { describe, expect, it, vi } from 'vitest';

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
});
