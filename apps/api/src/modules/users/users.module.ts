import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, CreateUserUseCase, GetUserUseCase],
  exports: [UsersRepository, CreateUserUseCase],
})
export class UsersModule {}
