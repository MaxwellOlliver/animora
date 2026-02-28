import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const avatars = pgTable('avatars', {
  id: uuid('id').default(sql`uuid_generate_v7()`).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  active: boolean('active').notNull().default(true),
  default: boolean('default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Avatar = typeof avatars.$inferSelect;
export type NewAvatar = typeof avatars.$inferInsert;
