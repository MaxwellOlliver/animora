import { Injectable } from '@nestjs/common';

import { UserRegistrationPort } from '../../users/ports/user-registration.port';
import { UsersRepository } from '../../users/users.repository';
import type { GoogleProfile } from '../strategies/google.strategy';
import { LoginUseCase } from './login.use-case';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userRegistration: UserRegistrationPort,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(profile: GoogleProfile) {
    let user = await this.usersRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const existingByEmail = await this.usersRepository.findByEmail(
        profile.email,
      );

      if (existingByEmail) {
        user = await this.usersRepository.update(existingByEmail.id, {
          googleId: profile.googleId,
        });
      } else {
        user = await this.userRegistration.registerWithGoogle({
          email: profile.email,
          googleId: profile.googleId,
          profileName: profile.name,
        });
      }
    }

    return this.loginUseCase.execute(user);
  }
}
