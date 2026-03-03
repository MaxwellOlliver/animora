import { Injectable, NotFoundException } from '@nestjs/common';

import type { Genre } from '../genre.entity';
import { GenresRepository } from '../genres.repository';

@Injectable()
export class GetGenreUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(id: string): Promise<Genre> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }
}
