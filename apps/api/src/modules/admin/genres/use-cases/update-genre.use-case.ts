import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GenresRepository } from '../genres.repository';
import type { UpdateGenreDto } from '../dto/update-genre.dto';
import type { Genre } from '../genre.entity';

@Injectable()
export class UpdateGenreUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute(id: string, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Genre not found');

    if (dto.name && dto.name !== genre.name) {
      const existing = await this.genresRepository.findByName(dto.name);
      if (existing) throw new ConflictException('Genre with this name already exists');
    }

    return this.genresRepository.update(id, dto);
  }
}
