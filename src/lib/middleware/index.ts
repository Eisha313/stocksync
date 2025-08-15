export {
  withValidation,
  withQueryValidation,
  type ValidatedRequest,
} from './validate';

export {
  withErrorHandler,
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
} from './error-handler';

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { withValidation, ValidatedRequest } from './validate';
import { withErrorHandler } from './error-handler';

/**
 * Compose multiple middlewares together
 * Usage: withMiddleware(withErrorHandler, withAuth)(handler)
 */
export function compose<T>(
  ...middlewares: Array<
    (handler: (req: NextRequest, ctx?: any) => Promise<NextResponse>) =>
      (req: NextRequest, ctx?: any) => Promise<NextResponse>
  >
) {
  return (handler: (req: NextRequest, ctx?: any) => Promise<NextResponse>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Helper to create a validated and error-handled route
 */
export function createValidatedRoute<T>(
  schema: ZodSchema<T>,
  handler: (req: ValidatedRequest<T>) => Promise<NextResponse>
) {
  return withErrorHandler(withValidation(schema, handler));
}
