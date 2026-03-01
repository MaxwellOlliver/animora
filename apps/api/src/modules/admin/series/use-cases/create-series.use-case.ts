import { Injectable, NotFoundException } from '@nestjs/common';
import { SeriesRepository } from '../series.repository';
import { GenresRepository } from '../../genres/genres.repository';
import { ContentClassificationsRepository } from '../../content-classifications/content-classifications.repository';
import type { CreateSeriesDto } from '../dto/create-series.dto';
import type { SeriesWithDetails } from '../series.entity';

@Injectable()
export class CreateSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly genresRepository: GenresRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(dto: CreateSeriesDto): Promise<SeriesWithDetails> {
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
      active: dto.active ?? true,
    });

    await this.seriesRepository.setGenres(s.id, dto.genreIds);

    return this.seriesRepository.findById(s.id) as Promise<SeriesWithDetails>;
  }
}
