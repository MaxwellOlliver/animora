import { Injectable, NotFoundException } from '@nestjs/common';

import { ContentClassificationsRepository } from '../../content-classifications/content-classifications.repository';
import { GenresRepository } from '../../genres/genres.repository';
import type { UpdateSeriesDto } from '../dto/update-series.dto';
import type { SeriesWithDetailsAndMedia } from '../repositories/series.repository';
import { SeriesRepository } from '../repositories/series.repository';

@Injectable()
export class UpdateSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly genresRepository: GenresRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateSeriesDto,
  ): Promise<SeriesWithDetailsAndMedia> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');

    if (dto.contentClassificationId) {
      const classification = await this.classificationsRepository.findById(
        dto.contentClassificationId,
      );
      if (!classification)
        throw new NotFoundException('Content classification not found');
    }

    const { genreIds, ...fields } = dto;

    if (genreIds) {
      for (const genreId of genreIds) {
        const genre = await this.genresRepository.findById(genreId);
        if (!genre) throw new NotFoundException(`Genre ${genreId} not found`);
      }
      await this.seriesRepository.setGenres(id, genreIds);
    }

    if (Object.keys(fields).length > 0) {
      await this.seriesRepository.update(id, fields);
    }

    return this.seriesRepository.findById(
      id,
    ) as Promise<SeriesWithDetailsAndMedia>;
  }
}
