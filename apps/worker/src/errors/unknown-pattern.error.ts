import { Data } from 'effect';

export class UnknownPatternError extends Data.TaggedError(
  'UnknownPatternError',
)<{
  pattern: string;
}> {}
