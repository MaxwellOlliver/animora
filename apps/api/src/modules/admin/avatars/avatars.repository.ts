import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';

import { type Avatar, avatars, type NewAvatar } from './avatar.entity';

@Injectable()
export class AvatarsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<Avatar[]> {
    return this.db.select().from(avatars);
  }

  async findById(id: string): Promise<Avatar | undefined> {
    const result = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.id, id));
    return result[0];
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
