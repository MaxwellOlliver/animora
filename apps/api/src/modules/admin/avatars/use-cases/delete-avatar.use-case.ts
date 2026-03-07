import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';

import { AvatarsRepository } from '../avatars.repository';

@Injectable()
export class DeleteAvatarUseCase {
  constructor(
    private readonly avatarsRepository: AvatarsRepository,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const avatar = await this.avatarsRepository.findById(id);
    if (!avatar) throw new NotFoundException('Avatar not found');
    if (avatar.default) {
      throw new ConflictException('Default avatar cannot be deleted');
    }

    await this.avatarsRepository.delete(id);

    if (avatar.pictureId) {
      await this.deleteMediaUseCase.execute(avatar.pictureId);
    }
  }
}
