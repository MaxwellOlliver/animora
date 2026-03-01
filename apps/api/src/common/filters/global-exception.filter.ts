import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

type HttpErrorResponse = {
  message?: string | string[];
  error?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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

    if (this.isPgError(exception)) {
      const mapped = this.mapPgError(exception.code);
      this.logger.warn(
        `Database error ${exception.code} on ${request.method} ${request.url}`,
      );

      response.status(mapped.statusCode).send({
        statusCode: mapped.statusCode,
        message: mapped.message,
        error: mapped.error,
        timestamp,
        path: request.url,
      });
      return;
    }

    if (this.isAwsError(exception)) {
      this.logger.warn(
        `S3 error ${exception.name} on ${request.method} ${request.url}`,
      );

      response.status(HttpStatus.BAD_GATEWAY).send({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Storage service unavailable',
        error: 'Bad Gateway',
        timestamp,
        path: request.url,
      });
      return;
    }

    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

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

  private isPgError(
    exception: unknown,
  ): exception is { code: string; detail?: string } {
    return (
      !!exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as { code: unknown }).code === 'string' &&
      (exception as { code: string }).code.length === 5
    );
  }

  private mapPgError(code: string): {
    statusCode: number;
    message: string;
    error: string;
  } {
    switch (code) {
      case '23505':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          error: 'Conflict',
        };
      case '23503':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid related resource reference',
          error: 'Bad Request',
        };
      case '23502':
      case '22P02':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid request data',
          error: 'Bad Request',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          error: 'Internal Server Error',
        };
    }
  }

  private isAwsError(exception: unknown): exception is { name: string } {
    return (
      !!exception &&
      typeof exception === 'object' &&
      'name' in exception &&
      typeof (exception as { name: unknown }).name === 'string' &&
      '$metadata' in exception
    );
  }
}
