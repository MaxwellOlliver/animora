import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { genres, Genre, NewGenre } from './genre.entity';

@Injectable()
export class GenresRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<Genre[]> {
    return this.db.select().from(genres);
  }

  async findById(id: string): Promise<Genre | undefined> {
    const result = await this.db.select().from(genres).where(eq(genres.id, id));
    return result[0];
  }

  async findByName(name: string): Promise<Genre | undefined> {
    const result = await this.db
      .select()
      .from(genres)
      .where(eq(genres.name, name));
    return result[0];
  }

  async create(data: NewGenre): Promise<Genre> {
    const result = await this.db.insert(genres).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewGenre>): Promise<Genre> {
    const result = await this.db
      .update(genres)
      .set(data)
      .where(eq(genres.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(genres).where(eq(genres.id, id));
  }
}
