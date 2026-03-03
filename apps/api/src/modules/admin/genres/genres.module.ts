import { Module } from '@nestjs/common';

import { GenresRepository } from './genres.repository';
import { GenresAdminController } from './genres-admin.controller';
import { CreateGenreUseCase } from './use-cases/create-genre.use-case';
import { DeleteGenreUseCase } from './use-cases/delete-genre.use-case';
import { GetGenreUseCase } from './use-cases/get-genre.use-case';
import { GetGenresUseCase } from './use-cases/get-genres.use-case';
import { UpdateGenreUseCase } from './use-cases/update-genre.use-case';

@Module({
  controllers: [GenresAdminController],
  providers: [
    GenresRepository,
    CreateGenreUseCase,
    GetGenresUseCase,
    GetGenreUseCase,
    UpdateGenreUseCase,
    DeleteGenreUseCase,
  ],
  exports: [GenresRepository],
})
export class GenresModule {}
