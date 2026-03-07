import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { and, eq, ne, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { users } from '@/modules/users/user.entity';

const initialAvatars = [
  { name: 'Default Avatar', active: true, default: true },
  { name: 'Ninja', active: true, default: false },
  { name: 'Samurai', active: true, default: false },
] as const;

async function seedAdmin(db: ReturnType<typeof drizzle>) {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@animora.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

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
    return;
  }

  await db.insert(users).values({
    email: adminEmail,
    password: hashedPassword,
    role: 'ADMIN',
    provider: 'LOCAL',
  });
}

async function seedAvatars(db: ReturnType<typeof drizzle>) {
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
      })
      .returning();

    if (avatar.default) defaultAvatarId = created.id;
  }

  if (!defaultAvatarId) return;

  await db
    .update(avatars)
    .set({ default: false })
    .where(and(eq(avatars.default, true), ne(avatars.id, defaultAvatarId)));

  await db
    .update(avatars)
    .set({ default: true })
    .where(eq(avatars.id, defaultAvatarId));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`);
    await seedAdmin(db);
    await seedAvatars(db);
    console.log('Seed completed');
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
