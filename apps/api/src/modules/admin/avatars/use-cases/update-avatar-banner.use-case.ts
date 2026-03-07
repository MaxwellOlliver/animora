import { MEDIA_PURPOSE } from '@animora/contracts';
import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import { AvatarsRepository } from '../avatars.repository';

@Injectable()
export class UpdateAvatarBannerUseCase {
  constructor(
    private readonly avatarsRepository: AvatarsRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const avatar = await this.avatarsRepository.findById(id);
    if (!avatar) throw new NotFoundException('Avatar not found');

    if (avatar.pictureId) {
      await this.deleteMediaUseCase.execute(avatar.pictureId);
    }

    const media = await this.uploadMediaUseCase.execute(
      file,
      MEDIA_PURPOSE.userAvatar,
    );

    await this.avatarsRepository.update(id, { pictureId: media.id });
  }
}
