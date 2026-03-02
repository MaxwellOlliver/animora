import { Context, Effect, Layer } from 'effect';
import postgres, { type Sql } from 'postgres';

export class SqlClient extends Context.Tag('SqlClient')<SqlClient, Sql>() {}

export const DatabaseLive = Layer.scoped(
  SqlClient,
  Effect.acquireRelease(
    Effect.gen(function* () {
      const sql = yield* Effect.sync(() => postgres(process.env.DATABASE_URL!));
      yield* Effect.log('Database connection acquired');
      return sql;
    }),
    (sql) =>
      Effect.gen(function* () {
        yield* Effect.promise(() => sql.end());
        yield* Effect.log('Database connection released');
      }),
  ),
);
