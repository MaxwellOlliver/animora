import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt, sql } from 'drizzle-orm';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import { episodes } from '../admin/episodes/episode.entity';
import { playlists } from '../admin/playlists/playlist.entity';
import { series } from '../admin/series/entities/series.entity';
import { media } from '../media/media.entity';
import { WatchHistory, watchHistory } from './watch-history.entity';

export type WatchHistoryWithEpisode = WatchHistory & {
  episode: {
    id: string;
    number: number;
    title: string;
    durationSeconds: number | null;
    thumbnailUrl: string | null;
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
};

@Injectable()
export class WatchHistoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(data: {
    profileId: string;
    episodeId: string;
    positionSeconds: number;
    status: 'watching' | 'finished';
  }): Promise<WatchHistory> {
    const result = await this.db
      .insert(watchHistory)
      .values(data)
      .onConflictDoUpdate({
        target: [watchHistory.profileId, watchHistory.episodeId],
        set: {
          positionSeconds: sql`excluded.position_seconds`,
          status: sql`excluded.status`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async findByProfileAndEpisode(
    profileId: string,
    episodeId: string,
  ): Promise<WatchHistory | undefined> {
    const result = await this.db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.profileId, profileId),
          eq(watchHistory.episodeId, episodeId),
        ),
      );
    return result[0];
  }

  async findByProfileCursor(
    profileId: string,
    { cursor, limit = 20 }: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<WatchHistoryWithEpisode>> {
    const thumbnailMedia = this.db
      .select({ id: media.id, key: media.key })
      .from(media)
      .as('thumbnail_media');

    const baseCondition = eq(watchHistory.profileId, profileId);
    const conditions = cursor
      ? and(baseCondition, lt(watchHistory.updatedAt, new Date(cursor)))
      : baseCondition;

    const rows = await this.db
      .select({
        watchHistory: watchHistory,
        episode: {
          id: episodes.id,
          number: episodes.number,
          title: episodes.title,
          durationSeconds: episodes.durationSeconds,
          thumbnailKey: thumbnailMedia.key,
        },
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
      .from(watchHistory)
      .innerJoin(episodes, eq(watchHistory.episodeId, episodes.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .leftJoin(thumbnailMedia, eq(episodes.thumbnailId, thumbnailMedia.id))
      .where(conditions)
      .orderBy(desc(watchHistory.updatedAt))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => ({
        ...row.watchHistory,
        episode: {
          id: row.episode.id,
          number: row.episode.number,
          title: row.episode.title,
          durationSeconds: row.episode.durationSeconds,
          thumbnailUrl: row.episode.thumbnailKey,
          playlist: row.playlist,
          series: row.series,
        },
      })),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.watchHistory.updatedAt.toISOString() ??
          null)
        : null,
    };
  }

  async findContinueWatching(
    profileId: string,
    { cursor, limit = 20 }: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<WatchHistoryWithEpisode>> {
    const thumbnailMedia = this.db
      .select({ id: media.id, key: media.key })
      .from(media)
      .as('thumbnail_media');

    // Subquery: DISTINCT ON picks the latest watch_history ID per series
    const latestPerSeries = this.db
      .select({
        id: sql<string>`DISTINCT ON (${series.id}) ${watchHistory.id}`.as(
          'latest_id',
        ),
      })
      .from(watchHistory)
      .innerJoin(episodes, eq(watchHistory.episodeId, episodes.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .where(eq(watchHistory.profileId, profileId))
      .orderBy(series.id, desc(watchHistory.updatedAt))
      .as('latest_per_series');

    // Main query: join from the filtered IDs back to watch_history to hydrate
    const baseCondition = eq(watchHistory.id, latestPerSeries.id);
    const conditions = cursor
      ? and(baseCondition, lt(watchHistory.updatedAt, new Date(cursor)))
      : baseCondition;

    const rows = await this.db
      .select({
        watchHistory: watchHistory,
        episode: {
          id: episodes.id,
          number: episodes.number,
          title: episodes.title,
          durationSeconds: episodes.durationSeconds,
          thumbnailKey: thumbnailMedia.key,
        },
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
      .from(latestPerSeries)
      .innerJoin(watchHistory, eq(latestPerSeries.id, watchHistory.id))
      .innerJoin(episodes, eq(watchHistory.episodeId, episodes.id))
      .innerJoin(playlists, eq(episodes.playlistId, playlists.id))
      .innerJoin(series, eq(playlists.seriesId, series.id))
      .leftJoin(thumbnailMedia, eq(episodes.thumbnailId, thumbnailMedia.id))
      .where(conditions)
      .orderBy(desc(watchHistory.updatedAt))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => ({
        ...row.watchHistory,
        episode: {
          id: row.episode.id,
          number: row.episode.number,
          title: row.episode.title,
          durationSeconds: row.episode.durationSeconds,
          thumbnailUrl: row.episode.thumbnailKey,
          playlist: row.playlist,
          series: row.series,
        },
      })),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.watchHistory.updatedAt.toISOString() ??
          null)
        : null,
    };
  }
}
