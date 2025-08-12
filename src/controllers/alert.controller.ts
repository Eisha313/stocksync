import { NextRequest } from 'next/server';
import { AlertRepository } from '@/lib/db/repositories';
import { validateAlert, validateAlertUpdate } from '@/lib/validators/alert';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response';
import { ObjectId } from 'mongodb';
import { AlertStatus } from '@/types';

export class AlertController {
  static async getAll(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const status = searchParams.get('status') as AlertStatus | null;
      const unacknowledged = searchParams.get('unacknowledged');

      let alerts;

      if (unacknowledged === 'true' && userId) {
        alerts = await AlertRepository.findUnacknowledged(userId);
      } else if (userId && status) {
        alerts = await AlertRepository.findByUserAndStatus(userId, status);
      } else if (userId) {
        alerts = await AlertRepository.findByUserId(userId);
      } else {
        alerts = await AlertRepository.findAll();
      }

      return successResponse(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return errorResponse('Failed to fetch alerts');
    }
  }

  static async create(request: NextRequest) {
    try {
      const body = await request.json();
      const validation = validateAlert(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.errors);
      }

      const alert = await AlertRepository.create(validation.data);
      return successResponse(alert, 201);
    } catch (error) {
      console.error('Error creating alert:', error);
      return errorResponse('Failed to create alert');
    }
  }

  static async getById(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid alert ID format' }]);
      }

      const alert = await AlertRepository.findById(id);

      if (!alert) {
        return notFoundResponse('Alert not found');
      }

      return successResponse(alert);
    } catch (error) {
      console.error('Error fetching alert:', error);
      return errorResponse('Failed to fetch alert');
    }
  }

  static async update(id: string, request: NextRequest) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid alert ID format' }]);
      }

      const body = await request.json();
      const validation = validateAlertUpdate(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.errors);
      }

      const alert = await AlertRepository.update(id, {
        ...validation.data,
        updatedAt: new Date(),
      });

      if (!alert) {
        return notFoundResponse('Alert not found');
      }

      return successResponse(alert);
    } catch (error) {
      console.error('Error updating alert:', error);
      return errorResponse('Failed to update alert');
    }
  }

  static async delete(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid alert ID format' }]);
      }

      const deleted = await AlertRepository.delete(id);

      if (!deleted) {
        return notFoundResponse('Alert not found');
      }

      return successResponse({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert:', error);
      return errorResponse('Failed to delete alert');
    }
  }

  static async acknowledge(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid alert ID format' }]);
      }

      const alert = await AlertRepository.acknowledge(id);

      if (!alert) {
        return notFoundResponse('Alert not found');
      }

      return successResponse(alert);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return errorResponse('Failed to acknowledge alert');
    }
  }
}
