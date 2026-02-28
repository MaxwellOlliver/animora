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
import type { AnimeWithDetails } from '@/modules/admin/animes/anime.entity';
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

describe('Admin Animes (e2e)', () => {
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

  describe('GET /api/admin/animes', () => {
    it('should list animes as admin', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-list-anime@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Action');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+14',
      );

      await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Attack on Titan',
          synopsis: 'Humans fight titans.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as AnimeWithDetails[];

      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('name', 'Attack on Titan');
      expect(body[0].genres).toHaveLength(1);
    });

    it('should reject non-admin user (403)', async () => {
      const user = await registerUser(app, { email: 'user-anime@example.com' });

      await request(app.getHttpServer())
        .get('/api/admin/animes')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/animes', () => {
    it('should create anime', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-create-anime@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Drama');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+16',
      );

      const res = await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Vinland Saga',
          synopsis: 'A story about revenge and growth.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const body = res.body as AnimeWithDetails;

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
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Invalid Anime',
          synopsis: 'This should fail.',
          contentClassificationId: '00000000-0000-0000-0000-000000000000',
          genreIds: [genre.id],
        })
        .expect(404);
    });
  });

  describe('GET /api/admin/animes/:id', () => {
    it('should get anime by id', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-get-anime@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Sci-Fi');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+12',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Steins;Gate',
          synopsis: 'Time travel story.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as AnimeWithDetails;

      const res = await request(app.getHttpServer())
        .get(`/api/admin/animes/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = res.body as AnimeWithDetails;

      expect(body).toHaveProperty('id', created.id);
      expect(body).toHaveProperty('name', 'Steins;Gate');
      expect(body.genres).toHaveLength(1);
    });
  });

  describe('PATCH /api/admin/animes/:id', () => {
    it('should update anime details and genres', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-update-anime@example.com',
      });
      const oldGenre = await seedGenre(app, admin.accessToken, 'Action');
      const newGenre = await seedGenre(app, admin.accessToken, 'Adventure');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+14',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'One Piece',
          synopsis: 'Pirate adventure.',
          contentClassificationId: classification.id,
          genreIds: [oldGenre.id],
        })
        .expect(201);
      const created = createRes.body as AnimeWithDetails;

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/animes/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'One Piece Remastered',
          synopsis: 'Updated synopsis.',
          active: false,
          genreIds: [newGenre.id],
        })
        .expect(200);
      const body = res.body as AnimeWithDetails;

      expect(body).toHaveProperty('name', 'One Piece Remastered');
      expect(body).toHaveProperty('active', false);
      expect(body.genres).toHaveLength(1);
      expect(body.genres[0]).toHaveProperty('id', newGenre.id);
    });
  });

  describe('POST /api/admin/animes/:id/banner', () => {
    it('should upload banner and update bannerKey', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-upload-anime@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Sports');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+10',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Haikyuu!!',
          synopsis: 'Volleyball anime.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as AnimeWithDetails;

      await request(app.getHttpServer())
        .post(`/api/admin/animes/${created.id}/banner`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('fake-banner-bytes'), {
          filename: 'banner.png',
          contentType: 'image/png',
        })
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get(`/api/admin/animes/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      const body = getRes.body as AnimeWithDetails;

      expect(body).toHaveProperty('bannerKey', 'banners/test-upload.png');
    });

    it('should reject unsupported mime type (400)', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-invalid-upload-anime@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Thriller');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+18',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Invalid Upload',
          synopsis: 'Should reject upload type.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as AnimeWithDetails;

      await request(app.getHttpServer())
        .post(`/api/admin/animes/${created.id}/banner`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .attach('file', Buffer.from('not-an-image'), {
          filename: 'banner.txt',
          contentType: 'text/plain',
        })
        .expect(400);
    });
  });

  describe('DELETE /api/admin/animes/:id', () => {
    it('should delete anime', async () => {
      const admin = await registerAdmin(app, {
        email: 'admin-delete-anime@example.com',
      });
      const genre = await seedGenre(app, admin.accessToken, 'Romance');
      const classification = await seedContentClassification(
        app,
        admin.accessToken,
        '+13',
      );

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/animes')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Delete Anime',
          synopsis: 'Anime to delete.',
          contentClassificationId: classification.id,
          genreIds: [genre.id],
        })
        .expect(201);
      const created = createRes.body as AnimeWithDetails;

      await request(app.getHttpServer())
        .delete(`/api/admin/animes/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/admin/animes/${created.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);
    });
  });
});
