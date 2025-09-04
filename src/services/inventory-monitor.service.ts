import { ProductRepository, AlertRepository, UserRepository } from '@/lib/db/repositories';
import { NotificationService } from './notification.service';
import { Product, Alert, AlertSeverity } from '@/types';
import { ALERT_THRESHOLDS } from '@/lib/constants';

export class InventoryMonitorService {
  private static instance: InventoryMonitorService;
  private isProcessing: boolean = false;
  private processingQueue: string[] = [];
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): InventoryMonitorService {
    if (!InventoryMonitorService.instance) {
      InventoryMonitorService.instance = new InventoryMonitorService();
    }
    return InventoryMonitorService.instance;
  }

  async checkAllProducts(): Promise<Alert[]> {
    const products = await ProductRepository.findAll();
    const alerts: Alert[] = [];

    for (const product of products) {
      try {
        const productAlerts = await this.checkProduct(product);
        alerts.push(...productAlerts);
      } catch (error) {
        console.error(`Error checking product ${product._id}:`, error);
        // Continue processing other products even if one fails
      }
    }

    return alerts;
  }

  async checkProduct(product: Product): Promise<Alert[]> {
    const productId = product._id?.toString();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    // Prevent race condition by tracking products being processed
    if (this.processingQueue.includes(productId)) {
      console.log(`Product ${productId} is already being processed, skipping`);
      return [];
    }

    this.processingQueue.push(productId);

    try {
      const alerts: Alert[] = [];
      const severity = this.calculateSeverity(product.quantity, product.threshold);

      if (severity) {
        // Check for existing active alert to prevent duplicates
        const existingAlerts = await AlertRepository.findByProductId(productId);
        const hasActiveAlert = existingAlerts.some(
          (alert) => !alert.acknowledged && alert.severity === severity
        );

        if (!hasActiveAlert) {
          const alert = await this.createAlert(product, severity);
          if (alert) {
            alerts.push(alert);
            await this.notifyUsers(product, alert);
          }
        }
      }

      return alerts;
    } finally {
      // Always remove from processing queue
      const index = this.processingQueue.indexOf(productId);
      if (index > -1) {
        this.processingQueue.splice(index, 1);
      }
    }
  }

  private calculateSeverity(quantity: number, threshold: number): AlertSeverity | null {
    if (quantity <= 0) {
      return 'critical';
    }
    
    const percentage = (quantity / threshold) * 100;

    if (percentage <= ALERT_THRESHOLDS.CRITICAL) {
      return 'critical';
    } else if (percentage <= ALERT_THRESHOLDS.WARNING) {
      return 'warning';
    } else if (percentage <= ALERT_THRESHOLDS.LOW) {
      return 'low';
    }

    return null;
  }

  private async createAlert(product: Product, severity: AlertSeverity): Promise<Alert | null> {
    if (!product._id) {
      console.error('Cannot create alert: Product ID is missing');
      return null;
    }

    const alertData = {
      productId: product._id.toString(),
      productName: product.name,
      currentQuantity: product.quantity,
      threshold: product.threshold,
      severity,
      message: this.generateAlertMessage(product, severity),
      acknowledged: false,
      createdAt: new Date(),
    };

    try {
      const alert = await AlertRepository.create(alertData);
      return alert;
    } catch (error) {
      console.error('Failed to create alert:', error);
      return null;
    }
  }

  private generateAlertMessage(product: Product, severity: AlertSeverity): string {
    const messages: Record<AlertSeverity, string> = {
      critical: `CRITICAL: ${product.name} is out of stock or critically low (${product.quantity} remaining)`,
      warning: `WARNING: ${product.name} stock is running low (${product.quantity}/${product.threshold})`,
      low: `LOW: ${product.name} is approaching threshold (${product.quantity}/${product.threshold})`,
    };

    return messages[severity];
  }

  private async notifyUsers(product: Product, alert: Alert): Promise<void> {
    try {
      const users = await UserRepository.findByNotificationPreference(alert.severity);

      const notificationPromises = users.map(async (user) => {
        try {
          await this.notificationService.sendAlert(user, alert);
        } catch (error) {
          console.error(`Failed to notify user ${user._id}:`, error);
          // Don't throw - continue notifying other users
        }
      });

      await Promise.allSettled(notificationPromises);
    } catch (error) {
      console.error('Error fetching users for notification:', error);
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<Alert | null> {
    try {
      const alert = await AlertRepository.acknowledge(alertId, userId);
      return alert;
    } catch (error) {
      console.error(`Failed to acknowledge alert ${alertId}:`, error);
      throw error;
    }
  }

  getProcessingStatus(): { isProcessing: boolean; queueLength: number } {
    return {
      isProcessing: this.processingQueue.length > 0,
      queueLength: this.processingQueue.length,
    };
  }
}

export const inventoryMonitorService = InventoryMonitorService.getInstance();
