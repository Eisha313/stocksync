# StockSync

A lightweight inventory alert system that notifies store owners when products run low. Helps small e-commerce businesses track inventory levels and receive automated low-stock alerts to prevent overselling.

## Features

- Real-time inventory threshold monitoring with customizable alert levels
- Simple product catalog with stock quantity tracking (MongoDB)
- Stripe-powered one-time payment for premium features (SMS notifications)

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Stripe account (for premium features)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stocksync.git
cd stocksync

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

## Environment Variables

Configure the following in `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/stocksync
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXTAUTH_SECRET=your-secret-key
```

## Usage

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## API Endpoints

- `GET /api/products` - List all products
- `POST /api/products` - Add new product
- `PATCH /api/products/[id]` - Update stock quantity
- `GET /api/alerts` - Get active low-stock alerts
- `POST /api/checkout` - Create Stripe checkout session

## License

MIT