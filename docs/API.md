# StockSync API Documentation

This document describes the REST API endpoints available in StockSync.

## Base URL

All API endpoints are relative to: `/api`

## Authentication

Currently, the API does not require authentication. Future versions will include API key authentication.

---

## Products

### List All Products

```
GET /api/products
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `lowStock` | boolean | Filter for low stock items only |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "Product Name",
      "sku": "SKU-001",
      "quantity": 100,
      "threshold": 10,
      "price": 29.99,
      "category": "Electronics",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Single Product

```
GET /api/products/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "Product Name",
    "sku": "SKU-001",
    "quantity": 100,
    "threshold": 10,
    "price": 29.99,
    "category": "Electronics",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Product

```
POST /api/products
```

**Request Body:**

```json
{
  "name": "Product Name",
  "sku": "SKU-001",
  "quantity": 100,
  "threshold": 10,
  "price": 29.99,
  "category": "Electronics",
  "description": "Optional description"
}
```

**Required Fields:** `name`, `sku`, `quantity`, `threshold`

### Update Product

```
PUT /api/products/:id
```

**Request Body:** Same as create, all fields optional.

### Delete Product

```
DELETE /api/products/:id
```

---

## Alerts

### List All Alerts

```
GET /api/alerts
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `acknowledged`, `resolved` |
| `type` | string | Filter by type: `low_stock`, `out_of_stock`, `restock` |
| `productId` | string | Filter by product ID |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "productId": "string",
      "type": "low_stock",
      "status": "pending",
      "message": "Product XYZ is running low (5 remaining)",
      "threshold": 10,
      "currentQuantity": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Alert

```
GET /api/alerts/:id
```

### Create Alert

```
POST /api/alerts
```

**Request Body:**

```json
{
  "productId": "string",
  "type": "low_stock",
  "message": "Custom alert message"
}
```

### Acknowledge Alert

```
POST /api/alerts/:id/acknowledge
```

**Request Body:**

```json
{
  "acknowledgedBy": "user@example.com"
}
```

### Delete Alert

```
DELETE /api/alerts/:id
```

---

## Payments

### Create Checkout Session

```
POST /api/payments/checkout
```

**Request Body:**

```json
{
  "userId": "string",
  "plan": "premium",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/xxx"
  }
}
```

---

## Webhooks

### Stripe Webhook

```
POST /api/webhooks/stripe
```

This endpoint receives webhook events from Stripe. It handles:

- `checkout.session.completed`: Activates premium features for the user
- `payment_intent.succeeded`: Confirms successful payment
- `payment_intent.payment_failed`: Logs failed payment attempts

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |

---

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the window resets
