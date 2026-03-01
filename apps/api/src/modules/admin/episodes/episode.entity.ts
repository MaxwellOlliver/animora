import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { playlists } from '../playlists/playlist.entity';

export const episodes = pgTable(
  'episodes',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    playlistId: uuid('playlist_id')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    thumbnailKey: varchar('thumbnail_key', { length: 500 }),
    durationSeconds: integer('duration_seconds'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('episodes_playlist_number_unique').on(t.playlistId, t.number)],
);

export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
