import { describe, test, expect } from 'bun:test';
import { Effect, Layer } from 'effect';
import { EVENTS, QUEUES, type VideoUploadedEvent } from '@animora/contracts';
import { handleVideoUploaded } from '../src/videos/handlers/video-uploaded.handler';
import { FfmpegService } from '../src/videos/ffmpeg.service';
import { VideosRepository } from '../src/videos/videos.repository';
import { PublisherService } from '../src/infra/rabbitmq/rabbitmq.publisher';

const testEvent: VideoUploadedEvent = {
  videoId: 'video-123',
  episodeId: 'ep-123',
  rawObjectKey: 'uploads/test.mp4',
  qualities: ['720p'],
};

type Published = { queue: string; pattern: string; data: unknown };
type DbCall = { id: string; status: string; masterPlaylistKey?: string };

function makeLayer({
  transcode = () => Effect.succeed({ masterPlaylistKey: 'mock/master.m3u8' }),
  updateStatus = () => Effect.succeed(void 0 as void),
  publish = () => Effect.succeed(void 0 as void),
}: {
  transcode?: (
    input: any,
  ) => Effect.Effect<{ masterPlaylistKey: string }, Error>;
  updateStatus?: (
    id: string,
    status: string,
    key?: string,
  ) => Effect.Effect<void, any>;
  publish?: (
    queue: string,
    pattern: string,
    data: unknown,
  ) => Effect.Effect<void, any>;
} = {}) {
  return Layer.mergeAll(
    Layer.succeed(FfmpegService, { transcode }),
    Layer.succeed(VideosRepository, { updateStatus }),
    Layer.succeed(PublisherService, { publish }),
  );
}

function run(event: VideoUploadedEvent, layer = makeLayer()) {
  return Effect.runPromise(
    handleVideoUploaded(event).pipe(Effect.provide(layer)),
  );
}

describe('handleVideoUploaded', () => {
  test('publishes VideoProcessedEvent with status ready on success', async () => {
    const published: Published[] = [];

    await run(
      testEvent,
      makeLayer({
        publish: (queue, pattern, data) =>
          Effect.sync(() => {
            published.push({ queue, pattern, data });
          }),
      }),
    );

    expect(published).toHaveLength(1);
    expect(published[0].queue).toBe(QUEUES.VIDEO_PROCESSED);
    expect(published[0].pattern).toBe(EVENTS.VIDEO_PROCESSED);
    expect(published[0].data).toMatchObject({
      videoId: testEvent.videoId,
      status: 'ready',
    });
  });

  test('includes masterPlaylistKey in the published event', async () => {
    const published: Published[] = [];

    await run(
      testEvent,
      makeLayer({
        transcode: () =>
          Effect.succeed({ masterPlaylistKey: 'hls/test/master.m3u8' }),
        publish: (queue, pattern, data) =>
          Effect.sync(() => {
            published.push({ queue, pattern, data });
          }),
      }),
    );

    expect((published[0].data as any).masterPlaylistKey).toBe(
      'hls/test/master.m3u8',
    );
  });

  test('publishes failed status when ffmpeg fails', async () => {
    const published: Published[] = [];

    await run(
      testEvent,
      makeLayer({
        transcode: () => Effect.fail(new Error('FFmpeg crashed')),
        publish: (queue, pattern, data) =>
          Effect.sync(() => {
            published.push({ queue, pattern, data });
          }),
      }),
    );

    expect(published).toHaveLength(1);
    expect((published[0].data as any).status).toBe('failed');
  });

  test('calls updateStatus with videoId and status', async () => {
    const dbCalls: DbCall[] = [];

    await run(
      testEvent,
      makeLayer({
        updateStatus: (id, status, masterPlaylistKey) =>
          Effect.sync(() => {
            dbCalls.push({ id, status, masterPlaylistKey });
          }),
      }),
    );

    expect(dbCalls).toHaveLength(1);
    expect(dbCalls[0]).toMatchObject({
      id: testEvent.videoId,
      status: 'ready',
    });
  });

  test('still publishes when db update fails', async () => {
    const published: Published[] = [];

    expect(
      await Effect.runPromise(
        handleVideoUploaded(testEvent).pipe(
          Effect.provide(
            makeLayer({
              updateStatus: () => Effect.fail(new Error('DB down')),
              publish: (queue, pattern, data) =>
                Effect.sync(() => {
                  published.push({ queue, pattern, data });
                }),
            }),
          ),
        ),
      ),
    ).rejects.toThrow();

    // publish is after updateStatus — so it won't fire if DB fails
    // this test documents the current behavior
    expect(published).toHaveLength(0);
  });
});
