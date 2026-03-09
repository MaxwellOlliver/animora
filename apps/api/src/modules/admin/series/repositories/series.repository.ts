import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, inArray, lt } from 'drizzle-orm';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import { genres } from '../../genres/genre.entity';
import {
  type NewSeries,
  type Series,
  series,
  type SeriesWithDetails,
} from '../entities/series.entity';
import type { SeriesAssetWithMedia } from './series-assets.repository';
import { SeriesAssetsRepository } from './series-assets.repository';
import { seriesGenres } from '../entities/series-genre.entity';

export type SeriesWithDetailsAndMedia = SeriesWithDetails & {
  assets: SeriesAssetWithMedia[];
};

@Injectable()
export class SeriesRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly seriesAssetsRepository: SeriesAssetsRepository,
  ) {}

  async findAllCursor({
    cursor,
    limit = 20,
  }: CursorPaginatedRequest): Promise<
    CursorPaginatedResponse<SeriesWithDetailsAndMedia>
  > {
    const query = this.db
      .select()
      .from(series)
      .orderBy(desc(series.id))
      .limit(limit + 1);

    const rows = cursor
      ? await query.where(lt(series.id, cursor))
      : await query;

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    if (items.length === 0) return { items: [], nextCursor: null };

    const seriesIds = items.map((s) => s.id);

    const [genreRows, allAssets] = await Promise.all([
      this.db
        .select({ seriesId: seriesGenres.seriesId, genre: genres })
        .from(seriesGenres)
        .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
        .where(inArray(seriesGenres.seriesId, seriesIds)),
      this.seriesAssetsRepository.findBySeriesIds(seriesIds),
    ]);

    const genresBySeriesId = genreRows.reduce<
      Record<string, (typeof genres.$inferSelect)[]>
    >((acc, row) => {
      if (!acc[row.seriesId]) acc[row.seriesId] = [];
      acc[row.seriesId].push(row.genre);
      return acc;
    }, {});

    const assetsBySeriesId = allAssets.reduce<
      Record<string, SeriesAssetWithMedia[]>
    >((acc, asset) => {
      if (!acc[asset.seriesId]) acc[asset.seriesId] = [];
      acc[asset.seriesId].push(asset);
      return acc;
    }, {});

    return {
      items: items.map((s) => ({
        ...s,
        genres: genresBySeriesId[s.id] ?? [],
        assets: assetsBySeriesId[s.id] ?? [],
      })),
      nextCursor: hasNextPage ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  async findById(id: string): Promise<SeriesWithDetailsAndMedia | undefined> {
    const rows = await this.db.select().from(series).where(eq(series.id, id));
    if (!rows[0]) return undefined;

    const [genreRows, assets] = await Promise.all([
      this.db
        .select({ genre: genres })
        .from(seriesGenres)
        .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
        .where(eq(seriesGenres.seriesId, id)),
      this.seriesAssetsRepository.findBySeriesId(id),
    ]);

    return {
      ...rows[0],
      genres: genreRows.map((r) => r.genre),
      assets,
    };
  }

  async create(data: NewSeries): Promise<Series> {
    const result = await this.db.insert(series).values(data).returning();
    return result[0];
  }

  async setGenres(seriesId: string, genreIds: string[]): Promise<void> {
    await this.db
      .delete(seriesGenres)
      .where(eq(seriesGenres.seriesId, seriesId));
    if (genreIds.length > 0) {
      await this.db
        .insert(seriesGenres)
        .values(genreIds.map((genreId) => ({ seriesId, genreId })));
    }
  }

  async update(id: string, data: Partial<NewSeries>): Promise<Series> {
    const result = await this.db
      .update(series)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(series.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(series).where(eq(series.id, id));
  }
}
