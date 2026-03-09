import { Injectable, NotFoundException } from '@nestjs/common';

import { ContentClassificationsRepository } from '../../content-classifications/content-classifications.repository';
import { GenresRepository } from '../../genres/genres.repository';
import type { CreateSeriesDto } from '../dto/create-series.dto';
import type { SeriesWithDetailsAndMedia } from '../repositories/series.repository';
import { SeriesRepository } from '../repositories/series.repository';

@Injectable()
export class CreateSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly genresRepository: GenresRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(dto: CreateSeriesDto): Promise<SeriesWithDetailsAndMedia> {
    const classification = await this.classificationsRepository.findById(
      dto.contentClassificationId,
    );
    if (!classification) {
      throw new NotFoundException('Content classification not found');
    }

    for (const genreId of dto.genreIds) {
      const genre = await this.genresRepository.findById(genreId);
      if (!genre) throw new NotFoundException(`Genre ${genreId} not found`);
    }

    const s = await this.seriesRepository.create({
      name: dto.name,
      synopsis: dto.synopsis,
      contentClassificationId: dto.contentClassificationId,
      active: false,
    });

    await this.seriesRepository.setGenres(s.id, dto.genreIds);

    return this.seriesRepository.findById(
      s.id,
    ) as Promise<SeriesWithDetailsAndMedia>;
  }
}
