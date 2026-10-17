import { Absent } from './Absent.js';
import { Present } from './Present.js';

export type Option<V> = Present<V> | Absent;

export namespace Option {
  export type Value<O> = O extends Present<infer V> ? V : never;

  export const from = <V>(value: V | null | undefined): Option<V> =>
    value === null || value === undefined ? new Absent() : new Present(value);

  export function all<const O extends readonly Option<unknown>[]>(
    options: O
  ): Option<{ -readonly [K in keyof O]: Value<O[K]> }>;

  export function all(options: readonly Option<unknown>[]): Option<unknown[]> {
    return options.every(option => option.present())
      ? new Present(options.map(option => option.value()))
      : new Absent();
  }
}
