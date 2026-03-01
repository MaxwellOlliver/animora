import { pgTable, uuid, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { uploads } from './upload.entity';

export const uploadChunks = pgTable(
  'upload_chunks',
  {
    uploadId: uuid('upload_id')
      .notNull()
      .references(() => uploads.id, { onDelete: 'cascade' }),
    index: integer('index').notNull(),
    received: boolean('received').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.uploadId, t.index] })],
);

export type UploadChunk = typeof uploadChunks.$inferSelect;
