import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../users/user.entity.js';
import { avatars } from '../admin/avatars/avatar.entity.js';

export const profiles = pgTable('profiles', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarId: uuid('avatar_id')
    .references(() => avatars.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
