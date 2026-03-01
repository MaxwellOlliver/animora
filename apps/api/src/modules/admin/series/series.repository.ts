import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { series, Series, NewSeries, SeriesWithDetails } from './series.entity';
import { seriesGenres } from './series-genre.entity';
import { genres } from '../genres/genre.entity';

@Injectable()
export class SeriesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<SeriesWithDetails[]> {
    const all = await this.db.select().from(series);
    if (all.length === 0) return [];

    const genreRows = await this.db
      .select({ seriesId: seriesGenres.seriesId, genre: genres })
      .from(seriesGenres)
      .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(
        inArray(
          seriesGenres.seriesId,
          all.map((s) => s.id),
        ),
      );

    const genresBySeriesId = genreRows.reduce<
      Record<string, (typeof genres.$inferSelect)[]>
    >((acc, row) => {
      if (!acc[row.seriesId]) acc[row.seriesId] = [];
      acc[row.seriesId].push(row.genre);
      return acc;
    }, {});

    return all.map((s) => ({
      ...s,
      genres: genresBySeriesId[s.id] ?? [],
    }));
  }

  async findById(id: string): Promise<SeriesWithDetails | undefined> {
    const result = await this.db.select().from(series).where(eq(series.id, id));
    if (!result[0]) return undefined;

    const genreRows = await this.db
      .select({ genre: genres })
      .from(seriesGenres)
      .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(eq(seriesGenres.seriesId, id));

    return { ...result[0], genres: genreRows.map((r) => r.genre) };
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
