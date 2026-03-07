import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { media } from '@/modules/media/media.entity';

import {
  type ContentClassification,
  contentClassifications,
  type NewContentClassification,
} from './content-classification.entity';

export type ContentClassificationWithMedia = ContentClassification & {
  icon: typeof media.$inferSelect | null;
};

@Injectable()
export class ContentClassificationsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<ContentClassificationWithMedia[]> {
    const rows = await this.db
      .select({ classification: contentClassifications, icon: media })
      .from(contentClassifications)
      .leftJoin(media, eq(contentClassifications.iconId, media.id));
    return rows.map((r) => ({ ...r.classification, icon: r.icon }));
  }

  async findById(
    id: string,
  ): Promise<ContentClassificationWithMedia | undefined> {
    const rows = await this.db
      .select({ classification: contentClassifications, icon: media })
      .from(contentClassifications)
      .leftJoin(media, eq(contentClassifications.iconId, media.id))
      .where(eq(contentClassifications.id, id));
    if (!rows[0]) return undefined;
    return { ...rows[0].classification, icon: rows[0].icon };
  }

  async findByName(name: string): Promise<ContentClassification | undefined> {
    const result = await this.db
      .select()
      .from(contentClassifications)
      .where(eq(contentClassifications.name, name));
    return result[0];
  }

  async create(data: NewContentClassification): Promise<ContentClassification> {
    const result = await this.db
      .insert(contentClassifications)
      .values(data)
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<NewContentClassification>,
  ): Promise<ContentClassification> {
    const result = await this.db
      .update(contentClassifications)
      .set(data)
      .where(eq(contentClassifications.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(contentClassifications)
      .where(eq(contentClassifications.id, id));
  }
}
