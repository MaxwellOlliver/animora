import { ConflictException, Injectable } from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { UserRegistrationPort } from '../ports/user-registration.port';
import { User } from '../user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userRegistration: UserRegistrationPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    return this.userRegistration.registerLocal({
      email: dto.email,
      password: dto.password,
      profileName: dto.profileName,
    });
  }
}
