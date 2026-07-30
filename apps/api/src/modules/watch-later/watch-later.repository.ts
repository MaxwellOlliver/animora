import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, lt } from 'drizzle-orm';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { genres } from '@/modules/admin/genres/genre.entity';
import { series } from '@/modules/admin/series/entities/series.entity';
import { seriesAssets } from '@/modules/admin/series/entities/series-asset.entity';
import { seriesGenres } from '@/modules/admin/series/entities/series-genre.entity';
import { media } from '@/modules/media/media.entity';

import { watchLater } from './watch-later.entity';

type WatchLaterGenre = { id: string; name: string };
type WatchLaterAsset = {
  id: string;
  seriesId: string;
  mediaId: string;
  purpose: string;
  media: { id: string; key: string; purpose: string; mimeType: string };
};

export type WatchLaterSeries = {
  id: string;
  name: string;
  synopsis: string;
  bannerId: string | null;
  contentClassificationId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  genres: WatchLaterGenre[];
  assets: WatchLaterAsset[];
};

const seriesColumns = {
  id: series.id,
  name: series.name,
  synopsis: series.synopsis,
  bannerId: series.bannerId,
  contentClassificationId: series.contentClassificationId,
  active: series.active,
  createdAt: series.createdAt,
  updatedAt: series.updatedAt,
};

@Injectable()
export class WatchLaterRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async mark(profileId: string, seriesId: string): Promise<void> {
    await this.db
      .insert(watchLater)
      .values({ profileId, seriesId })
      .onConflictDoNothing();
  }

  async unmark(profileId: string, seriesId: string): Promise<void> {
    await this.db
      .delete(watchLater)
      .where(
        and(
          eq(watchLater.profileId, profileId),
          eq(watchLater.seriesId, seriesId),
        ),
      );
  }

  async isMarked(profileId: string, seriesId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: watchLater.id })
      .from(watchLater)
      .where(
        and(
          eq(watchLater.profileId, profileId),
          eq(watchLater.seriesId, seriesId),
        ),
      );
    return rows.length > 0;
  }

  async findByProfileCursor(
    profileId: string,
    { cursor, limit = 20 }: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<WatchLaterSeries>> {
    const baseCondition = and(
      eq(watchLater.profileId, profileId),
      eq(series.active, true),
    );
    const conditions = cursor
      ? and(baseCondition, lt(watchLater.createdAt, new Date(cursor)))
      : baseCondition;

    const rows = await this.db
      .select({ watchLater, series: seriesColumns })
      .from(watchLater)
      .innerJoin(series, eq(watchLater.seriesId, series.id))
      .where(conditions)
      .orderBy(desc(watchLater.createdAt))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    if (items.length === 0) return { items: [], nextCursor: null };

    const seriesIds = items.map((r) => r.series.id);
    const { genresBySeriesId, assetsBySeriesId } =
      await this.loadGenresAndAssets(seriesIds);

    return {
      items: items.map((r) => ({
        ...r.series,
        genres: genresBySeriesId[r.series.id] ?? [],
        assets: assetsBySeriesId[r.series.id] ?? [],
      })),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.watchLater.createdAt.toISOString() ?? null)
        : null,
    };
  }

  private async loadGenresAndAssets(seriesIds: string[]): Promise<{
    genresBySeriesId: Record<string, WatchLaterGenre[]>;
    assetsBySeriesId: Record<string, WatchLaterAsset[]>;
  }> {
    const [genreRows, assetRows] = await Promise.all([
      this.db
        .select({ seriesId: seriesGenres.seriesId, genre: genres })
        .from(seriesGenres)
        .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
        .where(inArray(seriesGenres.seriesId, seriesIds)),
      this.db
        .select({ asset: seriesAssets, media })
        .from(seriesAssets)
        .innerJoin(media, eq(seriesAssets.mediaId, media.id))
        .where(inArray(seriesAssets.seriesId, seriesIds)),
    ]);

    const genresBySeriesId = genreRows.reduce<
      Record<string, WatchLaterGenre[]>
    >((acc, row) => {
      if (!acc[row.seriesId]) acc[row.seriesId] = [];
      acc[row.seriesId].push(row.genre);
      return acc;
    }, {});

    const assetsBySeriesId = assetRows.reduce<
      Record<string, WatchLaterAsset[]>
    >((acc, row) => {
      if (!acc[row.asset.seriesId]) acc[row.asset.seriesId] = [];
      acc[row.asset.seriesId].push({ ...row.asset, media: row.media });
      return acc;
    }, {});

    return { genresBySeriesId, assetsBySeriesId };
  }
}
