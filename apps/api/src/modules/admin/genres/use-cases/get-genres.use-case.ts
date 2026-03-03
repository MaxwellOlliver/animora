import { Injectable } from '@nestjs/common';

import type { Genre } from '../genre.entity';
import { GenresRepository } from '../genres.repository';

@Injectable()
export class GetGenresUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(): Promise<Genre[]> {
    return this.genresRepository.findAll();
  }
}
