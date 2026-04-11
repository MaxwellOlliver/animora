import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import {
  EpisodeRating,
  episodeRatings,
  NewEpisodeRating,
} from './episode-rating.entity';

export type EpisodeRatingSummary = {
  likes: number;
  dislikes: number;
  myRating: 'like' | 'dislike' | null;
};

@Injectable()
export class EpisodeRatingsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(data: NewEpisodeRating): Promise<EpisodeRating> {
    const result = await this.db
      .insert(episodeRatings)
      .values(data)
      .onConflictDoUpdate({
        target: [episodeRatings.episodeId, episodeRatings.profileId],
        set: {
          value: sql`excluded.value`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  }

  async delete(profileId: string, episodeId: string): Promise<void> {
    await this.db
      .delete(episodeRatings)
      .where(
        and(
          eq(episodeRatings.profileId, profileId),
          eq(episodeRatings.episodeId, episodeId),
        ),
      );
  }

  async findByEpisodeAndProfile(
    episodeId: string,
    profileId: string,
  ): Promise<EpisodeRating | undefined> {
    const result = await this.db
      .select()
      .from(episodeRatings)
      .where(
        and(
          eq(episodeRatings.episodeId, episodeId),
          eq(episodeRatings.profileId, profileId),
        ),
      );

    return result[0];
  }

  async getSummary(
    episodeId: string,
    profileId?: string,
  ): Promise<EpisodeRatingSummary> {
    const [counts, myRating] = await Promise.all([
      this.db
        .select({
          likes: sql<number>`coalesce(sum(case when ${episodeRatings.value} = 'like' then 1 else 0 end), 0)::int`,
          dislikes: sql<number>`coalesce(sum(case when ${episodeRatings.value} = 'dislike' then 1 else 0 end), 0)::int`,
        })
        .from(episodeRatings)
        .where(eq(episodeRatings.episodeId, episodeId)),
      profileId
        ? this.findByEpisodeAndProfile(episodeId, profileId)
        : Promise.resolve(undefined),
    ]);

    return {
      likes: counts[0]?.likes ?? 0,
      dislikes: counts[0]?.dislikes ?? 0,
      myRating: myRating?.value ?? null,
    };
  }
}
