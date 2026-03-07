import { sql } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const media = pgTable('media', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  key: varchar('key', { length: 255 }).notNull(),
  purpose: varchar('purpose', { length: 100 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
