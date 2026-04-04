import { getLogger } from '@animora/logger';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = getLogger({ appName: 'animora@api' }).child({
    scope: 'auth-refresh',
  });

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const request = context.switchToHttp().getRequest<{
        method?: string;
        url?: string;
      }>();

      this.logger.warn('guard-rejected', {
        error: err,
        info,
        method: request.method ?? null,
        path: request.url ?? null,
      });

      if (err instanceof Error) {
        throw err;
      }

      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
