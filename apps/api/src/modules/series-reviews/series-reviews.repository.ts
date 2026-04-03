import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt, sql } from 'drizzle-orm';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { media } from '@/modules/media/media.entity';
import { profiles } from '@/modules/profiles/profile.entity';

import {
  NewSeriesReview,
  SeriesReview,
  seriesReviews,
} from './series-review.entity';

export type SeriesReviewWithProfile = SeriesReview & {
  profile: {
    id: string;
    name: string;
    avatar: { key: string; purpose: string } | null;
  };
};

@Injectable()
export class SeriesReviewsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: NewSeriesReview): Promise<SeriesReview> {
    const result = await this.db
      .insert(seriesReviews)
      .values(data)
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: { rating?: number; text?: string },
  ): Promise<SeriesReview> {
    const result = await this.db
      .update(seriesReviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(seriesReviews.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(seriesReviews).where(eq(seriesReviews.id, id));
  }

  async findBySeriesAndProfile(
    seriesId: string,
    profileId: string,
  ): Promise<SeriesReviewWithProfile | undefined> {
    const rows = await this.db
      .select({
        review: seriesReviews,
        profileId: profiles.id,
        profileName: profiles.name,
        avatarKey: media.key,
        avatarPurpose: media.purpose,
      })
      .from(seriesReviews)
      .innerJoin(profiles, eq(seriesReviews.profileId, profiles.id))
      .leftJoin(avatars, eq(profiles.avatarId, avatars.id))
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .where(
        and(
          eq(seriesReviews.seriesId, seriesId),
          eq(seriesReviews.profileId, profileId),
        ),
      );

    if (!rows[0]) return undefined;
    return this.mapRow(rows[0]);
  }

  async findBySeriesCursor(
    seriesId: string,
    { cursor, limit = 20 }: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<SeriesReviewWithProfile>> {
    const baseCondition = eq(seriesReviews.seriesId, seriesId);
    const conditions = cursor
      ? and(baseCondition, lt(seriesReviews.createdAt, new Date(cursor)))
      : baseCondition;

    const rows = await this.db
      .select({
        review: seriesReviews,
        profileId: profiles.id,
        profileName: profiles.name,
        avatarKey: media.key,
        avatarPurpose: media.purpose,
      })
      .from(seriesReviews)
      .innerJoin(profiles, eq(seriesReviews.profileId, profiles.id))
      .leftJoin(avatars, eq(profiles.avatarId, avatars.id))
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .where(conditions)
      .orderBy(desc(seriesReviews.createdAt))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => this.mapRow(row)),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.review.createdAt.toISOString() ?? null)
        : null,
    };
  }

  async getAverageRating(
    seriesId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.db
      .select({
        average: sql<number>`coalesce(avg(${seriesReviews.rating}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(seriesReviews)
      .where(eq(seriesReviews.seriesId, seriesId));

    return {
      average: Number(result[0].average),
      count: result[0].count,
    };
  }

  private mapRow(row: {
    review: SeriesReview;
    profileId: string;
    profileName: string;
    avatarKey: string | null;
    avatarPurpose: string | null;
  }): SeriesReviewWithProfile {
    return {
      ...row.review,
      profile: {
        id: row.profileId,
        name: row.profileName,
        avatar:
          row.avatarKey && row.avatarPurpose
            ? { key: row.avatarKey, purpose: row.avatarPurpose }
            : null,
      },
    };
  }
}
