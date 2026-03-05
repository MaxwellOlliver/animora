import { Injectable, NotFoundException } from '@nestjs/common';

import type { Avatar } from '../avatar.entity';
import { AvatarsRepository } from '../avatars.repository';

@Injectable()
export class GetAvatarUseCase {
  constructor(private readonly avatarsRepository: AvatarsRepository) {}

  async execute(id: string): Promise<Avatar> {
    const avatar = await this.avatarsRepository.findById(id);
    if (!avatar) throw new NotFoundException('Avatar not found');
    return avatar;
  }
}
