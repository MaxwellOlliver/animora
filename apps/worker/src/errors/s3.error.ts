import { Data } from 'effect';

export class S3Error extends Data.TaggedError('S3Error')<{
  cause: unknown;
}> {}
