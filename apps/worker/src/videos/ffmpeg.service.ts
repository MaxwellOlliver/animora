import { Context, Effect, Layer } from 'effect';
import type { VideoQuality } from '@animora/contracts';

export interface TranscodeInput {
  rawObjectKey: string;
  qualities: VideoQuality[];
}

export interface TranscodeOutput {
  masterPlaylistKey: string;
}

export class FfmpegService extends Context.Tag('FfmpegService')<
  FfmpegService,
  { transcode(input: TranscodeInput): Effect.Effect<TranscodeOutput, Error> }
>() {}

export const FfmpegLive = Layer.succeed(FfmpegService, {
  transcode: (input) =>
    Effect.gen(function* () {
      yield* Effect.log(
        `Transcoding ${input.rawObjectKey} → ${input.qualities.join(', ')}`,
      );
      // TODO: real FFmpeg pipeline
      return {
        masterPlaylistKey: `hls/${input.rawObjectKey.replace('uploads/', '')}/master.m3u8`,
      };
    }),
});
