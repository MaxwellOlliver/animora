import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { profiles, Profile, NewProfile } from './profile.entity';
import { count } from 'drizzle-orm';

@Injectable()
export class ProfilesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<Profile | undefined> {
    const result = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));
    return result[0];
  }

  async findByUserId(userId: string): Promise<Profile[]> {
    return this.db.select().from(profiles).where(eq(profiles.userId, userId));
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
