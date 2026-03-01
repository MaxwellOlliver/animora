import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy,
  ) {}

  async emit<T>(event: string, data: T): Promise<void> {
    await lastValueFrom(this.client.emit(event, data));
  }
}
