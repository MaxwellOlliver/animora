import { Injectable } from '@nestjs/common';

import { ContentClassificationsRepository } from '@/modules/admin/content-classifications/content-classifications.repository';
import { PlaylistsRepository } from '@/modules/admin/playlists/playlists.repository';
import { SeriesRepository } from '@/modules/admin/series/repositories/series.repository';
import { SeriesReviewsRepository } from '@/modules/series-reviews/series-reviews.repository';

import type { ExploreSeriesQueryDto } from '../dto/explore-series-query.dto';

@Injectable()
export class ExploreSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(input: ExploreSeriesQueryDto) {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    const q = input.q?.trim() || undefined;

    const { items, nextCursor } = await this.seriesRepository.exploreCursor({
      q,
      genreIds: input.categoryIds,
      classificationIds: input.classifications,
      cursor: input.cursor,
      limit,
    });

    if (items.length === 0) return { items: [], nextCursor: null };

    const seriesIds = items.map((s) => s.id);
    const classificationIds = [
      ...new Set(items.map((s) => s.contentClassificationId)),
    ];

    const [ratings, rollups, classifications] = await Promise.all([
      this.seriesReviewsRepository.getAverageRatings(seriesIds),
      this.playlistsRepository.findRollupBySeriesIds(seriesIds),
      this.classificationsRepository.findByIds(classificationIds),
    ]);

    const classificationById = new Map(classifications.map((c) => [c.id, c]));

    return {
      items: items.map((s) => {
        const classification = classificationById.get(
          s.contentClassificationId,
        );
        const rollup = rollups.get(s.id);
        const rating = ratings.get(s.id);

        return {
          ...s,
          contentClassification: classification
            ? {
                id: classification.id,
                name: classification.name,
                description: classification.description,
                icon: classification.icon,
              }
            : null,
          releaseYear: rollup?.releaseYear ?? null,
          status: rollup?.status ?? null,
          rating: {
            average: Math.round((rating?.average ?? 0) * 10) / 10,
            count: rating?.count ?? 0,
          },
        };
      }),
      nextCursor,
    };
  }
}
