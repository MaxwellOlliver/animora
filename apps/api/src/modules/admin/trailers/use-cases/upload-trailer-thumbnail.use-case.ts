import { MEDIA_PURPOSE } from '@animora/contracts';
import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import { TrailersRepository } from '../trailers.repository';

@Injectable()
export class UploadTrailerThumbnailUseCase {
  constructor(
    private readonly trailersRepository: TrailersRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const trailer = await this.trailersRepository.findById(id);
    if (!trailer) throw new NotFoundException('Trailer not found');

    if (trailer.thumbnailId) {
      await this.deleteMediaUseCase.execute(trailer.thumbnailId);
    }

    const media = await this.uploadMediaUseCase.execute(
      file,
      MEDIA_PURPOSE.trailerThumbnail,
    );

    await this.trailersRepository.update(id, { thumbnailId: media.id });
  }
}
