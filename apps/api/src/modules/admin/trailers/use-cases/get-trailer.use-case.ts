import { Injectable, NotFoundException } from '@nestjs/common';

import { TrailersRepository, type TrailerWithMedia } from '../trailers.repository';

@Injectable()
export class GetTrailerUseCase {
  constructor(private readonly trailersRepository: TrailersRepository) {}

  async execute(id: string): Promise<TrailerWithMedia> {
    const trailer = await this.trailersRepository.findById(id);
    if (!trailer) throw new NotFoundException('Trailer not found');
    return trailer;
  }
}
