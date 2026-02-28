import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module.js';
import type { DrizzleDB } from '@/infra/database/database.module.js';
import { avatars, Avatar } from './avatar.entity.js';

@Injectable()
export class AvatarsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<Avatar | undefined> {
    const result = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.id, id));
    return result[0];
  }

  async findDefault(): Promise<Avatar | undefined> {
    const result = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.default, true));
    return result[0];
  }
}
