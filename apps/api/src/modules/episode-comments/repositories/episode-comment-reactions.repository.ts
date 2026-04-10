import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import {
  type EpisodeCommentReaction,
  episodeCommentReactions,
  type NewEpisodeCommentReaction,
} from '../entities/episode-comment-reaction.entity';

@Injectable()
export class EpisodeCommentReactionsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(
    data: NewEpisodeCommentReaction,
  ): Promise<EpisodeCommentReaction> {
    const result = await this.db
      .insert(episodeCommentReactions)
      .values(data)
      .onConflictDoUpdate({
        target: [
          episodeCommentReactions.commentId,
          episodeCommentReactions.profileId,
        ],
        set: {
          value: sql`excluded.value`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  }

  async delete(profileId: string, commentId: string): Promise<void> {
    await this.db
      .delete(episodeCommentReactions)
      .where(
        and(
          eq(episodeCommentReactions.profileId, profileId),
          eq(episodeCommentReactions.commentId, commentId),
        ),
      );
  }
}
