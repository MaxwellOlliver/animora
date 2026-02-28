import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { LoginUseCase } from './login.use-case.js';
import type { GoogleProfile } from '../strategies/google.strategy.js';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(profile: GoogleProfile) {
    let user = await this.usersRepository.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.usersRepository.findByEmail(profile.email);
      if (user) {
        user = await this.usersRepository.update(user.id, {
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl ?? user.avatarUrl,
        });
      } else {
        user = await this.usersRepository.create({
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          googleId: profile.googleId,
          provider: 'GOOGLE',
        });
      }
    }

    return this.loginUseCase.execute(user);
  }
}
