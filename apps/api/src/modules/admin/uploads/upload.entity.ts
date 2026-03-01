import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { videos } from '../videos/video.entity';
import { episodes } from '../episodes/episode.entity';

export const uploads = pgTable('uploads', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  videoId: uuid('video_id')
    .notNull()
    .references(() => videos.id, { onDelete: 'cascade' }),
  episodeId: uuid('episode_id')
    .notNull()
    .references(() => episodes.id),
  totalChunks: integer('total_chunks').notNull(),
  receivedChunks: integer('received_chunks').notNull().default(0),
  expiresAt: timestamp('expires_at').notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
