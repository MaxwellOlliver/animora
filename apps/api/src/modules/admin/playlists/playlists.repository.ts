import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNotNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { series } from '../series/entities/series.entity';
import { seriesAssets } from '../series/entities/series-asset.entity';
import { type NewPlaylist, type Playlist, playlists } from './playlist.entity';

export type PlaylistWithMedia = Playlist & {
  cover: typeof media.$inferSelect | null;
};

export type PlaylistWithMediaAndSeries = PlaylistWithMedia & {
  seriesName: string;
};

export type AiringReleaseSchedule = {
  playlistId: string;
  playlistNumber: number;
  releaseWeekday: number;
  releaseTime: string | null;
  seriesId: string;
  seriesName: string;
  seriesBanner: typeof media.$inferSelect | null;
  seriesPoster: typeof media.$inferSelect | null;
};

const posterMedia = alias(media, 'schedule_poster_media');
const posterAssets = alias(seriesAssets, 'schedule_poster_assets');
const bannerMedia = alias(media, 'schedule_banner_media');
const bannerAssets = alias(seriesAssets, 'schedule_banner_assets');

@Injectable()
export class PlaylistsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<PlaylistWithMediaAndSeries[]> {
    const rows = await this.db
      .select({ playlist: playlists, cover: media, seriesName: series.name })
      .from(playlists)
      .leftJoin(media, eq(playlists.coverId, media.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .orderBy(desc(playlists.createdAt));
    return rows.map((r) => ({
      ...r.playlist,
      cover: r.cover,
      seriesName: r.seriesName,
    }));
  }

  async findBySeriesId(seriesId: string): Promise<PlaylistWithMedia[]> {
    const rows = await this.db
      .select({ playlist: playlists, cover: media })
      .from(playlists)
      .leftJoin(media, eq(playlists.coverId, media.id))
      .where(eq(playlists.seriesId, seriesId))
      .orderBy(asc(playlists.number));
    return rows.map((r) => ({ ...r.playlist, cover: r.cover }));
  }

  async findById(id: string): Promise<PlaylistWithMedia | undefined> {
    const rows = await this.db
      .select({ playlist: playlists, cover: media })
      .from(playlists)
      .leftJoin(media, eq(playlists.coverId, media.id))
      .where(eq(playlists.id, id));
    if (!rows[0]) return undefined;
    return { ...rows[0].playlist, cover: rows[0].cover };
  }

  async findAiringWithReleaseSchedule(): Promise<AiringReleaseSchedule[]> {
    const rows = await this.db
      .select({
        playlistId: playlists.id,
        playlistNumber: playlists.number,
        releaseWeekday: playlists.releaseWeekday,
        releaseTime: playlists.releaseTime,
        seriesId: series.id,
        seriesName: series.name,
        seriesBanner: bannerMedia,
        seriesPoster: posterMedia,
      })
      .from(playlists)
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .leftJoin(
        posterAssets,
        and(
          eq(posterAssets.seriesId, series.id),
          eq(posterAssets.purpose, 'poster'),
        ),
      )
      .leftJoin(posterMedia, eq(posterAssets.mediaId, posterMedia.id))
      .leftJoin(
        bannerAssets,
        and(
          eq(bannerAssets.seriesId, series.id),
          eq(bannerAssets.purpose, 'banner'),
        ),
      )
      .leftJoin(bannerMedia, eq(bannerAssets.mediaId, bannerMedia.id))
      .where(
        and(
          eq(playlists.status, 'airing'),
          isNotNull(playlists.releaseWeekday),
        ),
      );

    return rows as AiringReleaseSchedule[];
  }

  async create(data: NewPlaylist): Promise<Playlist> {
    const result = await this.db.insert(playlists).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewPlaylist>): Promise<Playlist> {
    const result = await this.db
      .update(playlists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(playlists).where(eq(playlists.id, id));
  }
}
