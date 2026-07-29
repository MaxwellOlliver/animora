import { Injectable } from '@nestjs/common';

import { GenresRepository } from '@/modules/admin/genres/genres.repository';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly genresRepository: GenresRepository) {}

  async execute() {
    const genres = await this.genresRepository.findAll();
    return genres.filter((genre) => genre.active);
  }
}
