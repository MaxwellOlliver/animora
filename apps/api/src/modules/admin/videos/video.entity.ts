import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { episodes } from '../episodes/episode.entity';

export const videoStatusEnum = pgEnum('video_status', [
  'pending',
  'processing',
  'ready',
  'failed',
]);

export const videos = pgTable('videos', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  episodeId: uuid('episode_id')
    .notNull()
    .unique()
    .references(() => episodes.id, { onDelete: 'cascade' }),
  status: videoStatusEnum('status').notNull().default('pending'),
  rawObjectKey: varchar('raw_object_key', { length: 500 }),
  masterPlaylistKey: varchar('master_playlist_key', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
