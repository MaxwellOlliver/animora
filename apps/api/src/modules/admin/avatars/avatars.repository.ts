import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import { type Avatar, avatars, type NewAvatar } from './avatar.entity';

export type AvatarWithMedia = Avatar & { picture: typeof media.$inferSelect | null };

@Injectable()
export class AvatarsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<AvatarWithMedia[]> {
    const rows = await this.db
      .select({ avatar: avatars, picture: media })
      .from(avatars)
      .leftJoin(media, eq(avatars.pictureId, media.id));
    return rows.map((r) => ({ ...r.avatar, picture: r.picture }));
  }

  async findById(id: string): Promise<AvatarWithMedia | undefined> {
    const rows = await this.db
      .select({ avatar: avatars, picture: media })
      .from(avatars)
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .where(eq(avatars.id, id));
    if (!rows[0]) return undefined;
    return { ...rows[0].avatar, picture: rows[0].picture };
  }

  async findByName(name: string): Promise<Avatar | undefined> {
    const result = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.name, name));
    return result[0];
  }

  async findDefault(): Promise<Avatar | undefined> {
    const result = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.default, true));
    return result[0];
  }

  async create(data: NewAvatar): Promise<Avatar> {
    const result = await this.db.insert(avatars).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewAvatar>): Promise<Avatar> {
    const result = await this.db
      .update(avatars)
      .set(data)
      .where(eq(avatars.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(avatars).where(eq(avatars.id, id));
  }

  async unsetDefault(exceptId?: string): Promise<void> {
    if (exceptId) {
      await this.db
        .update(avatars)
        .set({ default: false })
        .where(and(eq(avatars.default, true), ne(avatars.id, exceptId)));
      return;
    }

    await this.db
      .update(avatars)
      .set({ default: false })
      .where(eq(avatars.default, true));
  }
}
