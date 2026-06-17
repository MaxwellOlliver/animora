import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { EpisodeRating } from '@/modules/episode-ratings/episode-rating.entity';

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

describe('Episode Ratings (e2e)', () => {
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

  describe('PUT /api/episodes/:episodeId/rating', () => {
    it('should create a like rating', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);
      const body = res.body as EpisodeRating;

      expect(body).toHaveProperty('value', 'like');
      expect(body).toHaveProperty('episodeId', seed.episodeId);
      expect(body).toHaveProperty('profileId', user.profileId);
    });

    it('should switch an existing rating to dislike', async () => {
      await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'dislike' })
        .expect(200);

      expect(res.body).toHaveProperty('value', 'dislike');
    });

    it('should return 404 for unknown episode', async () => {
      await request(app.getHttpServer())
        .put(`/api/episodes/${UNKNOWN_ID}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(404);
    });

    it('should reject invalid value (400)', async () => {
      await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'meh' })
        .expect(400);
    });

    it('should reject missing x-profile-id header (400)', async () => {
      await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ value: 'like' })
        .expect(400);
    });
  });

  describe('DELETE /api/episodes/:episodeId/rating', () => {
    it('should remove a rating (204)', async () => {
      await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(204);

      // Streaming payload reflects the removal
      const res = await request(app.getHttpServer())
        .get(`/api/streaming/watch/${seed.episodeId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as {
        rating: { likes: number; myRating: string | null };
      };

      expect(body.rating.likes).toBe(0);
      expect(body.rating.myRating).toBeNull();
    });

    it('should return 404 for unknown episode', async () => {
      await request(app.getHttpServer())
        .delete(`/api/episodes/${UNKNOWN_ID}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(404);
    });
  });
});
