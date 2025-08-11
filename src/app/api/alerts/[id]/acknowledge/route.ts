import { NextRequest } from 'next/server';
import { AlertRepository } from '@/lib/db/repositories';
import { apiResponse, apiError, withErrorHandler } from '@/lib/api/response';
import { ObjectId } from 'mongodb';

const alertRepository = new AlertRepository();

interface RouteParams {
  params: { id: string };
}

export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return apiError('Invalid alert ID format', 400);
  }

  const existingAlert = await alertRepository.findById(id);
  if (!existingAlert) {
    return apiError('Alert not found', 404);
  }

  if (existingAlert.status === 'resolved') {
    return apiError('Alert is already resolved', 400);
  }

  if (existingAlert.status === 'acknowledged') {
    return apiError('Alert is already acknowledged', 400);
  }

  const alert = await alertRepository.update(id, {
    status: 'acknowledged',
    acknowledgedAt: new Date(),
    updatedAt: new Date(),
  });

  return apiResponse({
    message: 'Alert acknowledged successfully',
    alert,
  });
});
