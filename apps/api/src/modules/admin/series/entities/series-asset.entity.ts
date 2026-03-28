import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { media } from '@/modules/media/media.entity';

import { series } from './series.entity';

export const seriesAssetPurposeEnum = pgEnum('series_asset_purpose', [
  'banner',
  'logo',
  'trailer',
  'poster',
]);

export const seriesAssets = pgTable(
  'series_assets',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id),
    purpose: seriesAssetPurposeEnum('purpose').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique().on(t.seriesId, t.purpose)],
);

export type SeriesAsset = typeof seriesAssets.$inferSelect;
export type NewSeriesAsset = typeof seriesAssets.$inferInsert;
