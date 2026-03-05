import { Injectable } from '@nestjs/common';

import type { Avatar } from '../avatar.entity';
import { AvatarsRepository } from '../avatars.repository';

@Injectable()
export class GetAvatarsUseCase {
  constructor(private readonly avatarsRepository: AvatarsRepository) {}

  async execute(): Promise<Avatar[]> {
    return this.avatarsRepository.findAll();
  }
}
