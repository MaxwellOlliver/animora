import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { AvatarsRepository } from '@/modules/admin/avatars/avatars.repository';
import { profiles } from '@/modules/profiles/profile.entity';

import {
  RegisterLocalInput,
  RegisterWithGoogleInput,
  UserRegistrationPort,
} from './ports/user-registration.port';
import { User, users } from './user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class DrizzleUserRegistration implements UserRegistrationPort {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}

  async registerLocal(input: RegisterLocalInput): Promise<User> {
    const avatarId = await this.resolveDefaultAvatarId();
    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          provider: 'LOCAL',
        })
        .returning();

      await tx.insert(profiles).values({
        userId: user.id,
        name: input.profileName,
        avatarId,
      });

      return user;
    });
  }

  async registerWithGoogle(input: RegisterWithGoogleInput): Promise<User> {
    const avatarId = await this.resolveDefaultAvatarId();

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          googleId: input.googleId,
          provider: 'GOOGLE',
        })
        .returning();

      await tx.insert(profiles).values({
        userId: user.id,
        name: input.profileName,
        avatarId,
      });

      return user;
    });
  }

  private async resolveDefaultAvatarId(): Promise<string> {
    const defaultAvatar = await this.avatarsRepository.findDefault();
    if (!defaultAvatar) {
      throw new NotFoundException('No default avatar configured');
    }
    return defaultAvatar.id;
  }
}
