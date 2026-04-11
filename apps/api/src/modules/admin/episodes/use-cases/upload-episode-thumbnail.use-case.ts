import { MEDIA_PURPOSE } from '@animora/contracts';
import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import { EpisodesRepository } from '../episodes.repository';

@Injectable()
export class UploadEpisodeThumbnailUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');

    if (episode.thumbnailId) {
      await this.deleteMediaUseCase.execute(episode.thumbnailId);
    }

    const media = await this.uploadMediaUseCase.execute(
      file,
      MEDIA_PURPOSE.episodeThumbnail,
    );

    await this.episodesRepository.update(id, { thumbnailId: media.id });
  }
}
