import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import type { Avatar } from '../avatar.entity';
import { AvatarsRepository } from '../avatars.repository';
import type { CreateAvatarDto } from '../dto/create-avatar.dto';

@Injectable()
export class CreateAvatarUseCase {
  constructor(private readonly avatarsRepository: AvatarsRepository) {}

  async execute(dto: CreateAvatarDto): Promise<Avatar> {
    const existing = await this.avatarsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Avatar with this name already exists');
    }

    const shouldBeDefault = dto.default ?? false;
    if (shouldBeDefault) {
      await this.avatarsRepository.unsetDefault();
    }

    return this.avatarsRepository.create({
      name: dto.name,
      active: dto.active ?? false,
      default: shouldBeDefault,
    });
  }
}
