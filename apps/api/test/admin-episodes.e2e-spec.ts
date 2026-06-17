import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { Episode } from '@/modules/admin/episodes/episode.entity';
import type { Video } from '@/modules/admin/videos/video.entity';
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

describe('Admin Episodes (e2e)', () => {
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

  describe('GET /api/admin/episodes', () => {
    it('should list episodes filtered by playlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/episodes')
        .query({ playlistId: seed.playlistId })
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as Episode[];

      expect(body).toHaveLength(2);
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/episodes')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/episodes', () => {
    it('should create an episode', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/episodes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          playlistId: seed.playlistId,
          number: 3,
          title: 'Episode 3',
          durationSeconds: 1380,
        })
        .expect(201);
      const body = res.body as Episode;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('number', 3);
      expect(body).toHaveProperty('title', 'Episode 3');
    });

    it('should reject duplicate number within a playlist (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/episodes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ playlistId: seed.playlistId, number: 1, title: 'Dup' })
        .expect(409);
    });

    it('should return 404 for unknown playlist', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/episodes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ playlistId: UNKNOWN_ID, number: 1, title: 'Orphan' })
        .expect(404);
    });
  });

  describe('GET /api/admin/episodes/:id', () => {
    it('should get an episode by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/episodes/${seed.episodeId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', seed.episodeId);
    });

    it('should return 404 for unknown episode', async () => {
      await request(app.getHttpServer())
        .get(`/api/admin/episodes/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/admin/episodes/:id', () => {
    it('should update episode details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/episodes/${seed.episodeId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ title: 'Renamed Episode', durationSeconds: 1500 })
        .expect(200);

      expect(res.body).toHaveProperty('title', 'Renamed Episode');
      expect(res.body).toHaveProperty('durationSeconds', 1500);
    });

    it('should reject moving to an occupied number (409)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/episodes/${seed.episodeId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ number: 2 })
        .expect(409);
    });
  });

  describe('DELETE /api/admin/episodes/:id', () => {
    it('should delete an episode (204)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/admin/episodes/${seed.episode2Id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/admin/episodes/${seed.episode2Id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });

  describe('GET /api/admin/episodes/:id/video', () => {
    it('should return the episode video', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/episodes/${seed.episodeId}/video`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as Video;

      expect(body).toHaveProperty('id', seed.videoId);
      expect(body).toHaveProperty('status', 'ready');
    });
  });

  describe('POST /api/admin/episodes/:id/thumbnail', () => {
    it('should upload a thumbnail (204)', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/episodes/${seed.episodeId}/thumbnail`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-thumb-bytes'), {
          filename: 'thumb.png',
          contentType: 'image/png',
        })
        .expect(204);
    });

    it('should reject unsupported mime type (400)', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/episodes/${seed.episodeId}/thumbnail`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('not-an-image'), {
          filename: 'thumb.txt',
          contentType: 'text/plain',
        })
        .expect(400);
    });
  });
});
