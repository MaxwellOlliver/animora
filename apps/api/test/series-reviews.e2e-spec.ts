import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { CursorPaginatedResponse } from '@/common/types/pagination.types';
import type { SeriesReview } from '@/modules/series-reviews/series-review.entity';

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

describe('Series Reviews (e2e)', () => {
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

  function createReview(
    body: Record<string, unknown>,
    asUser: UserWithProfile = user,
  ) {
    return request(app.getHttpServer())
      .post(`/api/series/${seed.seriesId}/review`)
      .set('Authorization', `Bearer ${asUser.accessToken}`)
      .set('x-profile-id', asUser.profileId)
      .send(body);
  }

  describe('POST /api/series/:seriesId/review', () => {
    it('should create a review', async () => {
      const res = await createReview({
        rating: 5,
        text: 'Masterpiece.',
      }).expect(201);
      const body = res.body as SeriesReview;

      expect(body).toHaveProperty('rating', 5);
      expect(body).toHaveProperty('text', 'Masterpiece.');
      expect(body).toHaveProperty('profileId', user.profileId);
    });

    it('should reject a second review from the same profile (409)', async () => {
      await createReview({ rating: 5, text: 'First.' }).expect(201);
      await createReview({ rating: 1, text: 'Second.' }).expect(409);
    });

    it('should reject out-of-range rating (400)', async () => {
      await createReview({ rating: 6, text: 'Too high.' }).expect(400);
    });

    it('should reject missing x-profile-id header (400)', async () => {
      await request(app.getHttpServer())
        .post(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ rating: 4, text: 'No profile.' })
        .expect(400);
    });
  });

  describe('GET /api/series/:seriesId/review', () => {
    it('should return own review', async () => {
      await createReview({ rating: 4, text: 'Solid.' }).expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);

      expect(res.body).toHaveProperty('rating', 4);
    });

    it('should return empty body when no review exists', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);

      expect(res.body).toBeNull();
    });
  });

  describe('PATCH /api/series/:seriesId/review', () => {
    it('should update own review', async () => {
      await createReview({ rating: 3, text: 'Okay.' }).expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ rating: 5, text: 'Grew on me.' })
        .expect(200);

      expect(res.body).toHaveProperty('rating', 5);
      expect(res.body).toHaveProperty('text', 'Grew on me.');
    });

    it('should return 404 when no review exists', async () => {
      await request(app.getHttpServer())
        .patch(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ rating: 2 })
        .expect(404);
    });
  });

  describe('DELETE /api/series/:seriesId/review', () => {
    it('should delete own review (204)', async () => {
      await createReview({ rating: 2, text: 'Meh.' }).expect(201);

      await request(app.getHttpServer())
        .delete(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);

      expect(res.body).toBeNull();
    });

    it('should return 404 when no review exists', async () => {
      await request(app.getHttpServer())
        .delete(`/api/series/${seed.seriesId}/review`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(404);
    });
  });

  describe('GET /api/catalog/series/:seriesId/reviews', () => {
    it('should list reviews and feed the series rating average', async () => {
      await createReview({ rating: 4, text: 'Good.' }).expect(201);

      const other = await registerUserWithProfile(app, {
        email: 'reviewer2@example.com',
        name: 'Reviewer 2',
      });
      await createReview({ rating: 2, text: 'Not for me.' }, other).expect(
        201,
      );

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${seed.seriesId}/reviews`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<SeriesReview>;

      expect(body.items).toHaveLength(2);

      const detailRes = await request(app.getHttpServer())
        .get(`/api/catalog/series/${seed.seriesId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const detail = detailRes.body as {
        rating: { average: number; count: number };
      };

      expect(detail.rating).toEqual({ average: 3, count: 2 });
    });

    it('should return empty list for series without reviews', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${UNKNOWN_ID}/reviews`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<SeriesReview>;

      expect(body.items).toHaveLength(0);
    });
  });
});
