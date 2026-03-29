import { sql } from 'drizzle-orm';
import {
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { media } from '@/modules/media/media.entity';

import { playlists } from '../playlists/playlist.entity';
import { series } from '../series/entities/series.entity';

export const trailers = pgTable(
  'trailers',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    playlistId: uuid('playlist_id').references(() => playlists.id, {
      onDelete: 'set null',
    }),
    number: integer('number').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    thumbnailId: uuid('thumbnail_id').references(() => media.id),
    durationSeconds: integer('duration_seconds').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('trailers_series_number_unique').on(t.seriesId, t.number)],
);

export type Trailer = typeof trailers.$inferSelect;
export type NewTrailer = typeof trailers.$inferInsert;
