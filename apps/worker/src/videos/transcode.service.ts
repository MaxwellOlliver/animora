import { Context, Effect, Layer } from 'effect';
import type { VideoQuality } from '@animora/contracts';
import { TranscodeError } from '../errors/transcode.error';
import { FfmpegService } from '../infra/ffmpeg/ffmpeg.layer';
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

export interface TranscodeInput {
  inputPath: string;
  outputDir: string;
  qualities: readonly VideoQuality[];
  concurrency?: number;
}

export class TranscodeService extends Context.Tag('TranscodeService')<
  TranscodeService,
  {
    transcode(input: TranscodeInput): Effect.Effect<void, TranscodeError>;
  }
>() {}

const HLS_SEGMENT_SECONDS = 6;
const GOP_SIZE = 144;

const QUALITY_PROFILES: Record<
  VideoQuality,
  {
    width: number;
    height: number;
    audioBitrate: string;
    videoBitrate: string;
    maxrate: string;
    bufsize: string;
    bandwidth: number;
  }
> = {
  '360p': {
    width: 640,
    height: 360,
    audioBitrate: '128k',
    videoBitrate: '800k',
    maxrate: '960k',
    bufsize: '1920k',
    bandwidth: 800_000,
  },
  '720p': {
    width: 1280,
    height: 720,
    audioBitrate: '128k',
    videoBitrate: '2800k',
    maxrate: '3200k',
    bufsize: '6400k',
    bandwidth: 2_800_000,
  },
  '1080p': {
    width: 1920,
    height: 1080,
    audioBitrate: '192k',
    videoBitrate: '5000k',
    maxrate: '5500k',
    bufsize: '11000k',
    bandwidth: 5_000_000,
  },
};

const transcodeQuality = (
  inputPath: string,
  outputDir: string,
  quality: VideoQuality,
): Effect.Effect<void, TranscodeError, FfmpegService> => {
  const profile = QUALITY_PROFILES[quality];
  const qualityDir = join(outputDir, quality);

  return Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(qualityDir, { recursive: true }));

    const ffmpeg = yield* FfmpegService;
    yield* ffmpeg.run([
      '-i',
      inputPath,
      '-vf',
      `scale=${profile.width}:${profile.height}`,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-pix_fmt',
      'yuv420p',
      '-g',
      `${GOP_SIZE}`,
      '-keyint_min',
      `${GOP_SIZE}`,
      '-sc_threshold',
      '0',
      '-force_key_frames',
      `expr:gte(t,n_forced*${HLS_SEGMENT_SECONDS})`,
      '-c:a',
      'aac',
      '-b:a',
      profile.audioBitrate,
      '-b:v',
      profile.videoBitrate,
      '-maxrate',
      profile.maxrate,
      '-bufsize',
      profile.bufsize,
      '-f',
      'hls',
      '-hls_time',
      `${HLS_SEGMENT_SECONDS}`,
      '-hls_playlist_type',
      'vod',
      '-hls_flags',
      'independent_segments',
      '-hls_segment_filename',
      join(qualityDir, 'segment_%03d.ts'),
      join(qualityDir, 'playlist.m3u8'),
    ]);

    yield* Effect.log(`Transcoded ${quality}`);
  });
};

const writeMasterPlaylist = (
  outputDir: string,
  qualities: readonly VideoQuality[],
) => {
  const lines = ['#EXTM3U'];
  for (const quality of qualities) {
    const p = QUALITY_PROFILES[quality];
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${p.bandwidth},RESOLUTION=${p.width}x${p.height}`,
    );
    lines.push(`${quality}/playlist.m3u8`);
  }

  return Effect.tryPromise({
    try: () =>
      writeFile(join(outputDir, 'master.m3u8'), lines.join('\n') + '\n'),
    catch: (cause) => new TranscodeError({ cause }),
  });
};

export const hlsContentType = (file: string) =>
  file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t';

export const collectOutputFiles = (outputDir: string) =>
  Effect.tryPromise({
    try: async () => {
      const entries = await readdir(outputDir, {
        recursive: true,
        withFileTypes: true,
      });
      return entries
        .filter((e) => e.isFile() && e.name !== 'original.mp4')
        .map((e) => relative(outputDir, join(e.parentPath ?? e.path, e.name)));
    },
    catch: (cause) => new TranscodeError({ cause }),
  });

export const TranscodeLive = Layer.effect(
  TranscodeService,
  Effect.gen(function* () {
    const ffmpeg = yield* FfmpegService;

    return {
      transcode: (input) =>
        Effect.gen(function* () {
          yield* Effect.forEach(
            input.qualities,
            (quality) =>
              transcodeQuality(input.inputPath, input.outputDir, quality),
            { concurrency: input.concurrency ?? 1 },
          );

          yield* writeMasterPlaylist(input.outputDir, input.qualities);
        }).pipe(Effect.provideService(FfmpegService, ffmpeg)),
    };
  }),
);
