import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, gt, gte, isNotNull, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { playlists } from '../playlists/playlist.entity';
import { series } from '../series/entities/series.entity';
import { seriesAssets } from '../series/entities/series-asset.entity';
import { videos } from '../videos/video.entity';
import { type Episode, episodes, type NewEpisode } from './episode.entity';

const posterMedia = alias(media, 'poster_media');
const posterAssets = alias(seriesAssets, 'poster_assets');
const bannerMedia = alias(media, 'banner_media');
const bannerAssets = alias(seriesAssets, 'banner_assets');

export type EpisodeSchedule = Episode & {
  available: boolean;
  thumbnail: typeof media.$inferSelect | null;
  seriesId: string;
  seriesName: string;
  seriesBanner: typeof media.$inferSelect | null;
  seriesPoster: typeof media.$inferSelect | null;
  playlistNumber: number;
};

export type EpisodeWithMedia = Episode & {
  thumbnail: typeof media.$inferSelect | null;
};

export type EpisodeWithContext = EpisodeWithMedia & {
  playlistName: string | null;
  seriesName: string;
};

export type EpisodeWithMediaAndContext = EpisodeWithMedia & {
  playlist: {
    id: string;
    number: number;
    title: string | null;
    type: string;
  };
  series: {
    id: string;
    name: string;
  };
};

@Injectable()
export class EpisodesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<EpisodeWithContext[]> {
    const rows = await this.db
      .select({
        episode: episodes,
        thumbnail: media,
        playlistName: playlists.title,
        seriesName: series.name,
      })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .orderBy(desc(episodes.createdAt));
    return rows.map((r) => ({
      ...r.episode,
      thumbnail: r.thumbnail,
      playlistName: r.playlistName,
      seriesName: r.seriesName,
    }));
  }

  async findByPlaylistId(
    playlistId: string,
    activeOnly = false,
  ): Promise<EpisodeWithMedia[]> {
    const conditions = activeOnly
      ? and(eq(episodes.playlistId, playlistId), eq(series.active, true))
      : eq(episodes.playlistId, playlistId);
    const rows = await this.db
      .select({ episode: episodes, thumbnail: media })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .where(conditions)
      .orderBy(asc(episodes.number));
    return rows.map((r) => ({ ...r.episode, thumbnail: r.thumbnail }));
  }

  async findById(id: string): Promise<EpisodeWithMedia | undefined> {
    const rows = await this.db
      .select({ episode: episodes, thumbnail: media })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .where(eq(episodes.id, id));
    if (!rows[0]) return undefined;
    return { ...rows[0].episode, thumbnail: rows[0].thumbnail };
  }

  async findByIdWithContext(
    id: string,
    activeOnly = false,
  ): Promise<EpisodeWithMediaAndContext | undefined> {
    const conditions = activeOnly
      ? and(eq(episodes.id, id), eq(series.active, true))
      : eq(episodes.id, id);
    const rows = await this.db
      .select({
        episode: episodes,
        thumbnail: media,
        playlist: {
          id: playlists.id,
          number: playlists.number,
          title: playlists.title,
          type: playlists.type,
        },
        series: {
          id: series.id,
          name: series.name,
        },
      })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .where(conditions);

    if (!rows[0]) return undefined;

    return {
      ...rows[0].episode,
      thumbnail: rows[0].thumbnail,
      playlist: rows[0].playlist,
      series: rows[0].series,
    };
  }

  async findNextByPlaylistAndNumber(
    playlistId: string,
    number: number,
  ): Promise<EpisodeWithMedia | undefined> {
    const rows = await this.db
      .select({ episode: episodes, thumbnail: media })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .where(
        and(eq(episodes.playlistId, playlistId), gt(episodes.number, number)),
      )
      .orderBy(asc(episodes.number))
      .limit(1);

    if (!rows[0]) return undefined;

    return {
      ...rows[0].episode,
      thumbnail: rows[0].thumbnail,
    };
  }

  async findByReleaseDateRange(
    from: Date,
    to: Date,
  ): Promise<EpisodeSchedule[]> {
    const rows = await this.db
      .select({
        episode: episodes,
        thumbnail: media,
        seriesId: series.id,
        seriesName: series.name,
        seriesBanner: bannerMedia,
        seriesPoster: posterMedia,
        playlistNumber: playlists.number,
        videoStatus: videos.status,
      })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
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
      .leftJoin(
        videos,
        and(eq(videos.ownerType, 'episode'), eq(videos.ownerId, episodes.id)),
      )
      .where(
        and(
          isNotNull(episodes.releaseDate),
          gte(episodes.releaseDate, from),
          lte(episodes.releaseDate, to),
          eq(series.active, true),
        ),
      )
      .orderBy(asc(episodes.releaseDate));

    return rows.map((r) => ({
      ...r.episode,
      available: r.videoStatus === 'ready',
      thumbnail: r.thumbnail,
      seriesId: r.seriesId,
      seriesName: r.seriesName,
      seriesBanner: r.seriesBanner,
      seriesPoster: r.seriesPoster,
      playlistNumber: r.playlistNumber,
    }));
  }

  async create(data: NewEpisode): Promise<Episode> {
    const result = await this.db.insert(episodes).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewEpisode>): Promise<Episode> {
    const result = await this.db
      .update(episodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(episodes.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(episodes).where(eq(episodes.id, id));
  }
}
