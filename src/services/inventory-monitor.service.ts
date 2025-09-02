import { ProductRepository, AlertRepository, UserRepository } from '@/lib/db/repositories';
import { NotificationService } from './notification.service';
import { Alert, AlertStatus, AlertPriority, Product } from '@/types';
import { ObjectId, WithId } from 'mongodb';

interface MonitoringResult {
  productsChecked: number;
  alertsCreated: number;
  alertsResolved: number;
  errors: string[];
}

export class InventoryMonitorService {
  private productRepository: ProductRepository;
  private alertRepository: AlertRepository;
  private userRepository: UserRepository;
  private notificationService: NotificationService;
  private isRunning: boolean = false;
  private abortController: AbortController | null = null;

  constructor() {
    this.productRepository = new ProductRepository();
    this.alertRepository = new AlertRepository();
    this.userRepository = new UserRepository();
    this.notificationService = new NotificationService();
  }

  async checkAllProducts(): Promise<MonitoringResult> {
    if (this.isRunning) {
      return {
        productsChecked: 0,
        alertsCreated: 0,
        alertsResolved: 0,
        errors: ['Monitoring is already running'],
      };
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    const result: MonitoringResult = {
      productsChecked: 0,
      alertsResolved: 0,
      alertsCreated: 0,
      errors: [],
    };

    try {
      const products = await this.productRepository.findMany({});
      result.productsChecked = products.length;

      // Process products in batches to prevent memory issues
      const batchSize = 50;
      for (let i = 0; i < products.length; i += batchSize) {
        if (this.abortController?.signal.aborted) {
          result.errors.push('Monitoring was aborted');
          break;
        }

        const batch = products.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((product) => this.checkProduct(product))
        );

        for (const batchResult of batchResults) {
          if (batchResult.status === 'fulfilled') {
            result.alertsCreated += batchResult.value.alertsCreated;
            result.alertsResolved += batchResult.value.alertsResolved;
          } else {
            result.errors.push(batchResult.reason?.message || 'Unknown error');
          }
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      return result;
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  stopMonitoring(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async checkProduct(
    product: WithId<Product>
  ): Promise<{ alertsCreated: number; alertsResolved: number }> {
    let alertsCreated = 0;
    let alertsResolved = 0;

    const isLowStock = product.quantity <= product.lowStockThreshold;
    const isCriticalStock = product.quantity <= product.criticalStockThreshold;

    const existingAlert = await this.alertRepository.findOne({
      productId: product._id,
      status: { $in: [AlertStatus.PENDING, AlertStatus.SENT] },
    });

    if (isLowStock || isCriticalStock) {
      const priority = isCriticalStock ? AlertPriority.CRITICAL : AlertPriority.HIGH;

      if (!existingAlert) {
        await this.createAlert(product, priority);
        alertsCreated++;
      } else if (existingAlert.priority !== priority) {
        await this.alertRepository.updateById(existingAlert._id, {
          priority,
          message: this.generateAlertMessage(product, priority),
        });
      }
    } else if (existingAlert) {
      await this.alertRepository.updateById(existingAlert._id, {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
      });
      alertsResolved++;
    }

    return { alertsCreated, alertsResolved };
  }

  private async createAlert(product: WithId<Product>, priority: AlertPriority): Promise<void> {
    const alert = await this.alertRepository.create({
      productId: product._id,
      userId: product.userId,
      type: 'low_stock',
      priority,
      status: AlertStatus.PENDING,
      message: this.generateAlertMessage(product, priority),
      threshold: priority === AlertPriority.CRITICAL
        ? product.criticalStockThreshold
        : product.lowStockThreshold,
      currentQuantity: product.quantity,
    } as Alert);

    // Send notifications asynchronously - don't block
    this.sendAlertNotifications(alert as WithId<Alert>, product).catch((error) => {
      console.error('Failed to send alert notifications:', error);
    });
  }

  private async sendAlertNotifications(
    alert: WithId<Alert>,
    product: WithId<Product>
  ): Promise<void> {
    const user = await this.userRepository.findById(product.userId);
    if (!user) return;

    // Send email notification
    await this.notificationService.sendEmail({
      to: user.email,
      subject: `Stock Alert: ${product.name}`,
      body: alert.message,
    });

    // Send SMS if user has premium and phone number
    if (user.isPremium && user.phone) {
      await this.notificationService.sendSMS({
        to: user.phone,
        message: `StockSync Alert: ${product.name} is running low (${product.quantity} remaining)`,
      });
    }

    await this.alertRepository.updateById(alert._id, {
      status: AlertStatus.SENT,
      sentAt: new Date(),
    });
  }

  private generateAlertMessage(product: WithId<Product>, priority: AlertPriority): string {
    const severityText = priority === AlertPriority.CRITICAL ? 'CRITICAL' : 'Low';
    return `${severityText} stock alert for "${product.name}": Only ${product.quantity} units remaining (threshold: ${priority === AlertPriority.CRITICAL ? product.criticalStockThreshold : product.lowStockThreshold})`;
  }

  async checkSingleProduct(productId: string | ObjectId): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (product) {
      await this.checkProduct(product);
    }
  }

  async getMonitoringStatus(): Promise<{ isRunning: boolean }> {
    return { isRunning: this.isRunning };
  }
}

export const inventoryMonitorService = new InventoryMonitorService();
