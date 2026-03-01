import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { uploads, Upload, NewUpload } from './upload.entity';
import { uploadChunks } from './upload-chunk.entity';

@Injectable()
export class UploadsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<Upload | undefined> {
    const result = await this.db
      .select()
      .from(uploads)
      .where(eq(uploads.id, id));
    return result[0];
  }

  async create(data: NewUpload): Promise<Upload> {
    const result = await this.db.insert(uploads).values(data).returning();
    return result[0];
  }

  /**
   * Inserts the chunk row (received = true).
   * Returns true if this is the first time this chunk was marked received,
   * false if it was already recorded (idempotent re-upload).
   */
  async markChunkReceived(uploadId: string, index: number): Promise<boolean> {
    const result = await this.db
      .insert(uploadChunks)
      .values({ uploadId, index, received: true })
      .onConflictDoNothing()
      .returning();
    return result.length > 0;
  }

  async incrementReceivedChunks(id: string): Promise<void> {
    await this.db
      .update(uploads)
      .set({
        receivedChunks: sql`${uploads.receivedChunks} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(uploads.id, id));
  }
}
