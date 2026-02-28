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
import type { ContentClassification } from '@/modules/admin/content-classifications/content-classification.entity';

describe('Admin Content Classifications (e2e)', () => {
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

  describe('GET /api/admin/content-classifications', () => {
    it('should list content classifications as admin', async () => {
      const admin = await registerAdmin(app, { email: 'admin-cc@example.com' });

      await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: '+14',
          description: 'Not recommended for children under 14.',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as ContentClassification[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('name', '+14');
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user-cc@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/content-classifications', () => {
    it('should create content classification', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-create-cc@example.com',
      });

      const res = await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: '+16',
          description: 'Not recommended for children under 16.',
        })
        .expect(201);
      const body = res.body as ContentClassification;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', '+16');
      expect(body).toHaveProperty('active', true);
    });

    it('should reject duplicate name (409)', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-dup-cc@example.com',
      });

      await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: '+18' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: '+18' })
        .expect(409);
    });
  });

  describe('GET /api/admin/content-classifications/:id', () => {
    it('should get content classification by id', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-get-cc@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'All Ages' })
        .expect(201);
      const created = createRes.body as ContentClassification;

      const res = await request(app.getHttpServer())
        .get(`/api/admin/content-classifications/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as ContentClassification;

      expect(body).toHaveProperty('id', created.id);
      expect(body).toHaveProperty('name', 'All Ages');
    });
  });

  describe('PATCH /api/admin/content-classifications/:id', () => {
    it('should update content classification', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-update-cc@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: '+12' })
        .expect(201);
      const created = createRes.body as ContentClassification;

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/content-classifications/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: '+10',
          description: 'Contains light violence.',
          active: false,
        })
        .expect(200);
      const body = res.body as ContentClassification;

      expect(body).toHaveProperty('name', '+10');
      expect(body).toHaveProperty('description', 'Contains light violence.');
      expect(body).toHaveProperty('active', false);
    });
  });

  describe('POST /api/admin/content-classifications/:id/icon', () => {
    it('should upload icon and update iconKey', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-upload-cc@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Mature' })
        .expect(201);
      const created = createRes.body as ContentClassification;

      const uploadRes = await request(app.getHttpServer())
        .post(`/api/admin/content-classifications/${created.id}/icon`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-image-bytes'), {
          filename: 'icon.png',
          contentType: 'image/png',
        })
        .expect(200);
      const body = uploadRes.body as ContentClassification;

      expect(body).toHaveProperty(
        'iconKey',
        'classification-icons/test-upload.png',
      );
    });

    it('should reject unsupported mime type (400)', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-invalid-upload-cc@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Invalid Upload Type' })
        .expect(201);
      const created = createRes.body as ContentClassification;

      await request(app.getHttpServer())
        .post(`/api/admin/content-classifications/${created.id}/icon`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('not-an-image'), {
          filename: 'icon.txt',
          contentType: 'text/plain',
        })
        .expect(400);
    });
  });

  describe('DELETE /api/admin/content-classifications/:id', () => {
    it('should delete content classification', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-delete-cc@example.com',
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/content-classifications')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Delete Me' })
        .expect(201);
      const created = createRes.body as ContentClassification;

      await request(app.getHttpServer())
        .delete(`/api/admin/content-classifications/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/admin/content-classifications/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });
});
