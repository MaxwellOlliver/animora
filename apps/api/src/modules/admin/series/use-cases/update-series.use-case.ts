import { Injectable, NotFoundException } from '@nestjs/common';
import { SeriesRepository } from '../series.repository';
import { GenresRepository } from '../../genres/genres.repository';
import { ContentClassificationsRepository } from '../../content-classifications/content-classifications.repository';
import type { UpdateSeriesDto } from '../dto/update-series.dto';
import type { SeriesWithDetails } from '../series.entity';

@Injectable()
export class UpdateSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly genresRepository: GenresRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(id: string, dto: UpdateSeriesDto): Promise<SeriesWithDetails> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');

    if (dto.contentClassificationId) {
      const classification = await this.classificationsRepository.findById(
        dto.contentClassificationId,
      );
      if (!classification) throw new NotFoundException('Content classification not found');
    }

    if (dto.genreIds) {
      for (const genreId of dto.genreIds) {
        const genre = await this.genresRepository.findById(genreId);
        if (!genre) throw new NotFoundException(`Genre ${genreId} not found`);
      }
      await this.seriesRepository.setGenres(id, dto.genreIds);
    }

    const { genreIds: _, ...fields } = dto;
    if (Object.keys(fields).length > 0) {
      await this.seriesRepository.update(id, fields);
    }

    return this.seriesRepository.findById(id) as Promise<SeriesWithDetails>;
  }
}
