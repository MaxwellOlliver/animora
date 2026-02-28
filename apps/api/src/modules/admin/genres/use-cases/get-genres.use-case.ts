import { Injectable } from '@nestjs/common';
import { GenresRepository } from '../genres.repository';
import type { Genre } from '../genre.entity';

@Injectable()
export class GetGenresUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(): Promise<Genre[]> {
    return this.genresRepository.findAll();
  }
}
