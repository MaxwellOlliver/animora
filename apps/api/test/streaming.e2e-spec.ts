import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { Video } from '@/modules/admin/videos/video.entity';

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

interface WatchPayload {
  episode: { id: string; number: number; title: string };
  video: Video | null;
  rating: {
    likes: number;
    dislikes: number;
    myRating: string | null;
    liked: boolean;
  };
  nextEpisode: { id: string } | null;
}

describe('Streaming (e2e)', () => {
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

  describe('GET /api/streaming/watch/:episodeId', () => {
    it('should return the full watch payload', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/streaming/watch/${seed.episodeId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as WatchPayload;

      expect(body.episode).toHaveProperty('id', seed.episodeId);
      expect(body.episode).toHaveProperty('number', 1);
      expect(body.video).toHaveProperty('id', seed.videoId);
      expect(body.video).toHaveProperty('status', 'ready');
      expect(body.rating).toEqual({
        likes: 0,
        dislikes: 0,
        myRating: null,
        liked: false,
      });
      expect(body.nextEpisode).toHaveProperty('id', seed.episode2Id);
    });

    it('should include own rating in the payload', async () => {
      await request(app.getHttpServer())
        .put(`/api/episodes/${seed.episodeId}/rating`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/streaming/watch/${seed.episodeId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as WatchPayload;

      expect(body.rating).toEqual({
        likes: 1,
        dislikes: 0,
        myRating: 'like',
        liked: true,
      });
    });

    it('should return null video and nextEpisode for the last episode', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/streaming/watch/${seed.episode2Id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as WatchPayload;

      // findByOwner returns undefined, which JSON serialization drops
      expect(body.video ?? null).toBeNull();
      expect(body.nextEpisode).toBeNull();
    });

    it('should return 404 for unknown episode', async () => {
      await request(app.getHttpServer())
        .get(`/api/streaming/watch/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(404);
    });

    it('should reject unauthenticated (401)', async () => {
      await request(app.getHttpServer())
        .get(`/api/streaming/watch/${seed.episodeId}`)
        .expect(401);
    });

    it('should reject missing x-profile-id header (400)', async () => {
      await request(app.getHttpServer())
        .get(`/api/streaming/watch/${seed.episodeId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(400);
    });
  });
});
