import { NextRequest } from 'next/server';
import { AlertRepository } from '@/lib/db/repositories';
import { ApiResponse } from '@/lib/api/response';
import { validateAlert, validateAlertUpdate } from '@/lib/validators/alert';
import { AlertStatus, AlertType } from '@/types';

export class AlertController {
  private alertRepository: AlertRepository;

  constructor() {
    this.alertRepository = new AlertRepository();
  }

  async getAll(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const status = searchParams.get('status') as AlertStatus | null;
      const type = searchParams.get('type') as AlertType | null;
      const unacknowledged = searchParams.get('unacknowledged') === 'true';

      if (!userId) {
        return ApiResponse.badRequest('userId is required');
      }

      let alerts;

      if (unacknowledged) {
        alerts = await this.alertRepository.findUnacknowledged(userId);
      } else if (status) {
        alerts = await this.alertRepository.findByStatus(userId, status);
      } else if (type) {
        alerts = await this.alertRepository.findByType(userId, type);
      } else {
        alerts = await this.alertRepository.findByUserId(userId);
      }

      return ApiResponse.success(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return ApiResponse.error('Failed to fetch alerts');
    }
  }

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const validation = validateAlert(body);

      if (!validation.success) {
        return ApiResponse.badRequest(validation.error.errors[0].message);
      }

      const alert = await this.alertRepository.create(validation.data);
      return ApiResponse.created(alert);
    } catch (error) {
      console.error('Error creating alert:', error);
      return ApiResponse.error('Failed to create alert');
    }
  }

  async getById(id: string) {
    try {
      const alert = await this.alertRepository.findById(id);

      if (!alert) {
        return ApiResponse.notFound('Alert not found');
      }

      return ApiResponse.success(alert);
    } catch (error) {
      console.error('Error fetching alert:', error);
      return ApiResponse.error('Failed to fetch alert');
    }
  }

  async update(id: string, request: NextRequest) {
    try {
      const body = await request.json();
      const validation = validateAlertUpdate(body);

      if (!validation.success) {
        return ApiResponse.badRequest(validation.error.errors[0].message);
      }

      const alert = await this.alertRepository.update(id, validation.data);

      if (!alert) {
        return ApiResponse.notFound('Alert not found');
      }

      return ApiResponse.success(alert);
    } catch (error) {
      console.error('Error updating alert:', error);
      return ApiResponse.error('Failed to update alert');
    }
  }

  async acknowledge(id: string) {
    try {
      const alert = await this.alertRepository.acknowledge(id);

      if (!alert) {
        return ApiResponse.notFound('Alert not found');
      }

      return ApiResponse.success(alert);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return ApiResponse.error('Failed to acknowledge alert');
    }
  }

  async resolve(id: string) {
    try {
      const alert = await this.alertRepository.resolve(id);

      if (!alert) {
        return ApiResponse.notFound('Alert not found');
      }

      return ApiResponse.success(alert);
    } catch (error) {
      console.error('Error resolving alert:', error);
      return ApiResponse.error('Failed to resolve alert');
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.alertRepository.delete(id);

      if (!deleted) {
        return ApiResponse.notFound('Alert not found');
      }

      return ApiResponse.success({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert:', error);
      return ApiResponse.error('Failed to delete alert');
    }
  }

  async getStats(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return ApiResponse.badRequest('userId is required');
      }

      const [allAlerts, unacknowledged, critical, warning] = await Promise.all([
        this.alertRepository.findByUserId(userId),
        this.alertRepository.findUnacknowledged(userId),
        this.alertRepository.findByType(userId, 'critical'),
        this.alertRepository.findByType(userId, 'warning'),
      ]);

      const stats = {
        total: allAlerts.length,
        unacknowledged: unacknowledged.length,
        critical: critical.length,
        warning: warning.length,
        acknowledged: allAlerts.filter(a => a.acknowledgedAt).length,
        resolved: allAlerts.filter(a => a.status === 'resolved').length,
      };

      return ApiResponse.success(stats);
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      return ApiResponse.error('Failed to fetch alert statistics');
    }
  }
}

export const alertController = new AlertController();
