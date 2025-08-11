import { NextRequest } from 'next/server';
import { AlertRepository } from '@/lib/db/repositories';
import { apiResponse, apiError, withErrorHandler } from '@/lib/api/response';
import { updateAlertSchema } from '@/lib/validators/alert';
import { ObjectId } from 'mongodb';

const alertRepository = new AlertRepository();

interface RouteParams {
  params: { id: string };
}

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return apiError('Invalid alert ID format', 400);
  }

  const alert = await alertRepository.findById(id);
  
  if (!alert) {
    return apiError('Alert not found', 404);
  }

  return apiResponse(alert);
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return apiError('Invalid alert ID format', 400);
  }

  const body = await request.json();
  
  const validation = updateAlertSchema.safeParse(body);
  if (!validation.success) {
    return apiError(validation.error.errors[0].message, 400);
  }

  const existingAlert = await alertRepository.findById(id);
  if (!existingAlert) {
    return apiError('Alert not found', 404);
  }

  const updateData = {
    ...validation.data,
    updatedAt: new Date(),
  };

  // If status is being updated to 'sent', add sentAt timestamp
  if (validation.data.status === 'sent' && existingAlert.status !== 'sent') {
    (updateData as Record<string, unknown>).sentAt = new Date();
  }

  const alert = await alertRepository.update(id, updateData);
  return apiResponse(alert);
});

export const DELETE = withErrorHandler(async (
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

  await alertRepository.delete(id);
  return apiResponse({ message: 'Alert deleted successfully' });
});
