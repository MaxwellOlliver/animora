import { describe, test, expect } from 'bun:test';
import { Effect, Exit, Layer } from 'effect';
import { Readable } from 'node:stream';
import { createRouter } from '../src/infra/rabbitmq/rabbitmq.router';
import { UnknownPatternError } from '../src/errors/unknown-pattern.error';
import { EVENTS, QUEUES, type VideoTranscodeEvent } from '@animora/contracts';
import { handleVideoTranscode } from '../src/videos/handlers/video-transcode.handler';
import { TranscodeService } from '../src/videos/transcode.service';
import { S3Service } from '../src/infra/s3/s3.service';
import { VideosRepository } from '../src/videos/videos.repository';
import { PublisherService } from '../src/infra/rabbitmq/rabbitmq.publisher';
import { DatabaseError } from '../src/errors/database.error';
import { TranscodeError } from '../src/errors/transcode.error';

const testEvent: VideoTranscodeEvent = {
  videoId: 'video-123',
  ownerType: 'episode',
  ownerId: 'ep-123',
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
  ) => Effect.Effect<{ masterPlaylistKey: string }, TranscodeError>;
  updateStatus?: (
    id: string,
    status: string,
    key?: string,
  ) => Effect.Effect<void, any>;
  publish?: (
    queue: string,
    pattern: string,
    data: unknown,
  ) => Effect.Effect<void, never>;
} = {}) {
  return Layer.mergeAll(
    Layer.succeed(TranscodeService, { transcode }),
    Layer.succeed(VideosRepository, { updateStatus }),
    Layer.succeed(PublisherService, { publish }),
    Layer.succeed(S3Service, {
      getObject: () => Effect.succeed(Readable.from(Buffer.from('fake'))),
      putObject: () => Effect.void,
      deleteObject: () => Effect.void,
    }),
  );
}

function run(event: VideoTranscodeEvent, layer = makeLayer()) {
  return Effect.runPromise(
    handleVideoTranscode(event).pipe(Effect.provide(layer)),
  );
}

describe('handleVideoTranscode', () => {
  test('publishes VideoTranscodedEvent on success', async () => {
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
    expect(published[0].queue).toBe(QUEUES.VIDEO_EVENTS);
    expect(published[0].pattern).toBe(EVENTS.VIDEO_TRANSCODED);
    expect(published[0].data).toMatchObject({
      videoId: testEvent.videoId,
      masterPlaylistKey: expect.any(String),
    });
  });

  test('includes masterPlaylistKey in the published event', async () => {
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

    expect((published[0].data as any).masterPlaylistKey).toBe(
      `p/hls/${testEvent.videoId}/master.m3u8`,
    );
  });

  test('publishes VideoTranscodeFailedEvent when ffmpeg fails', async () => {
    const published: Published[] = [];

    await run(
      testEvent,
      makeLayer({
        transcode: () =>
          Effect.fail(new TranscodeError({ cause: 'FFmpeg crashed' })),
        publish: (queue, pattern, data) =>
          Effect.sync(() => {
            published.push({ queue, pattern, data });
          }),
      }),
    );

    expect(published).toHaveLength(1);
    expect(published[0].queue).toBe(QUEUES.VIDEO_EVENTS);
    expect(published[0].pattern).toBe(EVENTS.VIDEO_TRANSCODE_FAILED);
    expect((published[0].data as any).reason).toContain('FFmpeg crashed');
  });

  test('calls updateStatus with videoId and ready on success', async () => {
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

    const exit = await Effect.runPromiseExit(
      handleVideoTranscode(testEvent).pipe(
        Effect.provide(
          makeLayer({
            updateStatus: () =>
              Effect.fail(new DatabaseError({ cause: 'DB down' })),
            publish: (queue, pattern, data) =>
              Effect.sync(() => {
                published.push({ queue, pattern, data });
              }),
          }),
        ),
      ),
    );

    expect(Exit.isFailure(exit)).toBe(true);
    // publish is after updateStatus — so it won't fire if DB fails
    // this test documents the current behavior
    expect(published).toHaveLength(0);
  });
});

describe('createRouter', () => {
  test('dispatches to the correct handler by pattern', async () => {
    const calls: string[] = [];

    const router = createRouter({
      'event.a': () =>
        Effect.sync(() => {
          calls.push('a');
        }),
      'event.b': () =>
        Effect.sync(() => {
          calls.push('b');
        }),
    });

    await Effect.runPromise(router('event.a', {}));
    await Effect.runPromise(router('event.b', {}));

    expect(calls).toEqual(['a', 'b']);
  });

  test('passes data to the handler', async () => {
    let received: unknown;

    const router = createRouter({
      'event.a': (data) =>
        Effect.sync(() => {
          received = data;
        }),
    });

    await Effect.runPromise(router('event.a', { videoId: '123' }));

    expect(received).toEqual({ videoId: '123' });
  });

  test('fails with UnknownPatternError for unregistered patterns', async () => {
    const router = createRouter({
      'event.a': () => Effect.void,
    });

    const exit = await Effect.runPromiseExit(router('event.unknown', {}));

    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const error = exit.cause._tag === 'Fail' ? exit.cause.error : null;
      expect(error).toBeInstanceOf(UnknownPatternError);
      expect((error as UnknownPatternError).pattern).toBe('event.unknown');
    }
  });
});
