import { Inject, Injectable } from '@nestjs/common';
import { SQL, type DB } from '../infra/database/database.module';

@Injectable()
export class VideosRepository {
  constructor(@Inject(SQL) private readonly sql: DB) {}

  async updateStatus(
    id: string,
    status: 'processing' | 'ready' | 'failed',
    masterPlaylistKey?: string,
  ): Promise<void> {
    await this.sql`
      UPDATE videos
      SET
        status = ${status},
        master_playlist_key = COALESCE(${masterPlaylistKey ?? null}, master_playlist_key),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}
