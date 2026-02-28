import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { animes } from './anime.entity';
import { genres } from '../genres/genre.entity';

export const animeGenres = pgTable(
  'anime_genres',
  {
    animeId: uuid('anime_id')
      .notNull()
      .references(() => animes.id, { onDelete: 'cascade' }),
    genreId: uuid('genre_id')
      .notNull()
      .references(() => genres.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.animeId, t.genreId] })],
);

export type AnimeGenre = typeof animeGenres.$inferSelect;
