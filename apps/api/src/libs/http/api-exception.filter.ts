import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { RequestWithId } from './request-id.middleware';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
  code?: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const parsedBody =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as HttpExceptionBody)
        : null;

    const message = this.resolveMessage(
      exception,
      exceptionResponse,
      statusCode,
    );

    const code = parsedBody?.code ?? this.defaultErrorCode(statusCode);

    const body = {
      statusCode,
      code,
      message,
      path: request.originalUrl,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 500) {
      this.logger.error(
        JSON.stringify({
          event: 'http_exception',
          requestId: request.requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode,
          error:
            exception instanceof Error ? exception.message : 'Unknown error',
        }),
      );
    }

    response.status(statusCode).json(body);
  }

  private resolveMessage(
    exception: unknown,
    exceptionResponse: string | object | null,
    statusCode: number,
  ): string | string[] {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as HttpExceptionBody).message;

      if (message) {
        return message;
      }
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      exception instanceof Error &&
      statusCode < HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private defaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'UNPROCESSABLE_ENTITY';
      case 429:
        return 'RATE_LIMITED';
      default:
        return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR';
    }
  }
}
