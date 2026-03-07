import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { type NewPlaylist, type Playlist, playlists } from './playlist.entity';

export type PlaylistWithMedia = Playlist & {
  cover: typeof media.$inferSelect | null;
};

@Injectable()
export class PlaylistsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

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
