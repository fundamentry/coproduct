import { describe, expect, it, vi } from 'vitest';

import { Failure } from './Failure.js';
import { type Result } from './Result.js';
import { Success } from './Success.js';

describe('Success', () => {
  const value = Symbol('value');

  describe('ok', () => {
    it('must return true', () => {
      expect(new Success(value).ok()).toBe(true);
    });
  });

  describe('value', () => {
    it('must return the value passed to the constructor', () => {
      expect(new Success(value).value()).toBe(value);
    });
  });

  describe('flatMap', () => {
    it('must call the project with the value and return its result directly', () => {
      const returned = new Failure(Symbol('error'));
      const project = vi.fn(() => returned);
      const success = new Success(value);

      const result = success.flatMap(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(value);
      expect(result).toBe(returned);
    });
  });

  describe('map', () => {
    it('must call the project with the value and wrap the result in a new Success', () => {
      const mapped = Symbol('mapped');
      const project = vi.fn(() => mapped);
      const success = new Success(value);

      const result = success.map(project);

      expect(project).toHaveBeenCalledOnce();
      expect(project).toHaveBeenCalledWith(value);
      expect(result).toBeInstanceOf(Success);
      expect(result).not.toBe(success);
      expect(result.value()).toBe(mapped);
    });

    it('must leave the original Success unchanged', () => {
      const success = new Success(value);

      success.map(() => Symbol('mapped'));

      expect(success.value()).toBe(value);
    });
  });

  describe('orElse', () => {
    it('must return itself unchanged', () => {
      const success = new Success(value);

      expect(success.orElse(vi.fn())).toBe(success);
    });

    it('must not call a fallback passed through the wider Result contract', () => {
      const success = new Success(value);
      const result: Result<symbol, symbol> = success;
      const fallback = vi.fn();

      const outcome = result.orElse(fallback);

      expect(fallback).not.toHaveBeenCalled();
      expect(outcome).toBe(success);
    });
  });
});
