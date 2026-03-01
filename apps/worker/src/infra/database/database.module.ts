import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres, { type Sql } from 'postgres';

export const SQL = Symbol('SQL');

export type DB = Sql;

@Global()
@Module({
  providers: [
    {
      provide: SQL,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Sql =>
        postgres(config.getOrThrow<string>('DATABASE_URL')),
    },
  ],
  exports: [SQL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(SQL) private readonly sql: Sql) {}

  async onApplicationShutdown() {
    await this.sql.end();
  }
}
