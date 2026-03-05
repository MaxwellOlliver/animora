import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Avatar } from '../avatar.entity';
import { AvatarsRepository } from '../avatars.repository';
import type { UpdateAvatarDto } from '../dto/update-avatar.dto';

@Injectable()
export class UpdateAvatarUseCase {
  constructor(private readonly avatarsRepository: AvatarsRepository) {}

  async execute(id: string, dto: UpdateAvatarDto): Promise<Avatar> {
    const avatar = await this.avatarsRepository.findById(id);
    if (!avatar) throw new NotFoundException('Avatar not found');

    if (dto.name && dto.name !== avatar.name) {
      const existing = await this.avatarsRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictException('Avatar with this name already exists');
      }
    }

    if (dto.default === true) {
      await this.avatarsRepository.unsetDefault(id);
    }

    const pictureKey =
      dto.pictureKey !== undefined ? dto.pictureKey : avatar.pictureKey;
    const active = dto.active !== undefined ? dto.active : avatar.active;
    if (active && !pictureKey) {
      throw new BadRequestException(
        'Avatar without pictureKey cannot be active',
      );
    }

    return this.avatarsRepository.update(id, dto);
  }
}
