import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const contentClassifications = pgTable('content_classifications', {
  id: uuid('id')
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  iconKey: varchar('icon_key', { length: 500 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ContentClassification = typeof contentClassifications.$inferSelect;
export type NewContentClassification =
  typeof contentClassifications.$inferInsert;
