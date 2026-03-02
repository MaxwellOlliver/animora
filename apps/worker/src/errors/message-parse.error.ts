import { Data } from 'effect';

export class MessageParseError extends Data.TaggedError('MessageParseError')<{
  cause: unknown;
}> {}
