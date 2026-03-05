import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { S3Service } from '@/infra/s3/s3.service';

import { AvatarsRepository } from '../avatars.repository';

@Injectable()
export class DeleteAvatarUseCase {
  constructor(
    private readonly avatarsRepository: AvatarsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string): Promise<void> {
    const avatar = await this.avatarsRepository.findById(id);
    if (!avatar) throw new NotFoundException('Avatar not found');
    if (avatar.default) {
      throw new ConflictException('Default avatar cannot be deleted');
    }

    if (avatar.pictureKey) {
      await this.s3Service.delete(avatar.pictureKey);
    }

    await this.avatarsRepository.delete(id);
  }
}
