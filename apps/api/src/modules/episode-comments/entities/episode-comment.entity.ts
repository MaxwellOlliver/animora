import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { episodes } from '@/modules/admin/episodes/episode.entity';
import { profiles } from '@/modules/profiles/profile.entity';

export const episodeComments = pgTable(
  'episode_comments',
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
    parentId: uuid('parent_id'),
    replyToId: uuid('reply_to_id'),
    text: text('text').notNull(),
    spoiler: boolean('spoiler').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('episode_comments_episode_created_at_idx').on(
      t.episodeId,
      t.createdAt,
    ),
    index('episode_comments_parent_created_at_idx').on(
      t.parentId,
      t.createdAt,
    ),
  ],
);

export type EpisodeComment = typeof episodeComments.$inferSelect;
export type NewEpisodeComment = typeof episodeComments.$inferInsert;
