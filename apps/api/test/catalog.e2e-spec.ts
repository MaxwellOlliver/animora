import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { CursorPaginatedResponse } from '@/common/types/pagination.types';
import type { Episode } from '@/modules/admin/episodes/episode.entity';
import type { Playlist } from '@/modules/admin/playlists/playlist.entity';
import type { SeriesWithDetails } from '@/modules/admin/series/entities/series.entity';
import type { Trailer } from '@/modules/admin/trailers/trailer.entity';

import {
  registerUser,
  seedCatalog,
  seedDefaultAvatar,
  truncateTables,
} from './setup/helpers';
import { createTestApp } from './setup/test-app';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Catalog (e2e)', () => {
  let app: NestFastifyApplication;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    const db = await startTestDatabase();
    container = db.container;
    app = await createTestApp(db.databaseUrl);
    await seedDefaultAvatar(app);
  }, 120_000);

  afterEach(async () => {
    if (!app) return;
    await truncateTables(app);
    await seedDefaultAvatar(app);
  });

  afterAll(async () => {
    if (app) await app.close();
    await stopTestDatabase(container);
  });

  describe('GET /api/catalog/recommended', () => {
    it('should reject unauthenticated (401)', async () => {
      await request(app.getHttpServer())
        .get('/api/catalog/recommended')
        .expect(401);
    });

    it('should list series with pagination envelope', async () => {
      const user = await registerUser(app);
      const seed = await seedCatalog(app);

      const res = await request(app.getHttpServer())
        .get('/api/catalog/recommended')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<SeriesWithDetails>;

      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toHaveProperty('id', seed.seriesId);
      expect(body).toHaveProperty('nextCursor', null);
    });
  });

  describe('GET /api/catalog/series/:id', () => {
    it('should return detail with classification and rating', async () => {
      const user = await registerUser(app);
      const seed = await seedCatalog(app);

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${seed.seriesId}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as {
        id: string;
        contentClassification: { id: string } | null;
        rating: { average: number; count: number };
      };

      expect(body).toHaveProperty('id', seed.seriesId);
      expect(body.contentClassification).toHaveProperty(
        'id',
        seed.classificationId,
      );
      expect(body.rating).toEqual({ average: 0, count: 0 });
    });

    it('should return 404 for unknown series', async () => {
      const user = await registerUser(app);

      await request(app.getHttpServer())
        .get(`/api/catalog/series/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const user = await registerUser(app);

      await request(app.getHttpServer())
        .get('/api/catalog/series/not-a-uuid')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(400);
    });
  });

  describe('GET /api/catalog/series/:id/playlists', () => {
    it('should list playlists for a series', async () => {
      const user = await registerUser(app);
      const seed = await seedCatalog(app);

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${seed.seriesId}/playlists`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as Playlist[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id', seed.playlistId);
    });

    it('should return empty array for series without playlists', async () => {
      const user = await registerUser(app);

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${UNKNOWN_ID}/playlists`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/catalog/series/:id/trailers', () => {
    it('should list trailers for a series', async () => {
      const user = await registerUser(app);
      const seed = await seedCatalog(app);

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${seed.seriesId}/trailers`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as Trailer[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id', seed.trailerId);
    });
  });

  describe('GET /api/catalog/series/:id/featured-trailer', () => {
    it('should return the newest trailer', async () => {
      const user = await registerUser(app);
      const seed = await seedCatalog(app);

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/series/${seed.seriesId}/featured-trailer`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as Trailer | null;

      expect(body).toHaveProperty('id', seed.trailerId);
    });
  });

  describe('GET /api/catalog/playlists/:playlistId/episodes', () => {
    it('should list episodes for a playlist', async () => {
      const user = await registerUser(app);
      const seed = await seedCatalog(app);

      const res = await request(app.getHttpServer())
        .get(`/api/catalog/playlists/${seed.playlistId}/episodes`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);
      const body = res.body as Episode[];

      expect(body).toHaveLength(2);
      expect(body.map((e) => e.number).sort()).toEqual([1, 2]);
    });
  });
});
