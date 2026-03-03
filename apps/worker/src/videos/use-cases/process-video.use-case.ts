import { Effect } from 'effect';
import type { VideoQuality } from '@animora/contracts';
import {
  TranscodeService,
  collectOutputFiles,
  hlsContentType,
} from '../transcode.service';
import { S3Service } from '../../infra/s3/s3.service';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

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
    const s3Prefix = `hls/${input.videoId}`;

    yield* transcoder.transcode({
      inputPath: input.inputPath,
      outputDir: input.outputDir,
      qualities: input.qualities,
    });

    const files = yield* collectOutputFiles(input.outputDir);
    yield* Effect.log(`Uploading ${files.length} files to S3`);

    yield* Effect.forEach(
      files,
      (file) =>
        s3.putObject(
          `${s3Prefix}/${file}`,
          createReadStream(join(input.outputDir, file)),
          hlsContentType(file),
        ),
      { concurrency: 5 },
    );

    return { masterPlaylistKey: `${s3Prefix}/master.m3u8` };
  });
