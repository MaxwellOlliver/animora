import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller.js';
import { UsersRepository } from './repositories/users.repository.js';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { GetUserUseCase } from './use-cases/get-user.use-case.js';

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, CreateUserUseCase, GetUserUseCase],
  exports: [UsersRepository, CreateUserUseCase],
})
export class UsersModule {}
