# StockSync 📦

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

A lightweight inventory alert system that notifies store owners when products run low.

## ✨ Features

- **🔔 Real-time Monitoring** - Customizable alert levels for inventory thresholds
- **📦 Product Catalog** - Simple stock quantity tracking with MongoDB storage
- **💳 Premium Features** - Stripe-powered one-time payment for SMS notifications
- **📧 Multi-channel Alerts** - Email and SMS notification support
- **🔌 RESTful API** - Clean, documented API for integrations

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/stocksync.git
cd stocksync

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Initial setup and first steps |
| [User Guide](./docs/USER_GUIDE.md) | How to use StockSync |
| [API Reference](./docs/API.md) | Complete API documentation |
| [Architecture](./docs/ARCHITECTURE.md) | System design overview |
| [Deployment](./docs/DEPLOYMENT.md) | Production deployment guide |
| [Environment](./docs/ENVIRONMENT.md) | Configuration reference |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [FAQ](./docs/FAQ.md) | Frequently asked questions |
| [Contributing](./CONTRIBUTING.md) | How to contribute |

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Validation**: [Zod](https://zod.dev/)

## 📁 Project Structure

```
stocksync/
├── src/
│   ├── app/              # Next.js App Router
│   │   └── api/          # API routes
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── lib/              # Utilities & config
│   │   ├── db/           # Database layer
│   │   ├── middleware/   # API middleware
│   │   ├── validators/   # Zod schemas
│   │   └── utils/        # Helper functions
│   └── types/            # TypeScript types
├── docs/                 # Documentation
└── package.json
```

## 🔧 Configuration

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stocksync

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [Environment Documentation](./docs/ENVIRONMENT.md) for all options.

## 📡 API Overview

### Products
```
GET    /api/products          # List all products
POST   /api/products          # Create a product
GET    /api/products/:id      # Get a product
PUT    /api/products/:id      # Update a product
DELETE /api/products/:id      # Delete a product
```

### Alerts
```
GET    /api/alerts            # List all alerts
POST   /api/alerts            # Create an alert
GET    /api/alerts/:id        # Get an alert
PUT    /api/alerts/:id        # Update an alert
POST   /api/alerts/:id/acknowledge  # Acknowledge alert
```

### Payments
```
POST   /api/payments/checkout # Create checkout session
POST   /api/webhooks/stripe   # Stripe webhook handler
```

See [API Documentation](./docs/API.md) for complete details.

## 🧪 Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🚢 Deployment

StockSync can be deployed to:

- **Vercel** (recommended)
- **Railway**
- **Docker**
- **Any Node.js hosting**

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [MongoDB](https://www.mongodb.com/) for the database
- [Stripe](https://stripe.com/) for payment processing

## 📞 Support

- 📖 [Documentation](./docs/INDEX.md)
- 🐛 [Issue Tracker](https://github.com/your-org/stocksync/issues)
- 💬 [Discussions](https://github.com/your-org/stocksync/discussions)

---

**StockSync** - Never run out of stock again! 📦✨
