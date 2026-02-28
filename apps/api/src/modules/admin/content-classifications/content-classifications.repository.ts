import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import {
  contentClassifications,
  ContentClassification,
  NewContentClassification,
} from './content-classification.entity';

@Injectable()
export class ContentClassificationsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<ContentClassification[]> {
    return this.db.select().from(contentClassifications);
  }

  async findById(id: string): Promise<ContentClassification | undefined> {
    const result = await this.db
      .select()
      .from(contentClassifications)
      .where(eq(contentClassifications.id, id));
    return result[0];
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
