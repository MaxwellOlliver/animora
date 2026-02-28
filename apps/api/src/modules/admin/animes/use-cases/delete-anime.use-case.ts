import { Injectable, NotFoundException } from '@nestjs/common';
import { AnimesRepository } from '../animes.repository';
import { S3Service } from '@/infra/s3/s3.service';

@Injectable()
export class DeleteAnimeUseCase {
  constructor(
    private readonly animesRepository: AnimesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string): Promise<void> {
    const anime = await this.animesRepository.findById(id);
    if (!anime) throw new NotFoundException('Anime not found');

    if (anime.bannerKey) {
      await this.s3Service.delete(anime.bannerKey);
    }

    await this.animesRepository.delete(id);
  }
}
