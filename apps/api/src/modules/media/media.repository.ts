import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDB } from '@/infra/database/database.module';

import { type Media, media, type NewMedia } from './media.entity';

@Injectable()
export class MediaRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: NewMedia): Promise<Media> {
    return this.db
      .insert(media)
      .values(data)
      .returning()
      .then((r) => r[0]);
  }

  async findById(id: string): Promise<Media | undefined> {
    return this.db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .then((r) => r[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(media).where(eq(media.id, id));
  }
}
