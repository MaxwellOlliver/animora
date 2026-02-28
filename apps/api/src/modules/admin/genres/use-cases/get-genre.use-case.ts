import { Injectable, NotFoundException } from '@nestjs/common';
import { GenresRepository } from '../genres.repository';
import type { Genre } from '../genre.entity';

@Injectable()
export class GetGenreUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(id: string): Promise<Genre> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }
}
