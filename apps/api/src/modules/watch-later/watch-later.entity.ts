import { sql } from 'drizzle-orm';
import { index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { series } from '../admin/series/entities/series.entity';
import { profiles } from '../profiles/profile.entity';

export const watchLater = pgTable(
  'watch_later',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    seriesId: uuid('series_id')
      .notNull()
      .references(() => series.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    unique('watch_later_profile_series_unique').on(t.profileId, t.seriesId),
    index('watch_later_profile_created_at_idx').on(t.profileId, t.createdAt),
  ],
);

export type WatchLater = typeof watchLater.$inferSelect;
export type NewWatchLater = typeof watchLater.$inferInsert;
