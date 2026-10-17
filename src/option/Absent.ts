import { Equatable } from '@fundamentry/trait';

import { Failure } from '#project/result';

import { type Option } from './Option.js';
import { type Present } from './Present.js';

export class Absent implements Equatable {
  present(): this is Present<never> {
    return false;
  }

  filter(_: (value: never) => boolean): this {
    return this;
  }

  flatMap(_: (value: never) => void): this {
    return this;
  }

  getOr<T>(fallback: T): T {
    return fallback;
  }

  getOrThrow(exception: () => Error): never {
    throw exception();
  }

  map(_: (value: never) => void): this {
    return this;
  }

  match<T>({
    onAbsent,
  }: {
    onPresent: (value: never) => void;
    onAbsent: () => T;
  }): T {
    return onAbsent();
  }

  orElse<T>(fallback: () => Option<T>): Option<T> {
    return fallback();
  }

  orFail<E>(error: E): Failure<E> {
    return new Failure(error);
  }

  [Equatable.symbol](other: unknown): boolean {
    return other instanceof Absent;
  }
}
