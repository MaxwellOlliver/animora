import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { series } from '../admin/series/entities/series.entity';
import { profiles } from '../profiles/profile.entity';

export const seriesReviews = pgTable(
  'series_reviews',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    text: text('text').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    unique('series_reviews_series_profile_unique').on(t.seriesId, t.profileId),
    index('series_reviews_series_created_at_idx').on(t.seriesId, t.createdAt),
  ],
);

export type SeriesReview = typeof seriesReviews.$inferSelect;
export type NewSeriesReview = typeof seriesReviews.$inferInsert;
