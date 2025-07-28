import { ProductRepository } from '@/lib/db/repositories/product.repository';
import { AlertRepository } from '@/lib/db/repositories/alert.repository';
import { Product, Alert, AlertType, AlertStatus } from '@/types';
import { LOW_STOCK_THRESHOLD, CRITICAL_STOCK_THRESHOLD } from '@/lib/constants';
import { ObjectId } from 'mongodb';

export interface ThresholdConfig {
  lowStockThreshold: number;
  criticalStockThreshold: number;
}

export interface MonitoringResult {
  productsChecked: number;
  alertsCreated: number;
  lowStockProducts: string[];
  criticalStockProducts: string[];
}

export class InventoryMonitorService {
  private productRepository: ProductRepository;
  private alertRepository: AlertRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.alertRepository = new AlertRepository();
  }

  async checkProductThreshold(
    product: Product,
    config: ThresholdConfig = {
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      criticalStockThreshold: CRITICAL_STOCK_THRESHOLD,
    }
  ): Promise<AlertType | null> {
    const { quantity, minStockLevel } = product;
    const effectiveThreshold = minStockLevel || config.lowStockThreshold;

    if (quantity <= config.criticalStockThreshold) {
      return 'critical';
    }

    if (quantity <= effectiveThreshold) {
      return 'low_stock';
    }

    return null;
  }

  async createAlertForProduct(
    product: Product,
    alertType: AlertType,
    userId: string
  ): Promise<Alert | null> {
    // Check if there's already an active alert for this product
    const existingAlerts = await this.alertRepository.findByProductId(
      product._id!.toString()
    );

    const hasActiveAlert = existingAlerts.some(
      (alert) =>
        alert.status === 'pending' &&
        alert.type === alertType
    );

    if (hasActiveAlert) {
      return null;
    }

    const alertData: Omit<Alert, '_id' | 'createdAt' | 'updatedAt'> = {
      userId: new ObjectId(userId),
      productId: product._id!,
      type: alertType,
      status: 'pending' as AlertStatus,
      message: this.generateAlertMessage(product, alertType),
      threshold: product.minStockLevel || LOW_STOCK_THRESHOLD,
      currentStock: product.quantity,
    };

    return this.alertRepository.create(alertData);
  }

  private generateAlertMessage(product: Product, alertType: AlertType): string {
    switch (alertType) {
      case 'critical':
        return `CRITICAL: ${product.name} is almost out of stock! Current quantity: ${product.quantity}`;
      case 'low_stock':
        return `Low Stock Alert: ${product.name} is running low. Current quantity: ${product.quantity}`;
      case 'out_of_stock':
        return `OUT OF STOCK: ${product.name} has no remaining inventory!`;
      case 'restock':
        return `Restock Reminder: ${product.name} needs to be restocked soon.`;
      default:
        return `Inventory alert for ${product.name}. Current quantity: ${product.quantity}`;
    }
  }

  async monitorUserInventory(
    userId: string,
    config?: ThresholdConfig
  ): Promise<MonitoringResult> {
    const products = await this.productRepository.findByUserId(userId);
    
    const result: MonitoringResult = {
      productsChecked: products.length,
      alertsCreated: 0,
      lowStockProducts: [],
      criticalStockProducts: [],
    };

    for (const product of products) {
      if (!product.isActive) continue;

      const alertType = await this.checkProductThreshold(product, config);

      if (alertType) {
        const alert = await this.createAlertForProduct(product, alertType, userId);

        if (alert) {
          result.alertsCreated++;
        }

        if (alertType === 'critical') {
          result.criticalStockProducts.push(product.name);
        } else if (alertType === 'low_stock') {
          result.lowStockProducts.push(product.name);
        }
      }
    }

    return result;
  }

  async getProductsNeedingRestock(userId: string): Promise<Product[]> {
    const products = await this.productRepository.findByUserId(userId);
    
    return products.filter((product) => {
      if (!product.isActive) return false;
      const threshold = product.minStockLevel || LOW_STOCK_THRESHOLD;
      return product.quantity <= threshold;
    });
  }

  async resolveAlertsForProduct(productId: string): Promise<number> {
    const alerts = await this.alertRepository.findByProductId(productId);
    let resolvedCount = 0;

    for (const alert of alerts) {
      if (alert.status === 'pending') {
        await this.alertRepository.updateStatus(alert._id!.toString(), 'resolved');
        resolvedCount++;
      }
    }

    return resolvedCount;
  }
}

export const inventoryMonitorService = new InventoryMonitorService();
