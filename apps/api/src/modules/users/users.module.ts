import { Module } from '@nestjs/common';

import { AvatarsModule } from '../admin/avatars/avatars.module';
import { UserRegistrationPort } from './ports/user-registration.port';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { DrizzleUserRegistration } from './user-registration.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

@Module({
  imports: [AvatarsModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    CreateUserUseCase,
    GetUserUseCase,
    { provide: UserRegistrationPort, useClass: DrizzleUserRegistration },
  ],
  exports: [UsersRepository, CreateUserUseCase, UserRegistrationPort],
})
export class UsersModule {}
