import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';
import { createTestApp } from './setup/test-app';
import {
  seedDefaultAvatar,
  seedAvatar,
  registerUser,
  truncateTables,
} from './setup/helpers';
import type { Profile } from '@/modules/profiles/profile.entity';

describe('Profiles (e2e)', () => {
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

  describe('GET /api/profiles', () => {
    it('should list own profiles', async () => {
      const tokens = await registerUser(app);

      const res = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);
      const body = res.body as Profile[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name', 'Test User');
    });

    it('should not leak other user profiles', async () => {
      await registerUser(app, { email: 'user1@example.com', name: 'User 1' });
      const user2 = await registerUser(app, {
        email: 'user2@example.com',
        name: 'User 2',
      });

      const res = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(200);
      const body = res.body as Profile[];

      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('User 2');
    });

    it('should reject unauthenticated (401)', async () => {
      await request(app.getHttpServer()).get('/api/profiles').expect(401);
    });
  });

  describe('POST /api/profiles', () => {
    it('should create a profile with valid avatarId', async () => {
      const tokens = await registerUser(app);
      const avatarId = await seedAvatar(app);

      const res = await request(app.getHttpServer())
        .post('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ name: 'Second Profile', avatarId })
        .expect(201);
      const body = res.body as Profile;

      expect(body).toHaveProperty('name', 'Second Profile');
      expect(body).toHaveProperty('avatarId', avatarId);
    });

    it('should reject invalid avatarId (404)', async () => {
      const tokens = await registerUser(app);

      await request(app.getHttpServer())
        .post('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          name: 'Bad Avatar',
          avatarId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('should enforce max 5 profiles (409)', async () => {
      const tokens = await registerUser(app);
      const avatarId = await seedAvatar(app);

      // Already have 1 from registration, create 4 more
      for (let i = 0; i < 4; i++) {
        await request(app.getHttpServer())
          .post('/api/profiles')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
          .send({ name: `Profile ${i + 2}`, avatarId })
          .expect(201);
      }

      // 6th should fail
      await request(app.getHttpServer())
        .post('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ name: 'Too Many', avatarId })
        .expect(409);
    });

    it('should reject missing fields (400)', async () => {
      const tokens = await registerUser(app);

      await request(app.getHttpServer())
        .post('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/profiles/:id', () => {
    it('should get own profile', async () => {
      const tokens = await registerUser(app);

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);
      const profiles = listRes.body as Profile[];

      const profileId = profiles[0].id;

      const res = await request(app.getHttpServer())
        .get(`/api/profiles/${profileId}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);
      const body = res.body as Profile;

      expect(body).toHaveProperty('id', profileId);
    });

    it('should return 404 for other user profile', async () => {
      const user1 = await registerUser(app, { email: 'owner@example.com' });
      const user2 = await registerUser(app, { email: 'other@example.com' });

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);
      const profiles = listRes.body as Profile[];

      await request(app.getHttpServer())
        .get(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent profile', async () => {
      const tokens = await registerUser(app);

      await request(app.getHttpServer())
        .get('/api/profiles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const tokens = await registerUser(app);

      await request(app.getHttpServer())
        .get('/api/profiles/not-a-uuid')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/profiles/:id', () => {
    it('should update profile name', async () => {
      const tokens = await registerUser(app);

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      const profiles = listRes.body as Profile[];

      const res = await request(app.getHttpServer())
        .patch(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);
      const body = res.body as Profile;

      expect(body).toHaveProperty('name', 'Updated Name');
    });

    it('should update profile avatarId', async () => {
      const tokens = await registerUser(app);
      const newAvatarId = await seedAvatar(app);

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      const profiles = listRes.body as Profile[];

      const res = await request(app.getHttpServer())
        .patch(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ avatarId: newAvatarId })
        .expect(200);
      const body = res.body as Profile;

      expect(body).toHaveProperty('avatarId', newAvatarId);
    });

    it('should reject invalid avatarId (404)', async () => {
      const tokens = await registerUser(app);

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      const profiles = listRes.body as Profile[];

      await request(app.getHttpServer())
        .patch(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ avatarId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });

    it('should return 404 for other user profile', async () => {
      const user1 = await registerUser(app, {
        email: 'patchowner@example.com',
      });
      const user2 = await registerUser(app, {
        email: 'patchother@example.com',
      });

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${user1.accessToken}`);
      const profiles = listRes.body as Profile[];

      await request(app.getHttpServer())
        .patch(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send({ name: 'Hacked' })
        .expect(404);
    });
  });

  describe('DELETE /api/profiles/:id', () => {
    it('should delete profile when 2+ exist (204)', async () => {
      const tokens = await registerUser(app);
      const avatarId = await seedAvatar(app);

      // Create a second profile
      await request(app.getHttpServer())
        .post('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ name: 'To Delete', avatarId })
        .expect(201);

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      const profiles = listRes.body as Profile[];

      expect(profiles).toHaveLength(2);

      await request(app.getHttpServer())
        .delete(`/api/profiles/${profiles[1].id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(204);

      // Verify only 1 remains
      const afterRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      const remaining = afterRes.body as Profile[];

      expect(remaining).toHaveLength(1);
    });

    it('should reject deleting last profile (409)', async () => {
      const tokens = await registerUser(app);

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      const profiles = listRes.body as Profile[];

      expect(profiles).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(409);
    });

    it('should return 404 for other user profile', async () => {
      const user1 = await registerUser(app, { email: 'delowner@example.com' });
      const user2 = await registerUser(app, { email: 'delother@example.com' });

      const listRes = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${user1.accessToken}`);
      const profiles = listRes.body as Profile[];

      await request(app.getHttpServer())
        .delete(`/api/profiles/${profiles[0].id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(404);
    });
  });
});
