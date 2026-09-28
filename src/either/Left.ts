// fallow-ignore-next-line circular-dependency -- used at call time only
import { Right } from './Right.js';

export class Left<out L> {
  readonly #value: L;

  constructor(value: L) {
    this.#value = value;
  }

  isLeft(): this is Left<L> {
    return true;
  }

  isRight(): this is Right<never> {
    return false;
  }

  left(): L {
    return this.#value;
  }

  mapLeft<T>(project: (value: L) => T): Left<T> {
    return new Left(project(this.#value));
  }

  mapRight(_: (value: never) => void): this {
    return this;
  }

  swap(): Right<L> {
    return new Right(this.#value);
  }
}
