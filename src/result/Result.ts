import { type Failure } from './Failure.js';
import { type Success } from './Success.js';

export type Result<V, E> = Success<V> | Failure<E>;
