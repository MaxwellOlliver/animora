import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { series } from '../series/entities/series.entity';
import { type Trailer, trailers, type NewTrailer } from './trailer.entity';

export type TrailerWithMedia = Trailer & {
  thumbnail: typeof media.$inferSelect | null;
};

export type TrailerWithContext = TrailerWithMedia & {
  seriesName: string;
};

@Injectable()
export class TrailersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<TrailerWithContext[]> {
    const rows = await this.db
      .select({
        trailer: trailers,
        thumbnail: media,
        seriesName: series.name,
      })
      .from(trailers)
      .leftJoin(media, eq(trailers.thumbnailId, media.id))
      .innerJoin(series, eq(trailers.seriesId, series.id))
      .orderBy(desc(trailers.createdAt));
    return rows.map((r) => ({
      ...r.trailer,
      thumbnail: r.thumbnail,
      seriesName: r.seriesName,
    }));
  }

  async findBySeriesId(seriesId: string): Promise<TrailerWithMedia[]> {
    const rows = await this.db
      .select({ trailer: trailers, thumbnail: media })
      .from(trailers)
      .leftJoin(media, eq(trailers.thumbnailId, media.id))
      .where(eq(trailers.seriesId, seriesId))
      .orderBy(asc(trailers.number));
    return rows.map((r) => ({ ...r.trailer, thumbnail: r.thumbnail }));
  }

  async findById(id: string): Promise<TrailerWithMedia | undefined> {
    const rows = await this.db
      .select({ trailer: trailers, thumbnail: media })
      .from(trailers)
      .leftJoin(media, eq(trailers.thumbnailId, media.id))
      .where(eq(trailers.id, id));
    if (!rows[0]) return undefined;
    return { ...rows[0].trailer, thumbnail: rows[0].thumbnail };
  }

  async findBySeriesIdAndNumber(
    seriesId: string,
    number: number,
  ): Promise<Trailer | undefined> {
    const [row] = await this.db
      .select()
      .from(trailers)
      .where(
        and(eq(trailers.seriesId, seriesId), eq(trailers.number, number)),
      )
      .limit(1);
    return row;
  }

  async create(data: NewTrailer): Promise<Trailer> {
    const result = await this.db.insert(trailers).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewTrailer>): Promise<Trailer> {
    const result = await this.db
      .update(trailers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trailers.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(trailers).where(eq(trailers.id, id));
  }
}
