import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';
import { createTestApp } from './setup/test-app';
import {
  registerAdmin,
  registerUser,
  seedDefaultAvatar,
  truncateTables,
} from './setup/helpers';
import type { Genre } from '@/modules/admin/genres/genre.entity';

describe('Admin Genres (e2e)', () => {
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

  describe('GET /api/admin/genres', () => {
    it('should list genres as admin', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-genre@example.com',
      });

      await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Action' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as Genre[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('name', 'Action');
    });

    it('should reject unauthenticated (401)', async () => {
      await request(app.getHttpServer()).get('/api/admin/genres').expect(401);
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user-genre@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/genres')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/genres', () => {
    it('should create a genre', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-create-genre@example.com',
      });

      const res = await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Drama' })
        .expect(201);
      const body = res.body as Genre;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', 'Drama');
      expect(body).toHaveProperty('active', true);
    });

    it('should reject duplicate name (409)', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-dup-genre@example.com',
      });

      await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Fantasy' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Fantasy' })
        .expect(409);
    });
  });

  describe('GET /api/admin/genres/:id', () => {
    it('should get genre by id', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-get-genre@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Mystery' })
        .expect(201);
      const created = createRes.body as Genre;

      const res = await request(app.getHttpServer())
        .get(`/api/admin/genres/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as Genre;

      expect(body).toHaveProperty('id', created.id);
      expect(body).toHaveProperty('name', 'Mystery');
    });

    it('should return 404 for non-existent genre', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-missing-genre@example.com',
      });

      await request(app.getHttpServer())
        .get('/api/admin/genres/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/admin/genres/:id', () => {
    it('should update genre', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-update-genre@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Comedy' })
        .expect(201);
      const created = createRes.body as Genre;

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/genres/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Slice of Life', active: false })
        .expect(200);
      const body = res.body as Genre;

      expect(body).toHaveProperty('name', 'Slice of Life');
      expect(body).toHaveProperty('active', false);
    });
  });

  describe('DELETE /api/admin/genres/:id', () => {
    it('should delete genre', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-delete-genre@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/genres')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Historical' })
        .expect(201);
      const created = createRes.body as Genre;

      await request(app.getHttpServer())
        .delete(`/api/admin/genres/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/admin/genres/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });
});
