import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';

export type ApiHandler<T = unknown> = (
  request: Request,
  context?: { params: Record<string, string> }
) => Promise<NextResponse<T>>;

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

function formatZodError(error: ZodError): string {
  const messages = error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
  return messages.join(', ');
}

function formatMongoError(error: MongoError): { message: string; statusCode: number } {
  // Handle duplicate key error
  if (error.code === 11000) {
    return {
      message: 'A resource with this identifier already exists',
      statusCode: 409,
    };
  }

  // Handle other common MongoDB errors
  if (error.message.includes('E11000')) {
    return {
      message: 'Duplicate key error',
      statusCode: 409,
    };
  }

  return {
    message: 'Database operation failed',
    statusCode: 500,
  };
}

export function withErrorHandler<T>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (request: Request, context?: { params: Record<string, string> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      // Handle known error types
      if (error instanceof AppError) {
        return ApiResponse.error(error.message, error.statusCode);
      }

      if (error instanceof ZodError) {
        const message = formatZodError(error);
        return ApiResponse.error(message, 400);
      }

      if (error instanceof MongoError) {
        const { message, statusCode } = formatMongoError(error);
        return ApiResponse.error(message, statusCode);
      }

      // Handle JSON parse errors
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return ApiResponse.error('Invalid JSON in request body', 400);
      }

      // Handle TypeError for missing required fields
      if (error instanceof TypeError) {
        return ApiResponse.error('Invalid request format', 400);
      }

      // Handle generic errors
      if (error instanceof Error) {
        // Don't expose internal error messages in production
        const message = process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message;
        return ApiResponse.error(message, 500);
      }

      return ApiResponse.error('An unexpected error occurred', 500);
    }
  };
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}
