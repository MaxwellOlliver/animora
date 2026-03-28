import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { FastifyReply } from 'fastify';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    const res = context.switchToHttp().getResponse<FastifyReply>();
    const raw = res.raw;

    // Passport expects Express-style res.setHeader / res.end / res.redirect.
    // Fastify's raw ServerResponse has setHeader and end, but Passport
    // receives the Fastify reply object, not raw. Shim the missing methods.
    if (!('setHeader' in res)) {
      (res as any).setHeader = (key: string, value: string) => {
        raw.setHeader(key, value);
        return res;
      };
    }
    if (!('end' in res)) {
      (res as any).end = () => {
        raw.end();
        return res;
      };
    }

    return super.canActivate(context);
  }
}
