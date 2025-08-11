import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201);
}

export function errorResponse(
  message: string,
  status = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function notFoundResponse(resource = 'Resource'): NextResponse<ApiResponse<never>> {
  return errorResponse(`${resource} not found`, 404);
}

export function validationErrorResponse(
  errors: string[]
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      message: errors.join(', '),
    },
    { status: 400 }
  );
}

export function serverErrorResponse(
  error?: unknown
): NextResponse<ApiResponse<never>> {
  const message = error instanceof Error ? error.message : 'Internal server error';
  console.error('Server error:', error);
  return errorResponse(message, 500);
}

export function unauthorizedResponse(
  message = 'Unauthorized'
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(
  message = 'Forbidden'
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 403);
}
