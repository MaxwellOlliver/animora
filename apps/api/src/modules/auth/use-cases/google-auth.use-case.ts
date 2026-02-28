import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository.js';
import { CreateProfileUseCase } from '../../profiles/use-cases/create-profile.use-case.js';
import { LoginUseCase } from './login.use-case.js';
import type { GoogleProfile } from '../strategies/google.strategy.js';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(profile: GoogleProfile) {
    let user = await this.usersRepository.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.usersRepository.findByEmail(profile.email);
      if (user) {
        user = await this.usersRepository.update(user.id, {
          googleId: profile.googleId,
        });
      } else {
        user = await this.usersRepository.create({
          email: profile.email,
          googleId: profile.googleId,
          provider: 'GOOGLE',
        });
        await this.createProfileUseCase.execute({
          userId: user.id,
          name: profile.name,
        });
      }
    }

    return this.loginUseCase.execute(user);
  }
}
