import { Injectable, NotFoundException } from '@nestjs/common';
import { AnimesRepository } from '../animes.repository';
import type { AnimeWithDetails } from '../anime.entity';

@Injectable()
export class GetAnimeUseCase {
  constructor(private readonly animesRepository: AnimesRepository) {}

  async execute(id: string): Promise<AnimeWithDetails> {
    const anime = await this.animesRepository.findById(id);
    if (!anime) throw new NotFoundException('Anime not found');
    return anime;
  }
}
