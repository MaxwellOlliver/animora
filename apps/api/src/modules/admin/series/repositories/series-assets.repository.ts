import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import {
  type NewSeriesAsset,
  type SeriesAsset,
  seriesAssets,
} from './series-asset.entity';

export type SeriesAssetWithMedia = SeriesAsset & {
  media: typeof media.$inferSelect;
};

@Injectable()
export class SeriesAssetsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findBySeriesId(seriesId: string): Promise<SeriesAssetWithMedia[]> {
    const rows = await this.db
      .select({ asset: seriesAssets, media: media })
      .from(seriesAssets)
      .innerJoin(media, eq(seriesAssets.mediaId, media.id))
      .where(eq(seriesAssets.seriesId, seriesId));

    return rows.map((r) => ({ ...r.asset, media: r.media }));
  }

  async findBySeriesIds(
    seriesIds: string[],
  ): Promise<SeriesAssetWithMedia[]> {
    if (seriesIds.length === 0) return [];

    const rows = await this.db
      .select({ asset: seriesAssets, media: media })
      .from(seriesAssets)
      .innerJoin(media, eq(seriesAssets.mediaId, media.id))
      .where(inArray(seriesAssets.seriesId, seriesIds));

    return rows.map((r) => ({ ...r.asset, media: r.media }));
  }

  async upsert(data: NewSeriesAsset): Promise<SeriesAsset> {
    const result = await this.db
      .insert(seriesAssets)
      .values(data)
      .onConflictDoUpdate({
        target: [seriesAssets.seriesId, seriesAssets.purpose],
        set: { mediaId: data.mediaId },
      })
      .returning();
    return result[0];
  }

  async deleteBySeriesIdAndPurpose(
    seriesId: string,
    purpose: string,
  ): Promise<void> {
    await this.db
      .delete(seriesAssets)
      .where(
        and(
          eq(seriesAssets.seriesId, seriesId),
          eq(seriesAssets.purpose, purpose as any),
        ),
      );
  }
}
