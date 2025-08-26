# StockSync FAQ

Frequently asked questions about StockSync inventory management system.

## General Questions

### What is StockSync?

StockSync is a lightweight inventory alert system designed for store owners. It monitors your product stock levels in real-time and sends notifications when items run low, helping you avoid stockouts and maintain optimal inventory levels.

### Who is StockSync for?

- Small to medium-sized retail businesses
- E-commerce store owners
- Warehouse managers
- Anyone who needs to track inventory levels

### What makes StockSync different from other inventory systems?

StockSync focuses on **alerts and monitoring** rather than being a full inventory management suite. This makes it:
- Lightweight and fast
- Easy to set up and use
- Affordable for small businesses
- Perfect as a complement to existing systems

---

## Features

### What alert types are supported?

| Alert Type | Description | Tier |
|------------|-------------|------|
| Email | Notifications sent to your email | Free |
| Dashboard | In-app notifications | Free |
| SMS | Text message alerts | Premium |
| Webhook | HTTP callbacks to your systems | Premium |

### Can I set different thresholds for different products?

Yes! Each product can have its own custom threshold. You can also set:
- **Warning threshold**: First alert when stock is getting low
- **Critical threshold**: Urgent alert when stock is very low

### How often does StockSync check inventory levels?

Inventory is monitored in real-time. Whenever you update stock quantities through the API or dashboard, thresholds are immediately evaluated and alerts are triggered if needed.

### Can I integrate StockSync with my existing POS or e-commerce platform?

Yes! StockSync provides a REST API that can integrate with:
- Shopify
- WooCommerce
- Square
- Custom POS systems
- Any platform that can make HTTP requests

See our [API documentation](./API.md) for integration details.

---

## Pricing & Payments

### Is there a free tier?

Yes! The free tier includes:
- Up to 50 products
- Email notifications
- Dashboard alerts
- Basic reporting

### What does Premium include?

Premium is a one-time payment ($49) that unlocks:
- Unlimited products
- SMS notifications
- Webhook integrations
- Priority support
- Advanced analytics

### Why a one-time payment instead of subscription?

We believe small business owners shouldn't be burdened with recurring fees for essential tools. Pay once, use forever.

### What payment methods are accepted?

We accept all major credit cards through Stripe:
- Visa
- Mastercard
- American Express
- Discover

### Can I get a refund?

Yes, we offer a 30-day money-back guarantee for Premium purchases. Contact support@stocksync.app for refund requests.

---

## Technical Questions

### What tech stack does StockSync use?

- **Frontend**: Next.js (React)
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Payments**: Stripe
- **Hosting**: Vercel (recommended)

### Can I self-host StockSync?

Yes! StockSync is open-source and can be self-hosted. See our [Deployment Guide](./DEPLOYMENT.md) for instructions.

### What are the system requirements for self-hosting?

- Node.js 18 or higher
- MongoDB 5.0 or higher
- 512MB RAM minimum (1GB recommended)
- Any Linux/Unix server or container platform

### Is my data secure?

Yes! We implement:
- Encrypted connections (HTTPS/TLS)
- Secure password hashing
- MongoDB authentication
- Regular security updates

For self-hosted instances, you control your data entirely.

### How do I backup my data?

For MongoDB backups:

```bash
# Using mongodump
mongodump --uri="your-mongodb-uri" --out=/backup/location

# For MongoDB Atlas, use Cloud Backup feature
```

---

## Account & Setup

### How do I create an account?

1. Visit the StockSync dashboard
2. Click "Sign Up"
3. Enter your email and create a password
4. Verify your email address
5. Start adding products!

### How do I add products?

Via Dashboard:
1. Go to Products → Add New
2. Enter product name, SKU, quantity, and threshold
3. Click Save

Via API:
```bash
curl -X POST /api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","sku":"WDG-001","quantity":100,"threshold":20}'
```

### Can I import products from a CSV file?

Yes! Go to Products → Import and upload a CSV with columns:
- name (required)
- sku (required)
- quantity (required)
- threshold (required)
- description (optional)
- category (optional)

### How do I configure SMS notifications?

1. Upgrade to Premium
2. Go to Settings → Notifications
3. Enter your phone number (with country code)
4. Verify via SMS code
5. Enable SMS alerts for desired alert levels

---

## Troubleshooting

### I'm not receiving email alerts

1. Check your spam/junk folder
2. Verify your email address in Settings
3. Ensure alert preferences are enabled
4. Check that thresholds are configured correctly

### My stock levels aren't updating

1. Check API response for errors
2. Verify product ID is correct
3. Ensure quantity is a valid number
4. Check database connectivity

### The dashboard is slow

1. Clear browser cache
2. Check your internet connection
3. Try a different browser
4. If self-hosting, check server resources

For more issues, see our [Troubleshooting Guide](./TROUBLESHOOTING.md).

---

## API Questions

### What's the API rate limit?

| Tier | Rate Limit |
|------|------------|
| Free | 100 requests/minute |
| Premium | 1000 requests/minute |

### How do I authenticate API requests?

Use Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.stocksync.app/api/products
```

### Is there a webhook for stock changes?

Yes! Premium users can configure webhooks at Settings → Webhooks. Events include:
- `product.low_stock` - When product hits warning threshold
- `product.critical_stock` - When product hits critical threshold
- `product.out_of_stock` - When quantity reaches zero

---

## Still have questions?

- **Documentation**: [docs/](./)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/stocksync/issues)
- **Email**: support@stocksync.app
- **Twitter**: [@stocksyncapp](https://twitter.com/stocksyncapp)
