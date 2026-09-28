import { describe, expect, it, vi } from 'vitest';

import { type Either } from './Either.js';
import { Left } from './Left.js';
import { Right } from './Right.js';

describe('Right', () => {
  const value = Symbol('value');

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
