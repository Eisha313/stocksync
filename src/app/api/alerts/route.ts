import { NextRequest } from 'next/server';
import { AlertRepository } from '@/lib/db/repositories';
import { apiResponse, apiError, withErrorHandler } from '@/lib/api/response';
import { createAlertSchema } from '@/lib/validators/alert';
import { AlertStatus } from '@/types';

const alertRepository = new AlertRepository();

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const productId = searchParams.get('productId');
  const status = searchParams.get('status') as AlertStatus | null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const query: Record<string, unknown> = {};
  
  if (userId) {
    query.userId = userId;
  }
  
  if (productId) {
    query.productId = productId;
  }
  
  if (status && ['pending', 'sent', 'acknowledged', 'resolved'].includes(status)) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const alerts = await alertRepository.findMany(query, { skip, limit, sort: { createdAt: -1 } });
  const total = await alertRepository.count(query);

  return apiResponse({
    alerts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = createAlertSchema.safeParse(body);
  if (!validation.success) {
    return apiError(validation.error.errors[0].message, 400);
  }

  const alertData = {
    ...validation.data,
    status: 'pending' as AlertStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const alert = await alertRepository.create(alertData);
  return apiResponse(alert, 201);
});
