import { Injectable } from '@nestjs/common';
import { AnimesRepository } from '../animes.repository';
import type { AnimeWithDetails } from '../anime.entity';

@Injectable()
export class GetAnimesUseCase {
  constructor(private readonly animesRepository: AnimesRepository) {}

  async execute(): Promise<AnimeWithDetails[]> {
    return this.animesRepository.findAll();
  }
}
