import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'crypto';
import { eq, sql } from 'drizzle-orm';
import request from 'supertest';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { contentClassifications } from '@/modules/admin/content-classifications/content-classification.entity';
import { episodes } from '@/modules/admin/episodes/episode.entity';
import { playlists } from '@/modules/admin/playlists/playlist.entity';
import { series } from '@/modules/admin/series/entities/series.entity';
import { trailers } from '@/modules/admin/trailers/trailer.entity';
import { videos } from '@/modules/admin/videos/video.entity';
import type { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto';
import type { Profile } from '@/modules/profiles/profile.entity';
import { users } from '@/modules/users/user.entity';

const defaultUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

export async function seedDefaultAvatar(
  app: NestFastifyApplication,
): Promise<string> {
  const db = app.get<DrizzleDB>(DRIZZLE);
  const [avatar] = await db
    .insert(avatars)
    .values({
      name: 'Default Avatar',
      active: true,
      default: true,
    })
    .returning();
  return avatar.id;
}

export async function seedAvatar(app: NestFastifyApplication): Promise<string> {
  const db = app.get<DrizzleDB>(DRIZZLE);
  const [avatar] = await db
    .insert(avatars)
    .values({
      name: 'Custom Avatar',
      active: true,
      default: false,
    })
    .returning();
  return avatar.id;
}

export async function registerUser(
  app: NestFastifyApplication,
  data?: Partial<typeof defaultUser>,
): Promise<AuthResponseDto> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ ...defaultUser, ...data })
    .expect(201);
  return res.body as AuthResponseDto;
}

export async function loginUser(
  app: NestFastifyApplication,
  data: { email: string; password: string },
): Promise<AuthResponseDto> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send(data)
    .expect(200);
  return res.body as AuthResponseDto;
}

export async function registerAdmin(
  app: NestFastifyApplication,
  data?: Partial<typeof defaultUser>,
): Promise<AuthResponseDto> {
  const userData = { ...defaultUser, ...data };
  await registerUser(app, userData);

  const db = app.get<DrizzleDB>(DRIZZLE);
  await db
    .update(users)
    .set({ role: 'ADMIN' })
    .where(eq(users.email, userData.email));

  return loginUser(app, {
    email: userData.email,
    password: userData.password,
  });
}

export interface UserWithProfile {
  accessToken: string;
  profileId: string;
}

export async function registerUserWithProfile(
  app: NestFastifyApplication,
  data?: Partial<typeof defaultUser>,
): Promise<UserWithProfile> {
  const tokens = await registerUser(app, data);
  const res = await request(app.getHttpServer())
    .get('/api/profiles')
    .set('Authorization', `Bearer ${tokens.accessToken}`)
    .expect(200);
  const profiles = res.body as Profile[];
  return { accessToken: tokens.accessToken, profileId: profiles[0].id };
}

export interface CatalogSeed {
  classificationId: string;
  seriesId: string;
  playlistId: string;
  episodeId: string;
  episode2Id: string;
  videoId: string;
  trailerId: string;
}

export async function seedCatalog(
  app: NestFastifyApplication,
): Promise<CatalogSeed> {
  const db = app.get<DrizzleDB>(DRIZZLE);

  const [classification] = await db
    .insert(contentClassifications)
    .values({ name: `+14-${randomUUID().slice(0, 8)}` })
    .returning();

  const [s] = await db
    .insert(series)
    .values({
      name: 'Seeded Series',
      synopsis: 'A series seeded for tests.',
      contentClassificationId: classification.id,
    })
    .returning();

  const [playlist] = await db
    .insert(playlists)
    .values({ seriesId: s.id, type: 'season', number: 1, title: 'Season 1' })
    .returning();

  const [episode1] = await db
    .insert(episodes)
    .values({
      playlistId: playlist.id,
      number: 1,
      title: 'Episode 1',
      durationSeconds: 1420,
    })
    .returning();

  const [episode2] = await db
    .insert(episodes)
    .values({ playlistId: playlist.id, number: 2, title: 'Episode 2' })
    .returning();

  const [video] = await db
    .insert(videos)
    .values({
      ownerType: 'episode',
      ownerId: episode1.id,
      status: 'ready',
      masterPlaylistKey: 'videos/test/master.m3u8',
    })
    .returning();

  const [trailer] = await db
    .insert(trailers)
    .values({
      seriesId: s.id,
      playlistId: playlist.id,
      number: 1,
      title: 'Trailer 1',
      durationSeconds: 90,
    })
    .returning();

  return {
    classificationId: classification.id,
    seriesId: s.id,
    playlistId: playlist.id,
    episodeId: episode1.id,
    episode2Id: episode2.id,
    videoId: video.id,
    trailerId: trailer.id,
  };
}

export async function truncateTables(
  app: NestFastifyApplication,
): Promise<void> {
  const db = app.get<DrizzleDB>(DRIZZLE);
  const result = await db.execute<{ tablename: string }>(sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE '\\_\\_%'
  `);
  const tables = result.rows
    .map((row) => `"${row.tablename}"`)
    .join(', ');
  if (!tables) return;
  await db.execute(sql.raw(`TRUNCATE TABLE ${tables} CASCADE`));
}
