import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { playlists } from '../playlists/playlist.entity';
import { series } from '../series/entities/series.entity';
import { type Episode, episodes, type NewEpisode } from './episode.entity';

export type EpisodeWithMedia = Episode & {
  thumbnail: typeof media.$inferSelect | null;
};

export type EpisodeWithContext = EpisodeWithMedia & {
  playlistName: string | null;
  seriesName: string;
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

  async findByPlaylistId(playlistId: string): Promise<EpisodeWithMedia[]> {
    const rows = await this.db
      .select({ episode: episodes, thumbnail: media })
      .from(episodes)
      .leftJoin(media, eq(episodes.thumbnailId, media.id))
      .where(eq(episodes.playlistId, playlistId))
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
