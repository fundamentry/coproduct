import { type Result } from './Result.js';

export class Success<out V> {
  readonly #value: V;

  constructor(value: V) {
    this.#value = value;
  }

  ok(): this is Success<V> {
    return true;
  }

  value(): V {
    return this.#value;
  }

  flatMap<T, E>(project: (value: V) => Result<T, E>): Result<T, E> {
    return project(this.#value);
  }

  map<T>(project: (value: V) => T): Success<T> {
    return new Success(project(this.#value));
  }

  orElse(_: (error: never) => void): this {
    return this;
  }
}
