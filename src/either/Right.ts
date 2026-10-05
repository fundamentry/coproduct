import { Equatable, type Stringable } from '@fundamentry/trait';

// fallow-ignore-next-line circular-dependency -- used at call time only
import { Left } from './Left.js';

export class Right<out R> implements Equatable, Stringable {
  readonly #value: R;

  constructor(value: R) {
    this.#value = value;
  }

  [Equatable.symbol](other: unknown): boolean {
    return (
      other instanceof Right &&
      Equatable.equals<unknown>(this.#value, other.#value)
    );
  }

  [Symbol.toPrimitive](): string {
    return String(this.#value);
  }

  isLeft(): this is Left<never> {
    return false;
  }

  isRight(): this is Right<R> {
    return true;
  }

  right(): R {
    return this.#value;
  }

  mapLeft(_: (value: never) => void): this {
    return this;
  }

  mapRight<T>(project: (value: R) => T): Right<T> {
    return new Right(project(this.#value));
  }

  match<T>({
    onRight,
  }: {
    onLeft: (value: never) => void;
    onRight: (value: R) => T;
  }): T {
    return onRight(this.#value);
  }

  merge(): R {
    return this.#value;
  }

  swap(): Left<R> {
    return new Left(this.#value);
  }
}
