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
import type { SeriesWithDetails } from '@/modules/admin/series/series.entity';
import type { ContentClassification } from '@/modules/admin/content-classifications/content-classification.entity';
import type { Genre } from '@/modules/admin/genres/genre.entity';

async function seedGenre(
  app: NestFastifyApplication,
  accessToken: string,
  name: string,
): Promise<Genre> {
  const res = await request(app.getHttpServer())
    .post('/api/admin/genres')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name })
    .expect(201);
  return res.body as Genre;
}

async function seedContentClassification(
  app: NestFastifyApplication,
  accessToken: string,
  name: string,
): Promise<ContentClassification> {
  const res = await request(app.getHttpServer())
    .post('/api/admin/content-classifications')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name })
    .expect(201);
  return res.body as ContentClassification;
}

describe('Admin Series (e2e)', () => {
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

  describe('GET /api/admin/series', () => {
    it('should list series as admin', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-list-series@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Action');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+14',
      );

      await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Attack on Titan',
          synopsis: 'Humans fight titans.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as SeriesWithDetails[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('name', 'Attack on Titan');
      expect(body[0].genres).toHaveLength(1);
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user-series@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/series')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/series', () => {
    it('should create series', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-create-series@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Drama');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+16',
      );

      const res = await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Vinland Saga',
          synopsis: 'A story about revenge and growth.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const body = res.body as SeriesWithDetails;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', 'Vinland Saga');
      expect(body.genres).toHaveLength(1);
      expect(body.genres[0]).toHaveProperty('id', genre.id);
    });

    it('should reject missing content classification (404)', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-missing-classification@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Fantasy');

      await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Invalid Series',
          synopsis: 'This should fail.',
          contentClassificationId: '00000000-0000-0000-0000-000000000000',
          genreIds: [genre.id],
        })
        .expect(404);
    });
  });

  describe('GET /api/admin/series/:id', () => {
    it('should get series by id', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-get-series@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Sci-Fi');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+12',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Steins;Gate',
          synopsis: 'Time travel story.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as SeriesWithDetails;

      const res = await request(app.getHttpServer())
        .get(`/api/admin/series/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as SeriesWithDetails;

      expect(body).toHaveProperty('id', created.id);
      expect(body).toHaveProperty('name', 'Steins;Gate');
      expect(body.genres).toHaveLength(1);
    });
  });

  describe('PATCH /api/admin/series/:id', () => {
    it('should update series details and genres', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-update-series@example.com',
      });
      const oldGenre = await seedGenre(app, admin.accessToken, 'Action');
      const newGenre = await seedGenre(app, admin.accessToken, 'Adventure');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+14',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'One Piece',
          synopsis: 'Pirate adventure.',
          contentClassificationId: classification.id,
          genreIds: [oldGenre.id],
        })
        .expect(201);
      const created = createRes.body as SeriesWithDetails;

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/series/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'One Piece Remastered',
          synopsis: 'Updated synopsis.',
          active: false,
          genreIds: [newGenre.id],
        })
        .expect(200);
      const body = res.body as SeriesWithDetails;

      expect(body).toHaveProperty('name', 'One Piece Remastered');
      expect(body).toHaveProperty('active', false);
      expect(body.genres).toHaveLength(1);
      expect(body.genres[0]).toHaveProperty('id', newGenre.id);
    });
  });

  describe('POST /api/admin/series/:id/banner', () => {
    it('should upload banner and update bannerKey', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-upload-series@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Sports');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+10',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Haikyuu!!',
          synopsis: 'Volleyball series.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as SeriesWithDetails;

      await request(app.getHttpServer())
        .post(`/api/admin/series/${created.id}/banner`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-banner-bytes'), {
          filename: 'banner.png',
          contentType: 'image/png',
        })
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get(`/api/admin/series/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = getRes.body as SeriesWithDetails;

      expect(body).toHaveProperty('bannerKey', 'banners/test-upload.png');
    });

    it('should reject unsupported mime type (400)', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-invalid-upload-series@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Thriller');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+18',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Invalid Upload',
          synopsis: 'Should reject upload type.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as SeriesWithDetails;

      await request(app.getHttpServer())
        .post(`/api/admin/series/${created.id}/banner`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('not-an-image'), {
          filename: 'banner.txt',
          contentType: 'text/plain',
        })
        .expect(400);
    });
  });

  describe('DELETE /api/admin/series/:id', () => {
    it('should delete series', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-delete-series@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Romance');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+13',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/series')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Delete Series',
          synopsis: 'Series to delete.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as SeriesWithDetails;

      await request(app.getHttpServer())
        .delete(`/api/admin/series/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/admin/series/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });
});
