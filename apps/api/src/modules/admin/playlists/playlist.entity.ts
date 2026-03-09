import { sql } from 'drizzle-orm';
import {
  date,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { media } from '@/modules/media/media.entity';

import { series } from '../series/entities/series.entity';

export const playlistTypeEnum = pgEnum('playlist_type', [
  'season',
  'movie',
  'special',
]);

export const playlistStatusEnum = pgEnum('playlist_status', [
  'upcoming',
  'airing',
  'finished',
]);

export const playlists = pgTable(
  'playlists',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    type: playlistTypeEnum('type').notNull().default('season'),
    status: playlistStatusEnum('status'),
    number: integer('number').notNull(),
    title: varchar('title', { length: 255 }),
    studio: varchar('studio', { length: 255 }),
    coverId: uuid('cover_id').references(() => media.id),
    airStartDate: date('air_start_date'),
    airEndDate: date('air_end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('playlists_series_number_unique').on(t.seriesId, t.number)],
);

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
