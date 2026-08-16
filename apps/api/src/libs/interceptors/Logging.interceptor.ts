import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const startedAt = Date.now();
    const { method, path } = request;

    this.logger.log(`${method} ${path} - REQUEST`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startedAt;

          this.logger.log(
            `${method} ${path} - RESPONSE ${response.statusCode} (${duration}ms)`,
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startedAt;
          const statusCode =
            error instanceof HttpException ? error.getStatus() : 500;

          this.logger.error(
            `${method} ${path} - ERROR ${statusCode} (${duration}ms)`,
          );
        },
      }),
    );
  }
}
