import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';
import { Server, type ServerOptions } from 'socket.io';

export class FastifyRedisIoAdapter extends IoAdapter {
  private sharedServer: Server | null = null;

  constructor(
    app: ConstructorParameters<typeof IoAdapter>[0],
    private readonly redis: Redis,
  ) {
    super(app);
  }

  createIOServer(_port: number, options?: ServerOptions): Server {
    if (!this.sharedServer) {
      const server = new Server(options);
      const pubClient = this.redis.duplicate();
      const subClient = this.redis.duplicate();
      server.adapter(createAdapter(pubClient, subClient));
      this.sharedServer = server;
    }
    return this.sharedServer;
  }

  attach(httpServer: unknown): void {
    if (!this.sharedServer) return;
    (this.sharedServer as unknown as { attach: (s: unknown) => void }).attach(
      httpServer,
    );
  }
}
