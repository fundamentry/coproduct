import { type Result } from './Result.js';
import { type Success } from './Success.js';

export class Failure<out E> {
  readonly #error: E;

  constructor(error: E) {
    this.#error = error;
  }

  ok(): this is Success<never> {
    return false;
  }

  error(): E {
    return this.#error;
  }

  flatMap(_: (value: never) => void): this {
    return this;
  }

  map(_: (value: never) => void): this {
    return this;
  }

  orElse<T, F>(fallback: (error: E) => Result<T, F>): Result<T, F> {
    return fallback(this.#error);
  }
}
