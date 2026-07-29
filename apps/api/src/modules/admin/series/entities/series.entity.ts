import { sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { media } from '@/modules/media/media.entity';

import { contentClassifications } from '../../content-classifications/content-classification.entity';
import type { Genre } from '../../genres/genre.entity';

const tsvector = customType<{ data: string }>({
  dataType: () => 'tsvector',
});

export const series = pgTable(
  'series',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    synopsis: text('synopsis').notNull(),
    bannerId: uuid('banner_id').references(() => media.id),
    contentClassificationId: uuid('content_classification_id')
      .notNull()
      .references(() => contentClassifications.id),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    searchVector: tsvector('search_vector').generatedAlwaysAs(
      sql`(
        setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(synopsis, '')), 'B')
      )`,
    ),
  },
  (t) => [index('series_search_vector_idx').using('gin', t.searchVector)],
);

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type PublicSeries = Omit<Series, 'searchVector'>;
export type SeriesWithDetails = PublicSeries & { genres: Genre[] };
