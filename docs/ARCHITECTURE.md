# StockSync Architecture

This document describes the high-level architecture of the StockSync inventory alert system.

## Overview

StockSync is built with Next.js 14+ using the App Router and follows a layered architecture pattern.

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js App Router                     │
│              (Pages, API Routes, Middleware)             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Controllers                         │
│           (Request handling, validation)                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       Services                           │
│              (Business logic, orchestration)             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Repositories                         │
│               (Data access abstraction)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       MongoDB                            │
│                  (Data persistence)                      │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── products/         # Product endpoints
│   │   ├── alerts/           # Alert endpoints
│   │   ├── payments/         # Payment endpoints
│   │   └── webhooks/         # Webhook handlers
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
│
├── controllers/              # Request handlers
│   ├── product.controller.ts
│   ├── alert.controller.ts
│   └── payment.controller.ts
│
├── services/                 # Business logic
│   ├── inventory-monitor.service.ts
│   ├── notification.service.ts
│   └── payment.service.ts
│
├── lib/                      # Shared utilities
│   ├── db/                   # Database utilities
│   │   ├── repositories/     # Data access layer
│   │   └── collections.ts    # Collection references
│   ├── middleware/           # API middleware
│   ├── validators/           # Input validation schemas
│   ├── utils/                # Helper functions
│   ├── api/                  # API utilities
│   ├── constants.ts          # Application constants
│   ├── mongodb.ts            # MongoDB connection
│   └── stripe.ts             # Stripe configuration
│
├── models/                   # Data models
│   ├── Product.ts
│   ├── Alert.ts
│   └── User.ts
│
└── types/                    # TypeScript definitions
    └── index.ts
```

## Layer Responsibilities

### API Routes (`app/api/`)

- Define HTTP endpoints
- Parse request parameters
- Call appropriate controllers
- Return formatted responses

### Controllers (`controllers/`)

- Handle request/response logic
- Input validation
- Error handling
- Call services for business logic

### Services (`services/`)

- Contain business logic
- Orchestrate multiple repository calls
- Handle complex operations
- External service integration (Stripe, notifications)

### Repositories (`lib/db/repositories/`)

- Abstract data access
- CRUD operations
- Query building
- Data mapping

### Models (`models/`)

- Define data structure
- Schema validation
- TypeScript interfaces

## Key Components

### Inventory Monitor Service

Responsible for:
- Checking product quantities against thresholds
- Generating alerts for low stock
- Batch processing for efficiency

```typescript
// Simplified flow
checkInventory(productId)
  → getProduct(productId)
  → compareWithThreshold()
  → createAlertIfNeeded()
  → notifyIfPremium()
```

### Notification Service

Handles:
- Email notifications (all users)
- SMS notifications (premium users)
- Notification preferences
- Rate limiting

### Payment Service

Manages:
- Stripe checkout sessions
- Webhook processing
- Premium feature activation
- Payment status tracking

## Data Flow Example

### Creating a Product

```
1. POST /api/products
   │
2. route.ts → ProductController.create()
   │
3. Validate request body (Zod schema)
   │
4. ProductRepository.create()
   │
5. MongoDB insert
   │
6. InventoryMonitorService.checkProduct()
   │
7. Return created product
```

### Processing Low Stock Alert

```
1. Product updated with low quantity
   │
2. InventoryMonitorService.checkThreshold()
   │
3. AlertRepository.create()
   │
4. NotificationService.send()
   │  ├── Email (all users)
   │  └── SMS (premium users)
   │
5. Return alert details
```

## Database Schema

### Products Collection

```typescript
{
  _id: ObjectId,
  name: string,
  sku: string (unique),
  quantity: number,
  threshold: number,
  price: number,
  category: string,
  description?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Alerts Collection

```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: Products),
  type: 'low_stock' | 'out_of_stock' | 'restock',
  status: 'pending' | 'acknowledged' | 'resolved',
  message: string,
  threshold: number,
  currentQuantity: number,
  acknowledgedBy?: string,
  acknowledgedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection

```typescript
{
  _id: ObjectId,
  email: string (unique),
  name: string,
  isPremium: boolean,
  stripeCustomerId?: string,
  notificationPreferences: {
    email: boolean,
    sms: boolean,
    phone?: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

1. **Input Validation:** All inputs validated with Zod schemas
2. **SQL Injection:** N/A (MongoDB with parameterized queries)
3. **XSS:** Next.js built-in sanitization
4. **CSRF:** API routes use secure headers
5. **Webhook Verification:** Stripe signature validation

## Performance Considerations

1. **Database Indexes:**
   - Products: `sku` (unique), `category`
   - Alerts: `productId`, `status`, `createdAt`
   - Users: `email` (unique), `stripeCustomerId`

2. **Connection Pooling:** MongoDB connection reuse

3. **Caching:** Consider implementing for frequently accessed data

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Batch import/export functionality
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Integration with external inventory systems
