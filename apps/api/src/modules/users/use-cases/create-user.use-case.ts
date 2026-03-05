import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // TODO: Move to infrastructure layer
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
    });
  }
}
