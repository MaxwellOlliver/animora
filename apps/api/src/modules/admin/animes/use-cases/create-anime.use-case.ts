import { Injectable, NotFoundException } from '@nestjs/common';
import { AnimesRepository } from '../animes.repository';
import { GenresRepository } from '../../genres/genres.repository';
import { ContentClassificationsRepository } from '../../content-classifications/content-classifications.repository';
import type { CreateAnimeDto } from '../dto/create-anime.dto';
import type { AnimeWithDetails } from '../anime.entity';

@Injectable()
export class CreateAnimeUseCase {
  constructor(
    private readonly animesRepository: AnimesRepository,
    private readonly genresRepository: GenresRepository,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(dto: CreateAnimeDto): Promise<AnimeWithDetails> {
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

    const anime = await this.animesRepository.create({
      name: dto.name,
      synopsis: dto.synopsis,
      contentClassificationId: dto.contentClassificationId,
      active: dto.active ?? true,
    });

    await this.animesRepository.setGenres(anime.id, dto.genreIds);

    return this.animesRepository.findById(anime.id) as Promise<AnimeWithDetails>;
  }
}
