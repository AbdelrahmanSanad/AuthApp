import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Normalizes every error into a single JSON shape. Known HttpExceptions keep
 * their status/message; anything else becomes a 500 with the details logged
 * server-side and hidden from the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, error } = this.extractMessage(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }

  private extractMessage(
    exception: unknown,
    status: number,
  ): { message: string | string[]; error: string } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { message: res, error: exception.name };
      }
      const obj = res as { message?: string | string[]; error?: string };
      return {
        message: obj.message ?? exception.message,
        error: obj.error ?? exception.name,
      };
    }

    return {
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : 'Unexpected error',
      error: 'InternalServerError',
    };
  }
}
