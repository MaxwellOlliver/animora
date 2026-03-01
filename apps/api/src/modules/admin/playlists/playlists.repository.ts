import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { playlists, Playlist, NewPlaylist } from './playlist.entity';

@Injectable()
export class PlaylistsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findBySeriesId(seriesId: string): Promise<Playlist[]> {
    return this.db
      .select()
      .from(playlists)
      .where(eq(playlists.seriesId, seriesId))
      .orderBy(asc(playlists.number));
  }

  async findById(id: string): Promise<Playlist | undefined> {
    const result = await this.db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id));
    return result[0];
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
