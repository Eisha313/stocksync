import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@/lib/api/response';

export type ValidatedRequest<T> = NextRequest & {
  validatedBody: T;
};

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: ValidatedRequest<T>) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const validatedBody = schema.parse(body);
      
      const validatedReq = req as ValidatedRequest<T>;
      validatedReq.validatedBody = validatedBody;
      
      return handler(validatedReq);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return ApiResponse.badRequest('Validation failed', {
          errors: formattedErrors,
        });
      }
      
      if (error instanceof SyntaxError) {
        return ApiResponse.badRequest('Invalid JSON body');
      }
      
      throw error;
    }
  };
}

export function withQueryValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validatedQuery: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(req.url);
      const queryObject: Record<string, string> = {};
      
      searchParams.forEach((value, key) => {
        queryObject[key] = value;
      });
      
      const validatedQuery = schema.parse(queryObject);
      
      return handler(req, validatedQuery);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return ApiResponse.badRequest('Query validation failed', {
          errors: formattedErrors,
        });
      }
      
      throw error;
    }
  };
}
