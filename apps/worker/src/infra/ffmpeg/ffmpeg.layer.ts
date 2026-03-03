import { Context, Effect, Layer } from 'effect';
import { TranscodeError } from '../../errors/transcode.error';
import { execFile } from 'node:child_process';

export class FfmpegService extends Context.Tag('FfmpegService')<
  FfmpegService,
  {
    run(args: string[]): Effect.Effect<void, TranscodeError>;
  }
>() {}

export const FfmpegLive = Layer.succeed(FfmpegService, {
  run: (args) =>
    Effect.tryPromise({
      try: () =>
        new Promise<void>((resolve, reject) => {
          execFile('ffmpeg', args, { timeout: 600_000 }, (error) => {
            if (error) reject(error as Error);
            else resolve();
          });
        }),
      catch: (cause) => new TranscodeError({ cause }),
    }),
});
