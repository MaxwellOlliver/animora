import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { Avatar } from '@/modules/admin/avatars/avatar.entity';
import type { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto';

import {
  registerAdmin,
  registerUser,
  seedDefaultAvatar,
  truncateTables,
} from './setup/helpers';
import { createTestApp } from './setup/test-app';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Avatars (e2e)', () => {
  let app: NestFastifyApplication;
  let container: StartedPostgreSqlContainer;
  let admin: AuthResponseDto;

  beforeAll(async () => {
    const db = await startTestDatabase();
    container = db.container;
    app = await createTestApp(db.databaseUrl);
  }, 120_000);

  beforeEach(async () => {
    await seedDefaultAvatar(app);
    admin = await registerAdmin(app, { email: 'admin@example.com' });
  });

  afterEach(async () => {
    if (!app) return;
    await truncateTables(app);
  });

  afterAll(async () => {
    if (app) await app.close();
    await stopTestDatabase(container);
  });

  describe('GET /api/avatars (public)', () => {
    it('should list only active avatars without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Inactive Avatar', active: false })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/avatars')
        .expect(200);
      const body = res.body as Avatar[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('name', 'Default Avatar');
    });
  });

  describe('GET /api/admin/avatars', () => {
    it('should list all avatars including inactive', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Inactive Avatar', active: false })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as Avatar[];

      expect(body).toHaveLength(2);
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/avatars')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/avatars', () => {
    it('should create an avatar', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'New Avatar' })
        .expect(201);
      const body = res.body as Avatar;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', 'New Avatar');
    });

    it('should reject duplicate name (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Default Avatar' })
        .expect(409);
    });
  });

  describe('PATCH /api/admin/avatars/:id', () => {
    it('should update an avatar', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'To Rename' })
        .expect(201);
      const created = createRes.body as Avatar;

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/avatars/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Renamed', active: false })
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Renamed');
      expect(res.body).toHaveProperty('active', false);
    });

    it('should return 404 for unknown avatar', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/avatars/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Ghost' })
        .expect(404);
    });
  });

  describe('DELETE /api/admin/avatars/:id', () => {
    it('should delete a non-default avatar (204)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'To Delete' })
        .expect(201);
      const created = createRes.body as Avatar;

      await request(app.getHttpServer())
        .delete(`/api/admin/avatars/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);
    });

    it('should reject deleting the default avatar (409)', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const avatars = listRes.body as Avatar[];
      const defaultAvatar = avatars.find((avatar) => avatar.default)!;

      await request(app.getHttpServer())
        .delete(`/api/admin/avatars/${defaultAvatar.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(409);
    });
  });

  describe('POST /api/admin/avatars/:id/banner', () => {
    it('should upload a banner image', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/admin/avatars')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Banner Avatar' })
        .expect(201);
      const created = createRes.body as Avatar;

      await request(app.getHttpServer())
        .post(`/api/admin/avatars/${created.id}/banner`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-banner-bytes'), {
          filename: 'banner.png',
          contentType: 'image/png',
        })
        .expect(200);
    });

    it('should return 404 for unknown avatar', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/avatars/${UNKNOWN_ID}/banner`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-banner-bytes'), {
          filename: 'banner.png',
          contentType: 'image/png',
        })
        .expect(404);
    });
  });
});
