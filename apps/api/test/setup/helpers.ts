import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { avatars } from '@/modules/admin/avatars/avatar.entity';
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

export async function truncateTables(
  app: NestFastifyApplication,
): Promise<void> {
  const db = app.get<DrizzleDB>(DRIZZLE);
  await db.delete(profiles);
  await db.delete(refreshTokens);
  await db.delete(users);
  await db.delete(avatars);
}
