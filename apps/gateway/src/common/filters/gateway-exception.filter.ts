import { getLogger } from '@animora/logger';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

type HttpErrorResponse = {
  message?: string | string[];
  error?: string;
};

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = getLogger().child({ scope: 'gateway-exception' });

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as string | HttpErrorResponse;
      const errorResponse = this.normalizeHttpErrorResponse(body, status);

      response.status(status).send({
        statusCode: status,
        timestamp,
        path: request.url,
        ...errorResponse,
      });
      return;
    }

    this.logger.error('unhandled-exception', {
      error: exception,
      method: request.method,
      path: request.url,
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp,
      path: request.url,
    });
  }

  private normalizeHttpErrorResponse(
    body: string | HttpErrorResponse,
    status: number,
  ): { message: string | string[]; error: string } {
    if (typeof body === 'string') {
      return {
        message: body,
        error: this.defaultErrorLabel(status),
      };
    }

    return {
      message: body.message ?? this.defaultErrorLabel(status),
      error: body.error ?? this.defaultErrorLabel(status),
    };
  }

  private defaultErrorLabel(status: HttpStatus): string {
    return (
      Object.entries(HttpStatus).find(([, value]) => value === status)?.[0] ??
      'Error'
    )
      .split('_')
      .map((part) => part[0] + part.slice(1).toLowerCase())
      .join(' ');
  }
}
