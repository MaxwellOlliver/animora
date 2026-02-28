import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { animeGenres } from '@/modules/admin/animes/anime-genre.entity';
import { animes } from '@/modules/admin/animes/anime.entity';
import { contentClassifications } from '@/modules/admin/content-classifications/content-classification.entity';
import { genres } from '@/modules/admin/genres/genre.entity';
import { profiles } from '@/modules/profiles/profile.entity';
import { refreshTokens } from '@/modules/auth/refresh-token.entity';
import { users } from '@/modules/users/user.entity';
import type { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto';

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
      url: 'https://example.com/default.png',
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
      url: 'https://example.com/custom.png',
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

export async function truncateTables(
  app: NestFastifyApplication,
): Promise<void> {
  const db = app.get<DrizzleDB>(DRIZZLE);
  await db.delete(animeGenres);
  await db.delete(animes);
  await db.delete(genres);
  await db.delete(contentClassifications);
  await db.delete(profiles);
  await db.delete(refreshTokens);
  await db.delete(users);
  await db.delete(avatars);
}
