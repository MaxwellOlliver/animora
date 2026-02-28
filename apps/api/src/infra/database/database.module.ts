import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as userSchema from '@/modules/users/user.entity.js';
import * as authSchema from '@/modules/auth/refresh-token.entity.js';
import * as avatarSchema from '@/modules/admin/avatars/avatar.entity.js';
import * as profileSchema from '@/modules/profiles/profile.entity.js';

const schema = {
  ...userSchema,
  ...authSchema,
  ...avatarSchema,
  ...profileSchema,
};

export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDB = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const pool = new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        });
        const db = drizzle(pool, { schema });

        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`);

        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
