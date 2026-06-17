import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

import type { CursorPaginatedResponse } from '@/common/types/pagination.types';
import type { EpisodeComment } from '@/modules/episode-comments/entities/episode-comment.entity';
import type { TopLevelComment } from '@/modules/episode-comments/repositories/episode-comments.repository';

import type { CatalogSeed, UserWithProfile } from './setup/helpers';
import {
  registerUserWithProfile,
  seedCatalog,
  seedDefaultAvatar,
  truncateTables,
} from './setup/helpers';
import { createTestApp } from './setup/test-app';
import { startTestDatabase, stopTestDatabase } from './setup/test-database';

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Episode Comments (e2e)', () => {
  let app: NestFastifyApplication;
  let container: StartedPostgreSqlContainer;
  let user: UserWithProfile;
  let seed: CatalogSeed;

  beforeAll(async () => {
    const db = await startTestDatabase();
    container = db.container;
    app = await createTestApp(db.databaseUrl);
  }, 120_000);

  beforeEach(async () => {
    await seedDefaultAvatar(app);
    user = await registerUserWithProfile(app);
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

  function createComment(
    episodeId: string,
    body: Record<string, unknown>,
    asUser: UserWithProfile = user,
  ) {
    return request(app.getHttpServer())
      .post(`/api/episodes/${episodeId}/comments`)
      .set('Authorization', `Bearer ${asUser.accessToken}`)
      .set('x-profile-id', asUser.profileId)
      .send(body);
  }

  describe('POST /api/episodes/:episodeId/comments', () => {
    it('should create a comment', async () => {
      const res = await createComment(seed.episodeId, {
        text: 'Great episode!',
      }).expect(201);
      const body = res.body as EpisodeComment;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('text', 'Great episode!');
      expect(body).toHaveProperty('spoiler', false);
      expect(body).toHaveProperty('profileId', user.profileId);
    });

    it('should create a reply to a top-level comment', async () => {
      const parentRes = await createComment(seed.episodeId, {
        text: 'Top level',
      }).expect(201);
      const parent = parentRes.body as EpisodeComment;

      const res = await createComment(seed.episodeId, {
        text: 'A reply',
        parentId: parent.id,
      }).expect(201);
      const body = res.body as EpisodeComment;

      expect(body).toHaveProperty('parentId', parent.id);
    });

    it('should reject reply to a non-top-level comment (400)', async () => {
      const parentRes = await createComment(seed.episodeId, {
        text: 'Top level',
      }).expect(201);
      const parent = parentRes.body as EpisodeComment;

      const replyRes = await createComment(seed.episodeId, {
        text: 'A reply',
        parentId: parent.id,
      }).expect(201);
      const reply = replyRes.body as EpisodeComment;

      await createComment(seed.episodeId, {
        text: 'Nested too deep',
        parentId: reply.id,
      }).expect(400);
    });

    it('should reject replyToId without parentId (400)', async () => {
      const parentRes = await createComment(seed.episodeId, {
        text: 'Top level',
      }).expect(201);
      const parent = parentRes.body as EpisodeComment;

      await createComment(seed.episodeId, {
        text: 'Bad reply',
        replyToId: parent.id,
      }).expect(400);
    });

    it('should return 404 for unknown episode', async () => {
      await createComment(UNKNOWN_ID, { text: 'No episode' }).expect(404);
    });

    it('should reject empty text (400)', async () => {
      await createComment(seed.episodeId, { text: '' }).expect(400);
    });

    it('should reject missing x-profile-id header (400)', async () => {
      await request(app.getHttpServer())
        .post(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ text: 'No profile' })
        .expect(400);
    });

    it('should reject profile belonging to another user (403)', async () => {
      const other = await registerUserWithProfile(app, {
        email: 'other@example.com',
        name: 'Other',
      });

      await request(app.getHttpServer())
        .post(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', other.profileId)
        .send({ text: 'Stolen profile' })
        .expect(403);
    });
  });

  describe('GET /api/episodes/:episodeId/comments', () => {
    it('should list top-level comments with reply counts', async () => {
      const parentRes = await createComment(seed.episodeId, {
        text: 'Top level',
      }).expect(201);
      const parent = parentRes.body as EpisodeComment;
      await createComment(seed.episodeId, {
        text: 'A reply',
        parentId: parent.id,
      }).expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<TopLevelComment>;

      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toHaveProperty('id', parent.id);
      expect(body.items[0]).toHaveProperty('replyCount', 1);
    });

    it('should list replies when parentId is given', async () => {
      const parentRes = await createComment(seed.episodeId, {
        text: 'Top level',
      }).expect(201);
      const parent = parentRes.body as EpisodeComment;
      await createComment(seed.episodeId, {
        text: 'A reply',
        parentId: parent.id,
      }).expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments`)
        .query({ parentId: parent.id })
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<EpisodeComment>;

      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toHaveProperty('text', 'A reply');
    });
  });

  describe('GET /api/episodes/:episodeId/comments/count', () => {
    it('should count comments for an episode', async () => {
      await createComment(seed.episodeId, { text: 'One' }).expect(201);
      await createComment(seed.episodeId, { text: 'Two' }).expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments/count`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);

      expect(res.body).toHaveProperty('total', 2);
    });
  });

  describe('PATCH /api/comments/:commentId', () => {
    it('should update own comment', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'Original',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      const res = await request(app.getHttpServer())
        .patch(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ text: 'Edited' })
        .expect(200);

      expect(res.body).toHaveProperty('text', 'Edited');
    });

    it('should reject editing another profile comment (403)', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'Mine',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      const other = await registerUserWithProfile(app, {
        email: 'editor@example.com',
        name: 'Editor',
      });

      await request(app.getHttpServer())
        .patch(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .set('x-profile-id', other.profileId)
        .send({ text: 'Hijacked' })
        .expect(403);
    });

    it('should return 404 for unknown comment', async () => {
      await request(app.getHttpServer())
        .patch(`/api/comments/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ text: 'Ghost' })
        .expect(404);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('should delete own comment (204)', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'To delete',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      await request(app.getHttpServer())
        .delete(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<TopLevelComment>;

      expect(body.items).toHaveLength(0);
    });

    it('should reject deleting another profile comment (403)', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'Mine',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      const other = await registerUserWithProfile(app, {
        email: 'deleter@example.com',
        name: 'Deleter',
      });

      await request(app.getHttpServer())
        .delete(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .set('x-profile-id', other.profileId)
        .expect(403);
    });
  });

  describe('PUT /api/comments/:commentId/reaction', () => {
    it('should like a comment and reflect it in listing', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'React to me',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      await request(app.getHttpServer())
        .put(`/api/comments/${comment.id}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<TopLevelComment>;

      expect(body.items[0]).toHaveProperty('likes', 1);
      expect(body.items[0]).toHaveProperty('myReaction', 'like');
    });

    it('should switch reaction from like to dislike', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'Switch me',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      await request(app.getHttpServer())
        .put(`/api/comments/${comment.id}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);

      await request(app.getHttpServer())
        .put(`/api/comments/${comment.id}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'dislike' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<TopLevelComment>;

      expect(body.items[0]).toHaveProperty('likes', 0);
      expect(body.items[0]).toHaveProperty('dislikes', 1);
      expect(body.items[0]).toHaveProperty('myReaction', 'dislike');
    });

    it('should reject invalid reaction value (400)', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'Bad value',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      await request(app.getHttpServer())
        .put(`/api/comments/${comment.id}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'love' })
        .expect(400);
    });

    it('should return 404 for unknown comment', async () => {
      await request(app.getHttpServer())
        .put(`/api/comments/${UNKNOWN_ID}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(404);
    });
  });

  describe('DELETE /api/comments/:commentId/reaction', () => {
    it('should remove own reaction (204)', async () => {
      const createRes = await createComment(seed.episodeId, {
        text: 'Unreact me',
      }).expect(201);
      const comment = createRes.body as EpisodeComment;

      await request(app.getHttpServer())
        .put(`/api/comments/${comment.id}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .send({ value: 'like' })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/comments/${comment.id}/reaction`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/api/episodes/${seed.episodeId}/comments`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .set('x-profile-id', user.profileId)
        .expect(200);
      const body = res.body as CursorPaginatedResponse<TopLevelComment>;

      expect(body.items[0]).toHaveProperty('likes', 0);
      expect(body.items[0]).toHaveProperty('myReaction', null);
    });
  });
});
