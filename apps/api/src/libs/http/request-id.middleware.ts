import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incomingRequestId = req.header('x-request-id')?.trim();

    const requestId =
      incomingRequestId && incomingRequestId.length <= 128
        ? incomingRequestId
        : randomUUID();

    (req as RequestWithId).requestId = requestId;

    res.setHeader('x-request-id', requestId);

    next();
  }
}
