import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, exists, inArray, lt, or, sql } from 'drizzle-orm';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import { genres } from '../../genres/genre.entity';
import {
  type NewSeries,
  type PublicSeries,
  series,
  type SeriesWithDetails,
} from '../entities/series.entity';
import { seriesGenres } from '../entities/series-genre.entity';
import type { SeriesAssetWithMedia } from './series-assets.repository';
import { SeriesAssetsRepository } from './series-assets.repository';

export type SeriesWithDetailsAndMedia = SeriesWithDetails & {
  assets: SeriesAssetWithMedia[];
};

export type ExploreSeriesFilters = {
  q?: string;
  genreIds?: string[];
  classificationIds?: string[];
  cursor?: string;
  limit?: number;
};

type ExploreCursor = { id: string; rank: number | null };

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
export class SeriesRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly seriesAssetsRepository: SeriesAssetsRepository,
  ) {}

  async findAllCursor({
    cursor,
    limit = 20,
    activeOnly = false,
  }: CursorPaginatedRequest & { activeOnly?: boolean }): Promise<
    CursorPaginatedResponse<SeriesWithDetailsAndMedia>
  > {
    const query = this.db
      .select(seriesColumns)
      .from(series)
      .orderBy(desc(series.id))
      .limit(limit + 1);

    const conditions = [
      ...(cursor ? [lt(series.id, cursor)] : []),
      ...(activeOnly ? [eq(series.active, true)] : []),
    ];

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    if (items.length === 0) return { items: [], nextCursor: null };

    const { genresBySeriesId, assetsBySeriesId } =
      await this.loadGenresAndAssets(items.map((s) => s.id));

    return {
      items: items.map((s) => ({
        ...s,
        genres: genresBySeriesId[s.id] ?? [],
        assets: assetsBySeriesId[s.id] ?? [],
      })),
      nextCursor: hasNextPage ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  async exploreCursor({
    q,
    genreIds = [],
    classificationIds = [],
    cursor,
    limit = 20,
  }: ExploreSeriesFilters): Promise<
    CursorPaginatedResponse<SeriesWithDetailsAndMedia>
  > {
    const decodedCursor = cursor ? this.decodeExploreCursor(cursor) : null;
    const tsQuery = q ? this.toPrefixTsQuery(q) : undefined;

    const rankExpr = (
      tsQuery
        ? sql<number>`ts_rank_cd(${series.searchVector}, to_tsquery('simple', ${tsQuery}))`
        : sql<number>`0`
    ).as('rank');

    const filtered = this.db.$with('filtered_series').as(
      this.db
        .select({ id: series.id, rank: rankExpr })
        .from(series)
        .where(
          and(
            tsQuery
              ? sql`${series.searchVector} @@ to_tsquery('simple', ${tsQuery})`
              : undefined,
            classificationIds.length > 0
              ? inArray(series.contentClassificationId, classificationIds)
              : undefined,
            genreIds.length > 0
              ? exists(
                  this.db
                    .select({ one: sql`1` })
                    .from(seriesGenres)
                    .where(
                      and(
                        eq(seriesGenres.seriesId, series.id),
                        inArray(seriesGenres.genreId, genreIds),
                      ),
                    ),
                )
              : undefined,
          ),
        ),
    );

    const cursorCondition = decodedCursor
      ? tsQuery
        ? or(
            lt(filtered.rank, decodedCursor.rank ?? 0),
            and(
              eq(filtered.rank, decodedCursor.rank ?? 0),
              lt(filtered.id, decodedCursor.id),
            ),
          )
        : lt(filtered.id, decodedCursor.id)
      : undefined;

    const rows = await this.db
      .with(filtered)
      .select({ id: filtered.id, rank: filtered.rank })
      .from(filtered)
      .where(cursorCondition)
      .orderBy(...(tsQuery ? [desc(filtered.rank)] : []), desc(filtered.id))
      .limit(limit + 1);

    const page = rows.map((r) => ({ id: r.id, rank: Number(r.rank) }));
    const hasNextPage = page.length > limit;
    const pageItems = hasNextPage ? page.slice(0, limit) : page;
    if (pageItems.length === 0) return { items: [], nextCursor: null };

    const seriesIds = pageItems.map((r) => r.id);
    const [seriesRows, { genresBySeriesId, assetsBySeriesId }] =
      await Promise.all([
        this.db
          .select(seriesColumns)
          .from(series)
          .where(inArray(series.id, seriesIds)),
        this.loadGenresAndAssets(seriesIds),
      ]);

    const seriesById = new Map(seriesRows.map((s) => [s.id, s]));

    const items = pageItems
      .map((r) => seriesById.get(r.id))
      .filter((s): s is PublicSeries => s !== undefined)
      .map((s) => ({
        ...s,
        genres: genresBySeriesId[s.id] ?? [],
        assets: assetsBySeriesId[s.id] ?? [],
      }));

    const last = pageItems[pageItems.length - 1];
    const nextCursor = hasNextPage
      ? this.encodeExploreCursor(last.id, tsQuery ? last.rank : null)
      : null;

    return { items, nextCursor };
  }

  private async loadGenresAndAssets(seriesIds: string[]): Promise<{
    genresBySeriesId: Record<string, (typeof genres.$inferSelect)[]>;
    assetsBySeriesId: Record<string, SeriesAssetWithMedia[]>;
  }> {
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

    return { genresBySeriesId, assetsBySeriesId };
  }

  private toPrefixTsQuery(q: string): string | undefined {
    const terms = q
      .split(/\s+/)
      .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
      .filter((word) => word.length > 0)
      .map((word) => `${word}:*`);

    return terms.length > 0 ? terms.join(' & ') : undefined;
  }

  private encodeExploreCursor(id: string, rank: number | null): string {
    return Buffer.from(JSON.stringify({ id, rank })).toString('base64url');
  }

  private decodeExploreCursor(cursor: string): ExploreCursor {
    try {
      const parsed: unknown = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      );
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof (parsed as { id?: unknown }).id !== 'string'
      ) {
        throw new Error('malformed explore cursor');
      }
      const { id, rank } = parsed as { id: string; rank?: unknown };
      return { id, rank: typeof rank === 'number' ? rank : null };
    } catch {
      throw new BadRequestException(
        'The pagination cursor is invalid or expired.',
      );
    }
  }

  async findById(
    id: string,
    activeOnly = false,
  ): Promise<SeriesWithDetailsAndMedia | undefined> {
    const conditions = activeOnly
      ? and(eq(series.id, id), eq(series.active, true))
      : eq(series.id, id);
    const rows = await this.db
      .select(seriesColumns)
      .from(series)
      .where(conditions);
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

  async create(data: NewSeries): Promise<PublicSeries> {
    const result = await this.db
      .insert(series)
      .values(data)
      .returning(seriesColumns);
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

  async update(id: string, data: Partial<NewSeries>): Promise<PublicSeries> {
    const result = await this.db
      .update(series)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(series.id, id))
      .returning(seriesColumns);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(series).where(eq(series.id, id));
  }
}
