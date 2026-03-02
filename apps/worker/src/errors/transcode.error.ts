import { Data } from 'effect';

export class TranscodeError extends Data.TaggedError('TranscodeError')<{
  cause: unknown;
}> {}
