import { Injectable } from '@nestjs/common';

import type { EpisodeSchedule } from '@/modules/admin/episodes/episodes.repository';
import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';
import type { AiringReleaseSchedule } from '@/modules/admin/playlists/playlists.repository';
import { PlaylistsRepository } from '@/modules/admin/playlists/playlists.repository';
import type { Media } from '@/modules/media/media.entity';

export type ScheduleEntry =
  | {
      kind: 'episode';
      id: string;
      number: number;
      title: string;
      releaseDate: Date;
      available: boolean;
      thumbnail: Media | null;
      seriesId: string;
      seriesName: string;
      seriesBanner: Media | null;
      seriesPoster: Media | null;
      playlistId: string;
      playlistNumber: number;
    }
  | {
      kind: 'expected';
      date: string;
      releaseTime: string | null;
      seriesId: string;
      seriesName: string;
      seriesBanner: Media | null;
      seriesPoster: Media | null;
      playlistId: string;
      playlistNumber: number;
    };

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function enumerateDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  while (cursor <= end) {
    dates.push(toDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function effectiveDate(entry: ScheduleEntry): string {
  return entry.kind === 'episode' ? toDateKey(entry.releaseDate) : entry.date;
}

@Injectable()
export class GetScheduleUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly playlistsRepository: PlaylistsRepository,
  ) {}

  async execute({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<ScheduleEntry[]> {
    const [realEpisodes, airingPlaylists]: [
      EpisodeSchedule[],
      AiringReleaseSchedule[],
    ] = await Promise.all([
      this.episodesRepository.findByReleaseDateRange(
        new Date(`${from}T00:00:00.000Z`),
        new Date(`${to}T23:59:59.999Z`),
      ),
      this.playlistsRepository.findAiringWithReleaseSchedule(),
    ]);

    const realEntries: ScheduleEntry[] = realEpisodes.map((e) => ({
      kind: 'episode',
      id: e.id,
      number: e.number,
      title: e.title,
      releaseDate: e.releaseDate as Date,
      available: e.available,
      thumbnail: e.thumbnail,
      seriesId: e.seriesId,
      seriesName: e.seriesName,
      seriesBanner: e.seriesBanner,
      seriesPoster: e.seriesPoster,
      playlistId: e.playlistId,
      playlistNumber: e.playlistNumber,
    }));

    const todayKey = toDateKey(new Date());
    const expectedFrom = todayKey > from ? todayKey : from;
    const expectedEntries: ScheduleEntry[] = [];
    for (const date of enumerateDates(expectedFrom, to)) {
      const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
      for (const p of airingPlaylists) {
        if (p.releaseWeekday !== weekday) continue;
        const alreadyReal = realEntries.some(
          (e) =>
            e.kind === 'episode' &&
            e.playlistId === p.playlistId &&
            toDateKey(e.releaseDate) === date,
        );
        if (alreadyReal) continue;
        expectedEntries.push({
          kind: 'expected',
          date,
          releaseTime: p.releaseTime,
          seriesId: p.seriesId,
          seriesName: p.seriesName,
          seriesBanner: p.seriesBanner,
          seriesPoster: p.seriesPoster,
          playlistId: p.playlistId,
          playlistNumber: p.playlistNumber,
        });
      }
    }

    return [...realEntries, ...expectedEntries].sort((a, b) =>
      effectiveDate(a).localeCompare(effectiveDate(b)),
    );
  }
}
