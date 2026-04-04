import { sql } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { episodes } from '@/modules/admin/episodes/episode.entity';
import { profiles } from '@/modules/profiles/profile.entity';

export const episodeRatingValueEnum = pgEnum('episode_rating_value', [
  'like',
  'dislike',
]);

export const episodeRatings = pgTable(
  'episode_ratings',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    episodeId: uuid('episode_id')
      .notNull()
      .references(() => episodes.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    value: episodeRatingValueEnum('value').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    unique('episode_ratings_episode_profile_unique').on(
      t.episodeId,
      t.profileId,
    ),
    index('episode_ratings_episode_idx').on(t.episodeId),
    index('episode_ratings_profile_idx').on(t.profileId),
  ],
);

export type EpisodeRating = typeof episodeRatings.$inferSelect;
export type NewEpisodeRating = typeof episodeRatings.$inferInsert;
