import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { count } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { media } from '@/modules/media/media.entity';

import { NewProfile, Profile, profiles } from './profile.entity';

export type ProfileWithAvatar = Profile & {
  avatar: {
    name: string;
    picture: { key: string; purpose: string } | null;
  } | null;
};

@Injectable()
export class ProfilesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<ProfileWithAvatar | undefined> {
    const rows = await this.db
      .select({
        profile: profiles,
        avatarName: avatars.name,
        pictureKey: media.key,
        picturePurpose: media.purpose,
      })
      .from(profiles)
      .leftJoin(avatars, eq(profiles.avatarId, avatars.id))
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .where(eq(profiles.id, id));

    if (!rows[0]) return undefined;
    return this.mapRow(rows[0]);
  }

  async findByUserId(userId: string): Promise<ProfileWithAvatar[]> {
    const rows = await this.db
      .select({
        profile: profiles,
        avatarName: avatars.name,
        pictureKey: media.key,
        picturePurpose: media.purpose,
      })
      .from(profiles)
      .leftJoin(avatars, eq(profiles.avatarId, avatars.id))
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .where(eq(profiles.userId, userId));

    return rows.map((r) => this.mapRow(r));
  }

  private mapRow(row: {
    profile: Profile;
    avatarName: string | null;
    pictureKey: string | null;
    picturePurpose: string | null;
  }): ProfileWithAvatar {
    return {
      ...row.profile,
      avatar: row.avatarName
        ? {
            name: row.avatarName,
            picture:
              row.pictureKey && row.picturePurpose
                ? { key: row.pictureKey, purpose: row.picturePurpose }
                : null,
          }
        : null,
    };
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    return result[0].count;
  }

  async create(data: NewProfile): Promise<Profile> {
    const result = await this.db.insert(profiles).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewProfile>): Promise<Profile> {
    const result = await this.db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(profiles).where(eq(profiles.id, id));
  }
}
