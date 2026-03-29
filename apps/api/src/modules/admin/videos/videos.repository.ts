import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import { NewVideo, Video, VideoOwnerType, videos } from './video.entity';

@Injectable()
export class VideosRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where(eq(videos.id, id));
    return result[0];
  }

  async findByOwner(
    ownerType: VideoOwnerType,
    ownerId: string,
  ): Promise<Video | undefined> {
    const result = await this.db
      .select()
      .from(videos)
      .where(and(eq(videos.ownerType, ownerType), eq(videos.ownerId, ownerId)));
    return result[0];
  }

  async create(data: NewVideo): Promise<Video> {
    const result = await this.db.insert(videos).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewVideo>): Promise<Video> {
    const result = await this.db
      .update(videos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(videos).where(eq(videos.id, id));
  }
}
