import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';
import { createTestApp } from './setup/test-app';
import {
  seedDefaultAvatar,
  registerUser,
  loginUser,
  truncateTables,
} from './setup/helpers';
import type { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto';
import type { Profile } from '@/modules/profiles/profile.entity';

describe('Auth (e2e)', () => {
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

  describe('POST /api/auth/register', () => {
    it('should register a user and return tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        })
        .expect(201);
      const body = res.body as AuthResponseDto;

      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });

    it('should auto-create a profile on registration', async () => {
      const tokens = await registerUser(app, {
        email: 'profile@example.com',
        name: 'Profile User',
      });

      const res = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);
      const body = res.body as Profile[];

      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Profile User');
    });

    it('should reject duplicate email (409)', async () => {
      await registerUser(app, { email: 'dup@example.com' });

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'dup@example.com',
          password: 'password123',
          name: 'Dup User',
        })
        .expect(409);
    });

    it('should reject missing name (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bad@example.com', password: 'password123' })
        .expect(400);
    });

    it('should reject short password (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bad@example.com', password: 'short', name: 'Bad' })
        .expect(400);
    });

    it('should reject invalid email (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Bad' })
        .expect(400);
    });

    it('should reject unknown fields (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'ok@example.com',
          password: 'password123',
          name: 'Good',
          hackerField: 'nope',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await registerUser(app, {
        email: 'login@example.com',
        password: 'password123',
      });

      const res = await loginUser(app, {
        email: 'login@example.com',
        password: 'password123',
      });

      expect(res).toHaveProperty('accessToken');
      expect(res).toHaveProperty('refreshToken');
    });

    it('should reject wrong password (401)', async () => {
      await registerUser(app, { email: 'wrong@example.com' });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent email (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh with valid refresh token', async () => {
      const tokens = await registerUser(app, { email: 'refresh@example.com' });

      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .expect(200);
      const body = res.body as AuthResponseDto;

      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });

    it('should rotate token (old refresh token fails)', async () => {
      const tokens = await registerUser(app, { email: 'rotate@example.com' });

      // Refresh once
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .expect(200);

      // Old token should no longer work (use case throws ForbiddenException)
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .expect(403);
    });

    it('should reject invalid token (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should invalidate refresh token', async () => {
      const tokens = await registerUser(app, { email: 'logout@example.com' });

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      // Refresh should now fail (token deleted from DB → ForbiddenException)
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .expect(403);
    });

    it('should reject unauthenticated (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });
  });
});
