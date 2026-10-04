import { describe, expect, it, vi } from 'vitest';

import { type Either } from './Either.js';
import { Left } from './Left.js';
import { Right } from './Right.js';

describe('Left', () => {
  const value = Symbol('value');

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
