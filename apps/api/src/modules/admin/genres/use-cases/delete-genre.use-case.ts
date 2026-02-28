import { Injectable, NotFoundException } from '@nestjs/common';
import { GenresRepository } from '../genres.repository';

@Injectable()
export class DeleteGenreUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(id: string): Promise<void> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Genre not found');
    await this.genresRepository.delete(id);
  }
}
