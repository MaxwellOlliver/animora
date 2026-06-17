import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';

import type {
  WatchPartySession,
  WatchPartySnapshot,
} from '@/modules/watch-party/types/session.types';

import type { CatalogSeed, UserWithProfile } from './setup/helpers';
import {
  registerUserWithProfile,
  seedCatalog,
  seedDefaultAvatar,
  truncateTables,
} from './setup/helpers';
import { createTestApp } from './setup/test-app';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Watch Party (e2e)', () => {
  let app: NestFastifyApplication;
  let container: StartedPostgreSqlContainer;
  let redisContainer: StartedTestContainer;
  let user: UserWithProfile;
  let seed: CatalogSeed;

  beforeAll(async () => {
    const [db, redis] = await Promise.all([
      startTestDatabase(),
      new GenericContainer('redis:7-alpine').withExposedPorts(6379).start(),
    ]);
    container = db.container;
    redisContainer = redis;
    app = await createTestApp(db.databaseUrl, {
      redisUrl: `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`,
    });
  }, 120_000);

  beforeEach(async () => {
    await seedDefaultAvatar(app);
    user = await registerUserWithProfile(app);
    seed = await seedCatalog(app);
  });

  afterEach(async () => {
    if (!app) return;
    await truncateTables(app);
  });

  afterAll(async () => {
    if (app) await app.close();
    await stopTestDatabase(container);
    if (redisContainer) await redisContainer.stop();
  });

  async function createSession(
    asUser: UserWithProfile = user,
  ): Promise<WatchPartySession> {
    const res = await request(app.getHttpServer())
      .post('/api/watch-party')
      .set('Authorization', `Bearer ${asUser.accessToken}`)
      .set('x-profile-id', asUser.profileId)
      .send({ episodeId: seed.episodeId })
      .expect(201);
    return (res.body as { session: WatchPartySession }).session;
  }

  describe('POST /api/watch-party', () => {
    it('should create a session with a join code', async () => {
      const session = await createSession();

      expect(session.code).toMatch(/^[A-Z2-9]{6}$/);
      expect(session).toHaveProperty('episodeId', seed.episodeId);
      expect(session).toHaveProperty('ownerProfileId', user.profileId);
      expect(session).toHaveProperty('locked', false);
    });

    it('should return 404 for unknown episode', async () => {
      await request(app.getHttpServer())
        .post('/api/watch-party')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ episodeId: UNKNOWN_ID })
        .expect(404);
    });

    it('should reject missing x-profile-id header (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/watch-party')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ episodeId: seed.episodeId })
        .expect(400);
    });
  });

  describe('POST /api/watch-party/:code/join', () => {
    it('should join a session and return a snapshot with the member', async () => {
      const session = await createSession();

      const guest = await registerUserWithProfile(app, {
        email: 'guest@example.com',
        name: 'Guest',
      });

      const res = await request(app.getHttpServer())
        .post(`/api/watch-party/${session.code}/join`)
        .set('Authorization', `Bearer ${guest.accessToken}`)
        .set('x-profile-id', guest.profileId)
        .expect(201);
      const body = res.body as WatchPartySnapshot;

      expect(body.session).toHaveProperty('code', session.code);
      expect(
        body.members.map((member) => member.profileId),
      ).toContain(guest.profileId);
      expect(body.playback).toHaveProperty('playing', false);
    });

    it('should accept lowercase codes', async () => {
      const session = await createSession();

      await request(app.getHttpServer())
        .post(`/api/watch-party/${session.code.toLowerCase()}/join`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(201);
    });

    it('should return 404 for unknown code', async () => {
      await request(app.getHttpServer())
        .post('/api/watch-party/ZZZZZZ/join')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(404);
    });
  });

  describe('GET /api/watch-party/:code', () => {
    it('should return the session snapshot', async () => {
      const session = await createSession();

      const res = await request(app.getHttpServer())
        .get(`/api/watch-party/${session.code}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as WatchPartySnapshot;

      expect(body.session).toHaveProperty('id', session.id);
      expect(body).toHaveProperty('members');
      expect(body).toHaveProperty('chatBacklog');
    });

    it('should return 404 for unknown code', async () => {
      await request(app.getHttpServer())
        .get('/api/watch-party/ZZZZZZ')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(404);
    });
  });
});
