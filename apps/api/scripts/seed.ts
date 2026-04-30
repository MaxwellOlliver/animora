import 'dotenv/config';

import { buildStorageKey, MEDIA_PURPOSE } from '@animora/contracts';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as bcrypt from 'bcrypt';
import { and, eq, ne, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Pool } from 'pg';

import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { media } from '@/modules/media/media.entity';
import { profiles } from '@/modules/profiles/profile.entity';
import { users } from '@/modules/users/user.entity';

const DEFAULT_AVATAR_FILENAME = 'default-avatar.webp';
const DEFAULT_AVATAR_MIME = 'image/webp';

const initialAvatars = [
  { name: 'Default Avatar', active: true, default: true },
] as const;

type Db = ReturnType<typeof drizzle>;

function buildS3Client(): { client: S3Client; bucket: string } {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? 'auto';
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  const bucket = process.env.S3_BUCKET;

  if (!endpoint || !accessKey || !secretKey || !bucket) {
    throw new Error(
      'Missing S3 env (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET)',
    );
  }

  return {
    client: new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    }),
    bucket,
  };
}

async function uploadDefaultAvatar(
  s3: S3Client,
  bucket: string,
): Promise<void> {
  const filepath = path.join(__dirname, 'assets', DEFAULT_AVATAR_FILENAME);
  const buffer = await fs.readFile(filepath);
  const s3Key = buildStorageKey(
    MEDIA_PURPOSE.userAvatar,
    DEFAULT_AVATAR_FILENAME,
  );
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: DEFAULT_AVATAR_MIME,
    }),
  );
}

async function ensureDefaultAvatarMedia(db: Db): Promise<string> {
  const [existing] = await db
    .select()
    .from(media)
    .where(
      and(
        eq(media.key, DEFAULT_AVATAR_FILENAME),
        eq(media.purpose, MEDIA_PURPOSE.userAvatar),
      ),
    )
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(media)
    .values({
      key: DEFAULT_AVATAR_FILENAME,
      purpose: MEDIA_PURPOSE.userAvatar,
      mimeType: DEFAULT_AVATAR_MIME,
    })
    .returning();
  return created.id;
}

async function seedAvatars(db: Db, defaultMediaId: string): Promise<string> {
  let defaultAvatarId: string | null = null;

  for (const avatar of initialAvatars) {
    const [existing] = await db
      .select()
      .from(avatars)
      .where(eq(avatars.name, avatar.name))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(avatars)
        .set({
          active: avatar.active,
          default: false,
          pictureId: avatar.default ? defaultMediaId : existing.pictureId,
        })
        .where(eq(avatars.id, existing.id))
        .returning();

      if (avatar.default) defaultAvatarId = updated.id;
      continue;
    }

    const [created] = await db
      .insert(avatars)
      .values({
        name: avatar.name,
        active: avatar.active,
        default: false,
        pictureId: avatar.default ? defaultMediaId : null,
      })
      .returning();

    if (avatar.default) defaultAvatarId = created.id;
  }

  if (!defaultAvatarId) {
    throw new Error('Default avatar was not seeded');
  }

  await db
    .update(avatars)
    .set({ default: false })
    .where(and(eq(avatars.default, true), ne(avatars.id, defaultAvatarId)));

  await db
    .update(avatars)
    .set({ default: true })
    .where(eq(avatars.id, defaultAvatarId));

  return defaultAvatarId;
}

async function seedAdmin(db: Db, defaultAvatarId: string): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@animora.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123456';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Admin';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  let adminId: string;

  if (existingAdmin) {
    await db
      .update(users)
      .set({
        role: 'ADMIN',
        provider: 'LOCAL',
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingAdmin.id));
    adminId = existingAdmin.id;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        provider: 'LOCAL',
      })
      .returning();
    adminId = created.id;
  }

  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, adminId))
    .limit(1);

  if (existingProfile) return;

  await db.insert(profiles).values({
    userId: adminId,
    name: adminName,
    avatarId: defaultAvatarId,
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  const { client: s3, bucket } = buildS3Client();

  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`);
    await uploadDefaultAvatar(s3, bucket);
    const defaultMediaId = await ensureDefaultAvatarMedia(db);
    const defaultAvatarId = await seedAvatars(db, defaultMediaId);
    await seedAdmin(db, defaultAvatarId);
    console.log('Seed completed');
  } finally {
    await pool.end();
    s3.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
