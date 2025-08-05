import { Alert, AlertType, AlertStatus } from '@/models/Alert';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { alertRepository } from '@/lib/db/repositories';

export interface NotificationPayload {
  userId: string;
  productId: string;
  productName: string;
  currentQuantity: number;
  threshold: number;
  alertType: AlertType;
}

export interface NotificationResult {
  success: boolean;
  channel: 'email' | 'sms';
  messageId?: string;
  error?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface SMSOptions {
  to: string;
  message: string;
}

class NotificationService {
  private async sendEmail(options: EmailOptions): Promise<NotificationResult> {
    try {
      // In production, integrate with email service like SendGrid, AWS SES, etc.
      console.log(`[Email] Sending to ${options.to}: ${options.subject}`);
      
      // Simulate email sending
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Email] Body: ${options.body}`);
      }

      // TODO: Implement actual email sending
      // const response = await emailProvider.send(options);
      
      return {
        success: true,
        channel: 'email',
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Email] Failed to send: ${errorMessage}`);
      return {
        success: false,
        channel: 'email',
        error: errorMessage,
      };
    }
  }

  private async sendSMS(options: SMSOptions): Promise<NotificationResult> {
    try {
      // SMS is a premium feature - requires Stripe payment
      console.log(`[SMS] Sending to ${options.to}: ${options.message}`);

      // TODO: Implement actual SMS sending via Twilio or similar
      // const response = await twilioClient.messages.create({
      //   body: options.message,
      //   to: options.to,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      // });

      return {
        success: true,
        channel: 'sms',
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SMS] Failed to send: ${errorMessage}`);
      return {
        success: false,
        channel: 'sms',
        error: errorMessage,
      };
    }
  }

  private formatAlertMessage(payload: NotificationPayload): { subject: string; body: string } {
    const severityMap: Record<AlertType, string> = {
      low_stock: 'Low Stock',
      out_of_stock: 'OUT OF STOCK',
      reorder: 'Reorder Needed',
    };

    const severity = severityMap[payload.alertType];
    const subject = `[StockSync] ${severity} Alert: ${payload.productName}`;
    
    let body = `Alert: ${severity}\n\n`;
    body += `Product: ${payload.productName}\n`;
    body += `Current Quantity: ${payload.currentQuantity}\n`;
    body += `Threshold: ${payload.threshold}\n\n`;

    if (payload.alertType === 'out_of_stock') {
      body += 'URGENT: This product is completely out of stock!\n';
    } else if (payload.alertType === 'reorder') {
      body += 'Action Required: Please reorder this product soon.\n';
    } else {
      body += 'Stock is running low. Consider reordering.\n';
    }

    body += '\n---\nStockSync Inventory Alert System';

    return { subject, body };
  }

  private formatSMSMessage(payload: NotificationPayload): string {
    const severityEmoji: Record<AlertType, string> = {
      low_stock: '⚠️',
      out_of_stock: '🚨',
      reorder: '📦',
    };

    const emoji = severityEmoji[payload.alertType];
    return `${emoji} StockSync: ${payload.productName} - ${payload.currentQuantity} left (threshold: ${payload.threshold})`;
  }

  async notifyUser(
    user: User,
    payload: NotificationPayload
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const { subject, body } = this.formatAlertMessage(payload);

    // Always send email notification
    const emailResult = await this.sendEmail({
      to: user.email,
      subject,
      body,
      html: this.generateEmailHTML(payload, subject, body),
    });
    results.push(emailResult);

    // Send SMS only for premium users with phone number
    if (user.isPremium && user.phone && user.notificationPreferences?.sms) {
      const smsMessage = this.formatSMSMessage(payload);
      const smsResult = await this.sendSMS({
        to: user.phone,
        message: smsMessage,
      });
      results.push(smsResult);
    }

    return results;
  }

  private generateEmailHTML(
    payload: NotificationPayload,
    subject: string,
    body: string
  ): string {
    const alertColorMap: Record<AlertType, string> = {
      low_stock: '#f59e0b',
      out_of_stock: '#ef4444',
      reorder: '#3b82f6',
    };

    const color = alertColorMap[payload.alertType];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="border-left: 4px solid ${color}; padding-left: 16px; margin-bottom: 20px;">
            <h1 style="color: ${color}; margin: 0 0 10px 0;">${subject}</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <p><strong>Product:</strong> ${payload.productName}</p>
            <p><strong>Current Quantity:</strong> ${payload.currentQuantity}</p>
            <p><strong>Threshold:</strong> ${payload.threshold}</p>
          </div>
          <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">
            This is an automated alert from StockSync Inventory Alert System.
          </p>
        </body>
      </html>
    `;
  }

  async sendBulkNotifications(
    notifications: Array<{ user: User; payload: NotificationPayload }>
  ): Promise<Map<string, NotificationResult[]>> {
    const resultsMap = new Map<string, NotificationResult[]>();

    for (const { user, payload } of notifications) {
      const results = await this.notifyUser(user, payload);
      resultsMap.set(payload.productId, results);
    }

    return resultsMap;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
