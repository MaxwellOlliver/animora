import { Context, Effect, Layer } from 'effect';
import type { VideoQuality } from '@animora/contracts';
import { TranscodeError } from '../errors/transcode.error';

export interface TranscodeInput {
  rawObjectKey: string;
  videoId: string;
  qualities: readonly VideoQuality[];
}

export interface TranscodeOutput {
  masterPlaylistKey: string;
}

export class FfmpegService extends Context.Tag('FfmpegService')<
  FfmpegService,
  {
    transcode(
      input: TranscodeInput,
    ): Effect.Effect<TranscodeOutput, TranscodeError>;
  }
>() {}

export const FfmpegLive = Layer.succeed(FfmpegService, {
  transcode: (input) =>
    Effect.gen(function* () {
      yield* Effect.log(
        `Transcoding ${input.rawObjectKey} → ${input.qualities.join(', ')}`,
      );
      // TODO: real FFmpeg pipeline
      return {
        masterPlaylistKey: `hls/${input.videoId}/master.m3u8`,
      };
    }),
});
