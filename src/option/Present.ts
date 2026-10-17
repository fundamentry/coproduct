import { Equatable } from '@fundamentry/trait';

import { Success } from '#project/result';

import { Absent } from './Absent.js';
import { type Option } from './Option.js';

export class Present<out V> implements Equatable {
  readonly #value: V;

  constructor(value: V) {
    this.#value = value;
  }

  present(): this is Present<V> {
    return true;
  }

  value(): V {
    return this.#value;
  }

  filter<T extends V>(predicate: (value: V) => value is T): Option<T>;

  filter(predicate: (value: V) => boolean): Option<V>;

  filter(predicate: (value: V) => boolean): Option<V> {
    return predicate(this.#value) ? this : new Absent();
  }

  flatMap<T>(project: (value: V) => Option<T>): Option<T> {
    return project(this.#value);
  }

  getOr(_: unknown): V {
    return this.#value;
  }

  getOrThrow(_: () => Error): V {
    return this.#value;
  }

  map<T>(project: (value: V) => T): Present<T> {
    return new Present(project(this.#value));
  }

  match<T>({
    onPresent,
  }: {
    onPresent: (value: V) => T;
    onAbsent: () => void;
  }): T {
    return onPresent(this.#value);
  }

  orElse(_: () => void): this {
    return this;
  }

  orFail(_: unknown): Success<V> {
    return new Success(this.#value);
  }

  [Equatable.symbol](other: unknown): boolean {
    return (
      other instanceof Present &&
      Equatable.equals<unknown>(this.#value, other.#value)
    );
  }
}
