import 'dotenv/config';
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import * as amqplib from 'amqplib';
import {
  EVENTS,
  QUEUES,
  type VideoUploadedEvent,
  type VideoProcessedEvent,
} from '@animora/contracts';

const TIMEOUT_MS = 15_000;

let conn: amqplib.ChannelModel;
let ch: amqplib.Channel;

const pending = new Map<string, (result: VideoProcessedEvent) => void>();

beforeAll(async () => {
  conn = await amqplib.connect(process.env.RABBITMQ_URL!);
  ch = await conn.createChannel();
  await ch.assertQueue(QUEUES.VIDEO_PROCESSING, { durable: true });
  await ch.assertQueue(QUEUES.VIDEO_PROCESSED, { durable: true });
  await ch.purgeQueue(QUEUES.VIDEO_PROCESSING);
  await ch.purgeQueue(QUEUES.VIDEO_PROCESSED);

  await ch.consume(QUEUES.VIDEO_PROCESSED, (msg) => {
    if (!msg) return;
    ch.ack(msg);

    const envelope = JSON.parse(msg.content.toString()) as {
      pattern: string;
      data: VideoProcessedEvent;
    };
    const resolve = pending.get(envelope.data.videoId);
    if (resolve) {
      pending.delete(envelope.data.videoId);
      resolve(envelope.data);
    }
  });
});

afterAll(async () => {
  await ch.close();
  await conn.close();
});

function publish(event: VideoUploadedEvent): Promise<VideoProcessedEvent> {
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
      QUEUES.VIDEO_PROCESSING,
      Buffer.from(
        JSON.stringify({ pattern: EVENTS.VIDEO_UPLOADED, data: event }),
      ),
      { persistent: true },
    );
  });
}

function makeEvent(): VideoUploadedEvent {
  return {
    videoId: 'bd30772f-b674-4d3b-838c-26e024ac203b',
    episodeId: crypto.randomUUID(),
    rawObjectKey: `/temp/bd30772f-b674-4d3b-838c-26e024ac203b/original.mp4`,
    qualities: ['720p'],
  };
}

describe('worker e2e', () => {
  test('processes a single message and returns status ready', async () => {
    const event = makeEvent();
    const result = await publish(event);

    expect(result.videoId).toBe(event.videoId);
    expect(result.episodeId).toBe(event.episodeId);
    expect(result.status).toBe('ready');
  });

  test('processes multiple messages and all return status ready', async () => {
    const events = Array.from({ length: 5 }, () => makeEvent());
    const results = await Promise.all(events.map(publish));

    expect(results).toHaveLength(5);
    for (const [i, result] of results.entries()) {
      expect(result.videoId).toBe(events[i].videoId);
      expect(result.status).toBe('ready');
    }
  });

  test('response is wrapped in the NestJS envelope with correct pattern', async () => {
    const event = makeEvent();

    const raw = await new Promise<{
      pattern: string;
      data: VideoProcessedEvent;
    }>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Timed out')),
        TIMEOUT_MS,
      );

      pending.set(event.videoId, (data) => {
        clearTimeout(timer);
        resolve({ pattern: EVENTS.VIDEO_PROCESSED, data });
      });

      ch.sendToQueue(
        QUEUES.VIDEO_PROCESSING,
        Buffer.from(
          JSON.stringify({ pattern: EVENTS.VIDEO_UPLOADED, data: event }),
        ),
        { persistent: true },
      );
    });

    expect(raw.pattern).toBe(EVENTS.VIDEO_PROCESSED);
    expect(raw.data.videoId).toBe(event.videoId);
  });

  test('worker survives a malformed message and keeps processing', async () => {
    ch.sendToQueue(QUEUES.VIDEO_PROCESSING, Buffer.from('not valid json {{'), {
      persistent: true,
    });

    await Bun.sleep(500);

    const event = makeEvent();
    const result = await publish(event);

    expect(result.status).toBe('ready');
  });
});
