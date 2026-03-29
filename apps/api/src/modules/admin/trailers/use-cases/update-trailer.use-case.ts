import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { UpdateTrailerDto } from '../dto/update-trailer.dto';
import type { Trailer } from '../trailer.entity';
import { TrailersRepository } from '../trailers.repository';

@Injectable()
export class UpdateTrailerUseCase {
  constructor(private readonly trailersRepository: TrailersRepository) {}

  async execute(id: string, dto: UpdateTrailerDto): Promise<Trailer> {
    const trailer = await this.trailersRepository.findById(id);
    if (!trailer) throw new NotFoundException('Trailer not found');

    if (dto.number !== undefined && dto.number !== trailer.number) {
      const conflict = await this.trailersRepository.findBySeriesIdAndNumber(
        trailer.seriesId,
        dto.number,
      );
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `A trailer with number ${dto.number} already exists for this series`,
        );
      }
    }

    return this.trailersRepository.update(id, dto);
  }
}
