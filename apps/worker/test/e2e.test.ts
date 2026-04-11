import 'dotenv/config';
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import * as amqplib from 'amqplib';
import {
  EVENTS,
  QUEUES,
  type VideoTranscodeEvent,
  type VideoTranscodedEvent,
  type VideoTranscodeFailedEvent,
} from '@animora/contracts';

const TIMEOUT_MS = 15_000;

let conn: amqplib.ChannelModel;
let ch: amqplib.Channel;

type WorkerResult =
  | { kind: 'transcoded'; data: VideoTranscodedEvent }
  | { kind: 'failed'; data: VideoTranscodeFailedEvent };

const pending = new Map<string, (result: WorkerResult) => void>();

beforeAll(async () => {
  conn = await amqplib.connect(process.env.RABBITMQ_URL!);
  ch = await conn.createChannel();
  await ch.assertQueue(QUEUES.VIDEO_TRANSCODE, { durable: true });
  await ch.assertQueue(QUEUES.VIDEO_EVENTS, { durable: true });
  await ch.purgeQueue(QUEUES.VIDEO_TRANSCODE);
  await ch.purgeQueue(QUEUES.VIDEO_EVENTS);

  await ch.consume(QUEUES.VIDEO_EVENTS, (msg) => {
    if (!msg) return;
    ch.ack(msg);

    const envelope = JSON.parse(msg.content.toString()) as {
      pattern: string;
      data: VideoTranscodedEvent | VideoTranscodeFailedEvent;
    };
    const resolve = pending.get(envelope.data.videoId);
    if (resolve) {
      pending.delete(envelope.data.videoId);
      const kind =
        envelope.pattern === EVENTS.VIDEO_TRANSCODED ? 'transcoded' : 'failed';
      resolve({ kind, data: envelope.data } as WorkerResult);
    }
  });
});

afterAll(async () => {
  await ch.close();
  await conn.close();
});

function publish(event: VideoTranscodeEvent): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(event.videoId);
      reject(
        new Error(`Timed out after ${TIMEOUT_MS}ms — is the worker running?`),
      );
    }, TIMEOUT_MS);

    pending.set(event.videoId, (result) => {
      clearTimeout(timer);
      resolve(result);
    });

    ch.sendToQueue(
      QUEUES.VIDEO_TRANSCODE,
      Buffer.from(
        JSON.stringify({ pattern: EVENTS.VIDEO_TRANSCODE, data: event }),
      ),
      { persistent: true },
    );
  });
}

function makeEvent(): VideoTranscodeEvent {
  return {
    videoId: 'bd30772f-b674-4d3b-838c-26e024ac203b',
    ownerType: 'episode',
    ownerId: crypto.randomUUID(),
    rawObjectKey: `/temp/bd30772f-b674-4d3b-838c-26e024ac203b/original.mp4`,
    qualities: ['720p'],
  };
}

describe('worker e2e', () => {
  test('processes a single message and emits transcoded event', async () => {
    const event = makeEvent();
    const result = await publish(event);

    expect(result.kind).toBe('transcoded');
    expect(result.data.videoId).toBe(event.videoId);
    expect(result.data.ownerId).toBe(event.ownerId);
  });

  test('processes multiple messages and all emit transcoded events', async () => {
    const events = Array.from({ length: 5 }, () => makeEvent());
    const results = await Promise.all(events.map(publish));

    expect(results).toHaveLength(5);
    for (const [i, result] of results.entries()) {
      expect(result.data.videoId).toBe(events[i].videoId);
      expect(result.kind).toBe('transcoded');
    }
  });

  test('response is wrapped in the NestJS envelope with correct pattern', async () => {
    const event = makeEvent();

    const raw = await new Promise<{
      pattern: string;
      data: VideoTranscodedEvent | VideoTranscodeFailedEvent;
    }>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Timed out')),
        TIMEOUT_MS,
      );

      pending.set(event.videoId, (result) => {
        clearTimeout(timer);
        resolve({
          pattern:
            result.kind === 'transcoded'
              ? EVENTS.VIDEO_TRANSCODED
              : EVENTS.VIDEO_TRANSCODE_FAILED,
          data: result.data,
        });
      });

      ch.sendToQueue(
        QUEUES.VIDEO_TRANSCODE,
        Buffer.from(
          JSON.stringify({ pattern: EVENTS.VIDEO_TRANSCODE, data: event }),
        ),
        { persistent: true },
      );
    });

    expect(raw.pattern).toBe(EVENTS.VIDEO_TRANSCODED);
    expect(raw.data.videoId).toBe(event.videoId);
  });

  test('worker survives a malformed message and keeps processing', async () => {
    ch.sendToQueue(QUEUES.VIDEO_TRANSCODE, Buffer.from('not valid json {{'), {
      persistent: true,
    });

    await Bun.sleep(500);

    const event = makeEvent();
    const result = await publish(event);

    expect(result.kind).toBe('transcoded');
  });
});
