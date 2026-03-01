import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { contentClassifications } from '../content-classifications/content-classification.entity';
import type { Genre } from '../genres/genre.entity';

export const series = pgTable('series', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  synopsis: text('synopsis').notNull(),
  bannerKey: varchar('banner_key', { length: 500 }),
  contentClassificationId: uuid('content_classification_id')
    .notNull()
    .references(() => contentClassifications.id),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type SeriesWithDetails = Series & { genres: Genre[] };
