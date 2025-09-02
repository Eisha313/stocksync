# Getting Started with StockSync

This guide will walk you through setting up StockSync for your store in under 10 minutes.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18.x or later installed
- A MongoDB database (local or cloud-hosted)
- A Stripe account (for payment processing)

## Quick Start

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/stocksync.git
cd stocksync

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stocksync

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps After Installation

### 1. Add Your First Product

Use the API or dashboard to add a product:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "sku": "SAMPLE-001",
    "quantity": 100,
    "price": 29.99,
    "category": "electronics"
  }'
```

### 2. Set Up Your First Alert

Create an alert rule for low stock:

```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "threshold": 10,
    "type": "low_stock",
    "channels": ["email"]
  }'
```

### 3. Test the Monitoring

Update the product quantity to trigger an alert:

```bash
curl -X PATCH http://localhost:3000/api/products/<product_id> \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

## Configuration Options

### Alert Thresholds

| Threshold Type | Default | Description |
|---------------|---------|-------------|
| Low Stock | 20 | Warning level |
| Critical | 5 | Critical level |
| Out of Stock | 0 | Emergency level |

### Notification Channels

| Channel | Availability | Setup Required |
|---------|-------------|----------------|
| Email | Free | SMTP configuration |
| SMS | Premium | Twilio integration |
| Webhook | Free | Endpoint URL |

## Sample Data

To populate your database with sample data for testing:

```bash
npm run seed
```

This creates:
- 10 sample products across categories
- 5 alert rules
- 1 test user

## Verifying Your Setup

Run the health check to verify everything is working:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

## Common Setup Issues

### MongoDB Connection Failed

```
Error: MongoNetworkError: failed to connect to server
```

**Solution**: Ensure MongoDB is running and the connection string is correct.

### Stripe Configuration Error

```
Error: Invalid API Key provided
```

**Solution**: Verify your Stripe keys are correct and match your environment (test/live).

### Port Already in Use

```
Error: EADDRINUSE: address already in use :::3000
```

**Solution**: Stop other processes on port 3000 or use a different port:

```bash
PORT=3001 npm run dev
```

## Next Steps

Now that you're set up:

1. Read the [User Guide](./USER_GUIDE.md) for detailed feature documentation
2. Check the [API Documentation](./API.md) for integration options
3. Review [Best Practices](#) for optimal configuration

## Need Help?

- 📖 [FAQ](./FAQ.md)
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md)
- 💬 [Community Discord](https://discord.gg/stocksync)
- 📧 support@stocksync.example.com
