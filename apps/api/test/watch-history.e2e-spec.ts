import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { CursorPaginatedResponse } from '@/common/types/pagination.types';
import type { WatchHistory } from '@/modules/watch-history/watch-history.entity';

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

describe('Watch History (e2e)', () => {
  let app: NestFastifyApplication;
  let container: StartedPostgreSqlContainer;
  let user: UserWithProfile;
  let seed: CatalogSeed;

  beforeAll(async () => {
    const db = await startTestDatabase();
    container = db.container;
    app = await createTestApp(db.databaseUrl);
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
  });

  function upsertProgress(
    body: Record<string, unknown>,
    asUser: UserWithProfile = user,
  ) {
    return request(app.getHttpServer())
      .put('/api/watch-history')
      .set('Authorization', `Bearer ${asUser.accessToken}`)
      .set('x-profile-id', asUser.profileId)
      .send(body);
  }

  describe('PUT /api/watch-history', () => {
    it('should create watch progress', async () => {
      const res = await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: 120,
        status: 'watching',
      }).expect(200);
      const body = res.body as WatchHistory;

      expect(body).toHaveProperty('episodeId', seed.episodeId);
      expect(body).toHaveProperty('positionSeconds', 120);
      expect(body).toHaveProperty('status', 'watching');
    });

    it('should update existing progress for the same episode', async () => {
      await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: 120,
        status: 'watching',
      }).expect(200);

      const res = await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: 1400,
        status: 'finished',
      }).expect(200);
      const body = res.body as WatchHistory;

      expect(body).toHaveProperty('positionSeconds', 1400);
      expect(body).toHaveProperty('status', 'finished');

      const listRes = await request(app.getHttpServer())
        .get('/api/watch-history')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const list = listRes.body as CursorPaginatedResponse<WatchHistory>;

      expect(list.items).toHaveLength(1);
    });

    it('should return 404 for unknown episode', async () => {
      await upsertProgress({
        episodeId: UNKNOWN_ID,
        positionSeconds: 10,
        status: 'watching',
      }).expect(404);
    });

    it('should reject negative position (400)', async () => {
      await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: -5,
        status: 'watching',
      }).expect(400);
    });

    it('should reject missing x-profile-id header (400)', async () => {
      await request(app.getHttpServer())
        .put('/api/watch-history')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          episodeId: seed.episodeId,
          positionSeconds: 10,
          status: 'watching',
        })
        .expect(400);
    });
  });

  describe('GET /api/watch-history', () => {
    it('should list watch history for the active profile only', async () => {
      await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: 60,
        status: 'watching',
      }).expect(200);

      const other = await registerUserWithProfile(app, {
        email: 'watcher2@example.com',
        name: 'Watcher 2',
      });

      const res = await request(app.getHttpServer())
        .get('/api/watch-history')
        .set('Authorization', `Bearer ${other.accessToken}`)
        .set('x-profile-id', other.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<WatchHistory>;

      expect(body.items).toHaveLength(0);
    });
  });

  describe('GET /api/watch-history/continue', () => {
    it('should return latest watched episode per series', async () => {
      await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: 1400,
        status: 'finished',
      }).expect(200);
      await upsertProgress({
        episodeId: seed.episode2Id,
        positionSeconds: 30,
        status: 'watching',
      }).expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/watch-history/continue')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<WatchHistory>;

      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toHaveProperty('episodeId', seed.episode2Id);
    });
  });

  describe('GET /api/watch-history/episode/:episodeId', () => {
    it('should return progress for a single episode', async () => {
      await upsertProgress({
        episodeId: seed.episodeId,
        positionSeconds: 90,
        status: 'watching',
      }).expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/watch-history/episode/${seed.episodeId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);

      expect(res.body).toHaveProperty('positionSeconds', 90);
    });

    it('should return empty body when no progress exists', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/watch-history/episode/${seed.episodeId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);

      expect(res.body).toBeNull();
    });
  });
});
