import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import {
  type EpisodeTimestamp,
  episodeTimestamps,
  type EpisodeTimestampType,
} from './episode-timestamp.entity';

export type TimestampSegment = {
  type: EpisodeTimestampType;
  startSeconds: number;
  endSeconds: number;
};

@Injectable()
export class EpisodeTimestampsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByEpisodeId(episodeId: string): Promise<EpisodeTimestamp[]> {
    return this.db
      .select()
      .from(episodeTimestamps)
      .where(eq(episodeTimestamps.episodeId, episodeId));
  }

  async setForEpisode(
    episodeId: string,
    segments: TimestampSegment[],
  ): Promise<EpisodeTimestamp[]> {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(episodeTimestamps)
        .where(eq(episodeTimestamps.episodeId, episodeId));

      if (segments.length === 0) return [];

      return tx
        .insert(episodeTimestamps)
        .values(segments.map((segment) => ({ episodeId, ...segment })))
        .returning();
    });
  }
}
