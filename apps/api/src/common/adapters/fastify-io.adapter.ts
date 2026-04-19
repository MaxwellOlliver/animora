import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, type ServerOptions } from 'socket.io';

export class FastifyIoAdapter extends IoAdapter {
  private sharedServer: Server | null = null;

  createIOServer(_port: number, options?: ServerOptions): Server {
    if (!this.sharedServer) {
      this.sharedServer = new Server(options);
    }
    return this.sharedServer;
  }

  attach(httpServer: unknown): void {
    if (!this.sharedServer) return;
    (
      this.sharedServer as unknown as { attach: (s: unknown) => void }
    ).attach(httpServer);
  }
}
