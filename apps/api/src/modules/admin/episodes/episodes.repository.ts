import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { episodes, Episode, NewEpisode } from './episode.entity';

@Injectable()
export class EpisodesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByPlaylistId(playlistId: string): Promise<Episode[]> {
    return this.db
      .select()
      .from(episodes)
      .where(eq(episodes.playlistId, playlistId))
      .orderBy(asc(episodes.number));
  }

  async findById(id: string): Promise<Episode | undefined> {
    const result = await this.db
      .select()
      .from(episodes)
      .where(eq(episodes.id, id));
    return result[0];
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
