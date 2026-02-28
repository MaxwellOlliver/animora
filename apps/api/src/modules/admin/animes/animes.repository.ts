import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import type { DrizzleDB } from '@/infra/database/database.module';
import { animes, Anime, NewAnime, AnimeWithDetails } from './anime.entity';
import { animeGenres } from './anime-genre.entity';
import { genres } from '../genres/genre.entity';

@Injectable()
export class AnimesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<AnimeWithDetails[]> {
    const all = await this.db.select().from(animes);
    if (all.length === 0) return [];

    const genreRows = await this.db
      .select({ animeId: animeGenres.animeId, genre: genres })
      .from(animeGenres)
      .innerJoin(genres, eq(animeGenres.genreId, genres.id))
      .where(
        inArray(
          animeGenres.animeId,
          all.map((a) => a.id),
        ),
      );

    const genresByAnimeId = genreRows.reduce<Record<string, typeof genres.$inferSelect[]>>(
      (acc, row) => {
        if (!acc[row.animeId]) acc[row.animeId] = [];
        acc[row.animeId].push(row.genre);
        return acc;
      },
      {},
    );

    return all.map((anime) => ({
      ...anime,
      genres: genresByAnimeId[anime.id] ?? [],
    }));
  }

  async findById(id: string): Promise<AnimeWithDetails | undefined> {
    const result = await this.db.select().from(animes).where(eq(animes.id, id));
    if (!result[0]) return undefined;

    const genreRows = await this.db
      .select({ genre: genres })
      .from(animeGenres)
      .innerJoin(genres, eq(animeGenres.genreId, genres.id))
      .where(eq(animeGenres.animeId, id));

    return { ...result[0], genres: genreRows.map((r) => r.genre) };
  }

  async create(data: NewAnime): Promise<Anime> {
    const result = await this.db.insert(animes).values(data).returning();
    return result[0];
  }

  async setGenres(animeId: string, genreIds: string[]): Promise<void> {
    await this.db.delete(animeGenres).where(eq(animeGenres.animeId, animeId));
    if (genreIds.length > 0) {
      await this.db
        .insert(animeGenres)
        .values(genreIds.map((genreId) => ({ animeId, genreId })));
    }
  }

  async update(id: string, data: Partial<NewAnime>): Promise<Anime> {
    const result = await this.db
      .update(animes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(animes.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(animes).where(eq(animes.id, id));
  }
}
