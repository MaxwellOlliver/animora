import { sql } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from '@/modules/profiles/profile.entity';

import { episodeComments } from './episode-comment.entity';

export const episodeCommentReactionValueEnum = pgEnum(
  'episode_comment_reaction_value',
  ['like', 'dislike'],
);

export const episodeCommentReactions = pgTable(
  'episode_comment_reactions',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => episodeComments.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    value: episodeCommentReactionValueEnum('value').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    unique('episode_comment_reactions_comment_profile_unique').on(
      t.commentId,
      t.profileId,
    ),
    index('episode_comment_reactions_comment_idx').on(t.commentId),
    index('episode_comment_reactions_profile_idx').on(t.profileId),
  ],
);

export type EpisodeCommentReaction =
  typeof episodeCommentReactions.$inferSelect;
export type NewEpisodeCommentReaction =
  typeof episodeCommentReactions.$inferInsert;
