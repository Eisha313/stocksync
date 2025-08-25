# StockSync

A lightweight inventory alert system that notifies store owners when products run low.

## Features

- 📊 **Real-time Inventory Monitoring** - Customizable threshold alerts for low stock detection
- 📦 **Product Catalog Management** - Simple product tracking with stock quantities stored in MongoDB
- 💳 **Premium Features** - Stripe-powered one-time payment for SMS notifications and advanced alerts

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stocksync.git
cd stocksync

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Documentation

- [API Documentation](./docs/API.md) - Complete API reference
- [Architecture Guide](./docs/ARCHITECTURE.md) - System design and patterns
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Environment Setup](./docs/ENVIRONMENT.md) - Development environment configuration
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL |
| `TWILIO_ACCOUNT_SID` | No | Twilio SID for SMS |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | Twilio sender number |

See [Environment Setup](./docs/ENVIRONMENT.md) for complete configuration guide.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── controllers/         # Request handlers
├── services/            # Business logic
├── models/              # MongoDB models
├── lib/
│   ├── db/             # Database utilities
│   ├── middleware/     # API middleware
│   ├── utils/          # Helper functions
│   └── validators/     # Zod schemas
└── types/              # TypeScript definitions
```

## API Overview

### Products

```
GET    /api/products          # List all products
POST   /api/products          # Create product
GET    /api/products/:id      # Get product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Alerts

```
GET    /api/alerts            # List alerts
POST   /api/alerts            # Create alert config
GET    /api/alerts/:id        # Get alert
PUT    /api/alerts/:id        # Update alert
DELETE /api/alerts/:id        # Delete alert
POST   /api/alerts/:id/acknowledge  # Acknowledge alert
```

### Payments

```
POST   /api/payments/checkout # Create checkout session
POST   /api/webhooks/stripe   # Stripe webhook handler
```

See [API Documentation](./docs/API.md) for complete details.

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/stocksync)

### Docker

```bash
docker-compose up -d
```

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with native driver
- **Payments**: Stripe
- **Notifications**: Twilio (SMS)
- **Validation**: Zod

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.
