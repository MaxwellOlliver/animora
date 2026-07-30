import { sql } from 'drizzle-orm';
import { integer, pgEnum, pgTable, unique, uuid } from 'drizzle-orm/pg-core';

import { episodes } from '../admin/episodes/episode.entity';

export const EPISODE_TIMESTAMP_TYPES = [
  'recap',
  'opening',
  'post_credit',
  'ending',
] as const;

export type EpisodeTimestampType = (typeof EPISODE_TIMESTAMP_TYPES)[number];

export const episodeTimestampTypeEnum = pgEnum('episode_timestamp_type', [
  'recap',
  'opening',
  'post_credit',
  'ending',
]);

export const episodeTimestamps = pgTable(
  'episode_timestamps',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    episodeId: uuid('episode_id')
      .notNull()
      .references(() => episodes.id, { onDelete: 'cascade' }),
    type: episodeTimestampTypeEnum('type').notNull(),
    startSeconds: integer('start_seconds').notNull(),
    endSeconds: integer('end_seconds').notNull(),
  },
  (t) => [
    unique('episode_timestamps_episode_type_unique').on(t.episodeId, t.type),
  ],
);

export type EpisodeTimestamp = typeof episodeTimestamps.$inferSelect;
export type NewEpisodeTimestamp = typeof episodeTimestamps.$inferInsert;
