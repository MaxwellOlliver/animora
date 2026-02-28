import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users.repository.js';
import { User } from '../user.entity.js';

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
