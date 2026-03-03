import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
