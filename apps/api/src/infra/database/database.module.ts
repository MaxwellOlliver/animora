import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as userSchema from '@/modules/users/user.entity';
import * as authSchema from '@/modules/auth/refresh-token.entity';
import * as avatarSchema from '@/modules/admin/avatars/avatar.entity';
import * as profileSchema from '@/modules/profiles/profile.entity';
import * as genreSchema from '@/modules/admin/genres/genre.entity';
import * as classificationSchema from '@/modules/admin/content-classifications/content-classification.entity';
import * as animeSchema from '@/modules/admin/animes/anime.entity';
import * as animeGenreSchema from '@/modules/admin/animes/anime-genre.entity';

const schema = {
  ...userSchema,
  ...authSchema,
  ...avatarSchema,
  ...profileSchema,
  ...genreSchema,
  ...classificationSchema,
  ...animeSchema,
  ...animeGenreSchema,
};

export const DRIZZLE = Symbol('DRIZZLE');
export const PG_POOL = Symbol('PG_POOL');

export type DrizzleDB = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        });
      },
    },
    {
      provide: DRIZZLE,
      inject: [PG_POOL],
      useFactory: async (pool: Pool) => {
        const db = drizzle(pool, { schema });

        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`);

        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
