import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { FastifyReply } from 'fastify';

/**
 * Passport expects Express-style `res.setHeader()` / `res.end()` but NestJS
 * hands it the Fastify reply object. Shim the missing methods onto the reply
 * by delegating to the underlying `http.ServerResponse`.
 */
function shimPassportMethods(reply: FastifyReply): void {
  const raw = reply.raw;
  const patched = reply as FastifyReply & {
    setHeader: typeof raw.setHeader;
    end: typeof raw.end;
  };

  patched.setHeader ??= (key, value) => {
    raw.setHeader(key, value);
    return raw;
  };

  patched.end ??= () => {
    raw.end();
    return raw;
  };
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    shimPassportMethods(context.switchToHttp().getResponse<FastifyReply>());
    return super.canActivate(context);
  }
}
