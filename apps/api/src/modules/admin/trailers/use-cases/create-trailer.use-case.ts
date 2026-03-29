import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SeriesRepository } from '../../series/repositories/series.repository';
import type { CreateTrailerDto } from '../dto/create-trailer.dto';
import type { Trailer } from '../trailer.entity';
import { TrailersRepository } from '../trailers.repository';

@Injectable()
export class CreateTrailerUseCase {
  constructor(
    private readonly trailersRepository: TrailersRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(dto: CreateTrailerDto): Promise<Trailer> {
    const seriesEntity = await this.seriesRepository.findById(dto.seriesId);
    if (!seriesEntity) throw new NotFoundException('Series not found');

    const conflict = await this.trailersRepository.findBySeriesIdAndNumber(
      dto.seriesId,
      dto.number,
    );
    if (conflict) {
      throw new ConflictException(
        `A trailer with number ${dto.number} already exists for this series`,
      );
    }

    return this.trailersRepository.create({
      seriesId: dto.seriesId,
      playlistId: dto.playlistId,
      number: dto.number,
      title: dto.title,
      durationSeconds: dto.durationSeconds,
    });
  }
}
