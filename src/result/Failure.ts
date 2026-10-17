import { Equatable } from '@fundamentry/trait';

import { type Result } from './Result.js';
import { type Success } from './Success.js';

export class Failure<out E> implements Equatable {
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

  getOrThrow(exception: (error: E) => Error): never {
    throw exception(this.#error);
  }

  map(_: (value: never) => void): this {
    return this;
  }

  mapError<F>(project: (error: E) => F): Failure<F> {
    return new Failure(project(this.#error));
  }

  match<T>({
    onFailure,
  }: {
    onSuccess: (value: never) => void;
    onFailure: (error: E) => T;
  }): T {
    return onFailure(this.#error);
  }

  orElse<T, F>(fallback: (error: E) => Result<T, F>): Result<T, F> {
    return fallback(this.#error);
  }

  [Equatable.symbol](other: unknown): boolean {
    return (
      other instanceof Failure &&
      Equatable.equals<unknown>(this.#error, other.#error)
    );
  }
}
