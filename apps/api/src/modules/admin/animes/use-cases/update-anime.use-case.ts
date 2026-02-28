import { Injectable, NotFoundException } from '@nestjs/common';
import { AnimesRepository } from '../animes.repository';
import { GenresRepository } from '../../genres/genres.repository';
import { ContentClassificationsRepository } from '../../content-classifications/content-classifications.repository';
import type { UpdateAnimeDto } from '../dto/update-anime.dto';
import type { AnimeWithDetails } from '../anime.entity';

@Injectable()
export class UpdateAnimeUseCase {
  constructor(
    private readonly animesRepository: AnimesRepository,
    private readonly genresRepository: GenresRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(id: string, dto: UpdateAnimeDto): Promise<AnimeWithDetails> {
    const anime = await this.animesRepository.findById(id);
    if (!anime) throw new NotFoundException('Anime not found');

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
      await this.animesRepository.setGenres(id, dto.genreIds);
    }

    const { genreIds: _, ...fields } = dto;
    if (Object.keys(fields).length > 0) {
      await this.animesRepository.update(id, fields);
    }

    return this.animesRepository.findById(id) as Promise<AnimeWithDetails>;
  }
}
