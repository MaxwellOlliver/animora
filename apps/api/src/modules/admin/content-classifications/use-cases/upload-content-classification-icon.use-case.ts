import { MEDIA_PURPOSE } from '@animora/contracts';
import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import type { ContentClassification } from '../content-classification.entity';
import { ContentClassificationsRepository } from '../content-classifications.repository';

@Injectable()
export class UploadContentClassificationIconUseCase {
  constructor(
    private readonly repo: ContentClassificationsRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(
    id: string,
    file: MultipartFile,
  ): Promise<ContentClassification> {
    const classification = await this.repo.findById(id);
    if (!classification)
      throw new NotFoundException('Content classification not found');

    if (classification.iconId) {
      await this.deleteMediaUseCase.execute(classification.iconId);
    }

    const media = await this.uploadMediaUseCase.execute(
      file,
      MEDIA_PURPOSE.classificationIcon,
    );

    return this.repo.update(id, { iconId: media.id });
  }
}
