import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module.js';
import type { DrizzleDB } from '@/infra/database/database.module.js';
import {
  refreshTokens,
  NewRefreshToken,
  RefreshToken,
} from './refresh-token.entity.js';

@Injectable()
export class RefreshTokenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: NewRefreshToken): Promise<RefreshToken> {
    const result = await this.db.insert(refreshTokens).values(data).returning();
    return result[0];
  }

  async findByJti(jti: string): Promise<RefreshToken | undefined> {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.jti, jti));
    return result[0];
  }

  async deleteByJti(jti: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.jti, jti));
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}
