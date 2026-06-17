import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { Playlist } from '@/modules/admin/playlists/playlist.entity';
import type { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto';

import type { CatalogSeed } from './setup/helpers';
import {
  registerAdmin,
  registerUser,
  seedCatalog,
  seedDefaultAvatar,
  truncateTables,
} from './setup/helpers';
import { createTestApp } from './setup/test-app';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Admin Playlists (e2e)', () => {
  let app: NestFastifyApplication;
  let container: StartedPostgreSqlContainer;
  let admin: AuthResponseDto;
  let seed: CatalogSeed;

  beforeAll(async () => {
    const db = await startTestDatabase();
    container = db.container;
    app = await createTestApp(db.databaseUrl);
  }, 120_000);

  beforeEach(async () => {
    await seedDefaultAvatar(app);
    admin = await registerAdmin(app, { email: 'admin@example.com' });
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

  describe('GET /api/admin/playlists', () => {
    it('should list playlists filtered by series', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/playlists')
        .query({ seriesId: seed.seriesId })
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as Playlist[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id', seed.playlistId);
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/playlists')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/playlists', () => {
    it('should create a playlist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/playlists')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          seriesId: seed.seriesId,
          type: 'season',
          number: 2,
          title: 'Season 2',
        })
        .expect(201);
      const body = res.body as Playlist;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('number', 2);
      expect(body).toHaveProperty('title', 'Season 2');
    });

    it('should reject duplicate number within a series (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/playlists')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ seriesId: seed.seriesId, type: 'season', number: 1 })
        .expect(409);
    });

    it('should return 404 for unknown series', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/playlists')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ seriesId: UNKNOWN_ID, type: 'season', number: 1 })
        .expect(404);
    });
  });

  describe('GET /api/admin/playlists/:id', () => {
    it('should get a playlist by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/playlists/${seed.playlistId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', seed.playlistId);
    });

    it('should return 404 for unknown playlist', async () => {
      await request(app.getHttpServer())
        .get(`/api/admin/playlists/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/admin/playlists/:id', () => {
    it('should update playlist details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/playlists/${seed.playlistId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ title: 'Renamed Season', status: 'finished' })
        .expect(200);

      expect(res.body).toHaveProperty('title', 'Renamed Season');
      expect(res.body).toHaveProperty('status', 'finished');
    });
  });

  describe('DELETE /api/admin/playlists/:id', () => {
    it('should delete a playlist (204)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/admin/playlists/${seed.playlistId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/admin/playlists/${seed.playlistId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });

  describe('POST /api/admin/playlists/:id/cover', () => {
    it('should upload a cover image (204)', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/playlists/${seed.playlistId}/cover`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-cover-bytes'), {
          filename: 'cover.png',
          contentType: 'image/png',
        })
        .expect(204);
    });

    it('should return 404 for unknown playlist', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/playlists/${UNKNOWN_ID}/cover`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-cover-bytes'), {
          filename: 'cover.png',
          contentType: 'image/png',
        })
        .expect(404);
    });
  });
});
