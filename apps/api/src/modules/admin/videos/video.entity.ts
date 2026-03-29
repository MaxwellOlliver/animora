import { sql } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const videoOwnerTypeEnum = pgEnum('video_owner_type', [
  'episode',
  'trailer',
]);

export const videoStatusEnum = pgEnum('video_status', [
  'pending',
  'processing',
  'ready',
  'failed',
]);

export const videos = pgTable(
  'videos',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v7()`)
      .primaryKey(),
    ownerType: videoOwnerTypeEnum('owner_type').notNull(),
    ownerId: uuid('owner_id').notNull(),
    status: videoStatusEnum('status').notNull().default('pending'),
    rawObjectKey: varchar('raw_object_key', { length: 500 }),
    masterPlaylistKey: varchar('master_playlist_key', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('videos_owner_unique').on(t.ownerType, t.ownerId)],
);

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoOwnerType = (typeof videoOwnerTypeEnum.enumValues)[number];
