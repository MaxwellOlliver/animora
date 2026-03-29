import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';

import { TrailersRepository } from '../trailers.repository';

@Injectable()
export class DeleteTrailerUseCase {
  constructor(
    private readonly trailersRepository: TrailersRepository,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const trailer = await this.trailersRepository.findById(id);
    if (!trailer) throw new NotFoundException('Trailer not found');

    await this.trailersRepository.delete(id);

    if (trailer.thumbnailId) {
      await this.deleteMediaUseCase.execute(trailer.thumbnailId);
    }
  }
}
