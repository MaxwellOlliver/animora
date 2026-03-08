import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { VideoQuality } from '@animora/contracts';
import { Effect, Schedule } from 'effect';

import { S3Service } from '../../infra/s3/s3.service';
import {
  collectOutputFiles,
  hlsContentType,
  TranscodeService,
} from '../transcode.service';

export interface ProcessVideoInput {
  videoId: string;
  inputPath: string;
  outputDir: string;
  qualities: readonly VideoQuality[];
}

export const processVideo = (input: ProcessVideoInput) =>
  Effect.gen(function* () {
    const transcoder = yield* TranscodeService;
    const s3 = yield* S3Service;
    const s3Prefix = `p/hls/${input.videoId}`;

    yield* transcoder.transcode({
      inputPath: input.inputPath,
      outputDir: input.outputDir,
      qualities: input.qualities,
    });

    const files = yield* collectOutputFiles(input.outputDir);
    yield* Effect.log(`Uploading ${files.length} files to S3`);

    const retryPolicy = Schedule.intersect(
      Schedule.recurs(3),
      Schedule.exponential('1 second'),
    );

    yield* Effect.forEach(
      files,
      (file) =>
        Effect.gen(function* () {
          const filePath = join(input.outputDir, file);
          const { size } = yield* Effect.promise(() => stat(filePath));
          yield* s3.putObject(
            `${s3Prefix}/${file}`,
            createReadStream(filePath),
            hlsContentType(file),
            size,
          );
        }).pipe(Effect.retry(retryPolicy)),
      { concurrency: 10 },
    );

    return { masterPlaylistKey: `${s3Prefix}/master.m3u8` };
  });
