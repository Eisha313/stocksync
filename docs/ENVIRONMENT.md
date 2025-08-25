# Environment Setup Guide

Complete guide for setting up your development and production environments for StockSync.

## Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/stocksync.git
cd stocksync

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your development values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stocksync_dev

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Twilio (test credentials)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 3. Database Setup

#### Local MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name stocksync-mongo mongo:6

# Or using Homebrew (macOS)
brew services start mongodb-community
```

#### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create database user
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get connection string and add to `.env.local`

### 4. Stripe Setup

#### Get API Keys

1. Create account at [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers > API Keys
3. Copy test keys to `.env.local`

#### Setup Webhook for Local Development

Using Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret to .env.local
```

### 5. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## Environment Variables Reference

### Core Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | - | Twilio account SID for SMS |
| `TWILIO_AUTH_TOKEN` | - | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | - | Twilio sender phone number |
| `ALERT_CHECK_INTERVAL` | `60000` | Inventory check interval (ms) |
| `LOW_STOCK_THRESHOLD` | `10` | Default low stock threshold |
| `CRITICAL_STOCK_THRESHOLD` | `5` | Default critical threshold |
| `LOG_LEVEL` | `info` | Logging verbosity |

### Environment-Specific Files

```
.env                # Default values (committed)
.env.local          # Local overrides (not committed)
.env.development    # Development-specific
.env.production     # Production-specific
.env.test           # Test-specific
```

## IDE Setup

### VS Code

Recommended extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "mongodb.mongodb-vscode",
    "stripe.vscode-stripe"
  ]
}
```

Settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### WebStorm

1. Enable ESLint: Preferences > Languages & Frameworks > ESLint
2. Enable Prettier: Preferences > Languages & Frameworks > Prettier
3. Configure TypeScript: Preferences > Languages & Frameworks > TypeScript

## Testing Environment

### Setup Test Database

```bash
# Create test database
mongosh --eval "use stocksync_test"

# Or use in-memory MongoDB for tests
npm install --save-dev mongodb-memory-server
```

### Test Environment Variables

Create `.env.test`:

```env
MONGODB_URI=mongodb://localhost:27017/stocksync_test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=product
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Check connection string format
# Local: mongodb://localhost:27017/stocksync
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/stocksync
```

### Stripe CLI Issues

```bash
# Re-authenticate
stripe login --interactive

# Check webhook forwarding
stripe listen --print-json

# Trigger test event
stripe trigger payment_intent.succeeded
```

### Node.js Version Issues

```bash
# Check current version
node --version

# Use nvm to switch versions
nvm install 18
nvm use 18

# Or use .nvmrc
echo "18" > .nvmrc
nvm use
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
npm run build

# Regenerate types
npx tsc --noEmit
```
