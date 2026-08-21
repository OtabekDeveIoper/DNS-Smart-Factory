import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { RequestWithId } from '../http/request-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const http = context.switchToHttp();

    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();

    const startedAt = Date.now();

    this.logger.log(
      JSON.stringify({
        event: 'http_request',
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
      }),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            JSON.stringify({
              event: 'http_response',
              requestId: request.requestId,
              method: request.method,
              path: request.originalUrl,
              statusCode: response.statusCode,
              durationMs: Date.now() - startedAt,
            }),
          );
        },

        error: (error: unknown) => {
          const statusCode =
            error instanceof HttpException ? error.getStatus() : 500;

          this.logger.error(
            JSON.stringify({
              event: 'http_error',
              requestId: request.requestId,
              method: request.method,
              path: request.originalUrl,
              statusCode,
              durationMs: Date.now() - startedAt,
            }),
          );
        },
      }),
    );
  }
}
