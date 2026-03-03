import { Context, Effect, Layer } from 'effect';
import { TranscodeError } from '../../errors/transcode.error';
import { spawn } from 'node:child_process';

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
          const child = spawn('ffmpeg', args, {
            stdio: ['ignore', 'ignore', 'pipe'],
          });

          child.stderr.on('data', () => {});

          child.on('error', (err) => reject(err));
          child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exited with code ${code}`));
          });
        }),
      catch: (cause) => new TranscodeError({ cause }),
    }),
});
