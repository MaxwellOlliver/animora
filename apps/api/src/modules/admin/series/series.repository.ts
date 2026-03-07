import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, inArray, lt } from 'drizzle-orm';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { genres } from '../genres/genre.entity';
import {
  type NewSeries,
  type Series,
  series,
  type SeriesWithDetails,
} from './series.entity';
import { seriesGenres } from './series-genre.entity';

export type SeriesWithMedia = Series & {
  banner: typeof media.$inferSelect | null;
};
export type SeriesWithDetailsAndMedia = SeriesWithDetails & {
  banner: typeof media.$inferSelect | null;
};

@Injectable()
export class SeriesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllCursor({
    cursor,
    limit = 20,
  }: CursorPaginatedRequest): Promise<
    CursorPaginatedResponse<SeriesWithDetailsAndMedia>
  > {
    const query = this.db
      .select({ series: series, banner: media })
      .from(series)
      .leftJoin(media, eq(series.bannerId, media.id))
      .orderBy(desc(series.id))
      .limit(limit + 1);

    const rows = cursor
      ? await query.where(lt(series.id, cursor))
      : await query;

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    if (items.length === 0) return { items: [], nextCursor: null };

    const genreRows = await this.db
      .select({ seriesId: seriesGenres.seriesId, genre: genres })
      .from(seriesGenres)
      .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(
        inArray(
          seriesGenres.seriesId,
          items.map((s) => s.series.id),
        ),
      );

    const genresBySeriesId = genreRows.reduce<
      Record<string, (typeof genres.$inferSelect)[]>
    >((acc, row) => {
      if (!acc[row.seriesId]) acc[row.seriesId] = [];
      acc[row.seriesId].push(row.genre);
      return acc;
    }, {});

    return {
      items: items.map((s) => ({
        ...s.series,
        banner: s.banner,
        genres: genresBySeriesId[s.series.id] ?? [],
      })),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.series.id ?? null)
        : null,
    };
  }

  async findById(id: string): Promise<SeriesWithDetailsAndMedia | undefined> {
    const rows = await this.db
      .select({ series: series, banner: media })
      .from(series)
      .leftJoin(media, eq(series.bannerId, media.id))
      .where(eq(series.id, id));
    if (!rows[0]) return undefined;

    const genreRows = await this.db
      .select({ genre: genres })
      .from(seriesGenres)
      .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(eq(seriesGenres.seriesId, id));

    return {
      ...rows[0].series,
      banner: rows[0].banner,
      genres: genreRows.map((r) => r.genre),
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
