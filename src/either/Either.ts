import { type Left } from './Left.js';
import { type Right } from './Right.js';

export type Either<L, R> = Left<L> | Right<R>;
