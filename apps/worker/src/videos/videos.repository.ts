import { Context, Effect, Layer } from 'effect';
import { SqlClient } from '../infra/database/database.layer';

export class VideosRepository extends Context.Tag('VideosRepository')<
  VideosRepository,
  {
    updateStatus(
      id: string,
      status: string,
      masterPlaylistKey?: string,
    ): Effect.Effect<void, unknown>;
  }
>() {}

export const VideosRepositoryLive = Layer.effect(
  VideosRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient;
    return {
      updateStatus: (id: string, status: string, masterPlaylistKey?: string) =>
        Effect.tryPromise(
          () =>
            sql`
            UPDATE videos
            SET status = ${status},
                master_playlist_key = COALESCE(${masterPlaylistKey ?? null}, master_playlist_key),
                updated_at = NOW()
            WHERE id = ${id}
          `,
        ),
    };
  }),
);
