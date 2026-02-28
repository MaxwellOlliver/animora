import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';
import { createTestApp } from './setup/test-app';
import {
  seedDefaultAvatar,
  registerUser,
  truncateTables,
} from './setup/helpers';
import type { User } from '@/modules/users/user.entity';

describe('Users (e2e)', () => {
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

  describe('GET /api/users/me', () => {
    it('should return the current user', async () => {
      const tokens = await registerUser(app, {
        email: 'me@example.com',
        name: 'Me User',
      });

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);
      const body = res.body as User;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email', 'me@example.com');
      expect(body).toHaveProperty('role', 'USER');
      expect(body).toHaveProperty('provider', 'LOCAL');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });

    it('should not return a different user', async () => {
      const user1 = await registerUser(app, { email: 'user1@example.com' });
      await registerUser(app, { email: 'user2@example.com' });

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);
      const body = res.body as User;

      expect(body.email).toBe('user1@example.com');
    });

    it('should reject unauthenticated (401)', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });
  });
});
