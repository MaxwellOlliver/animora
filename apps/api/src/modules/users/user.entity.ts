import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const authProviderEnum = pgEnum('auth_provider', ['LOCAL', 'GOOGLE']);

export const users = pgTable('users', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: roleEnum('role').notNull().default('USER'),
  provider: authProviderEnum('provider').notNull().default('LOCAL'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
