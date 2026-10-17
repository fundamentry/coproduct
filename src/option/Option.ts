import { Absent } from './Absent.js';
import { Present } from './Present.js';

export type Option<V> = Present<V> | Absent;

export namespace Option {
  export const from = <V>(value: V | null | undefined): Option<V> =>
    value === null || value === undefined ? new Absent() : new Present(value);
}
