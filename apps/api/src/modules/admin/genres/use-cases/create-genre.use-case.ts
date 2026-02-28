import { ConflictException, Injectable } from '@nestjs/common';
import { GenresRepository } from '../genres.repository';
import type { CreateGenreDto } from '../dto/create-genre.dto';
import type { Genre } from '../genre.entity';

@Injectable()
export class CreateGenreUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(dto: CreateGenreDto): Promise<Genre> {
    const existing = await this.genresRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Genre with this name already exists');
    }
    return this.genresRepository.create({ name: dto.name });
  }
}
