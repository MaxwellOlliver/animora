import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { series } from './series.entity';
import { genres } from '../genres/genre.entity';

export const seriesGenres = pgTable(
  'series_genres',
  {
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    genreId: uuid('genre_id')
      .notNull()
      .references(() => genres.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.seriesId, t.genreId] })],
);

export type SeriesGenre = typeof seriesGenres.$inferSelect;
