import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { episodes } from '../admin/episodes/episode.entity';
import { profiles } from '../profiles/profile.entity';

export const watchStatusEnum = pgEnum('watch_status', ['watching', 'finished']);

export const watchHistory = pgTable(
  'watch_history',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    episodeId: uuid('episode_id')
      .notNull()
      .references(() => episodes.id, { onDelete: 'cascade' }),
    positionSeconds: integer('position_seconds').notNull().default(0),
    status: watchStatusEnum('status').notNull().default('watching'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    unique('watch_history_profile_episode_unique').on(t.profileId, t.episodeId),
    index('watch_history_profile_updated_at_idx').on(t.profileId, t.updatedAt),
  ],
);

export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
