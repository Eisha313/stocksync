# StockSync Troubleshooting Guide

This guide covers common issues and their solutions when running StockSync.

## Table of Contents

- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Payment Issues](#payment-issues)
- [Notification Issues](#notification-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

---

## Database Issues

### Cannot connect to MongoDB

**Symptoms:**
- API requests return 500 errors
- Logs show "MongoNetworkError" or "ECONNREFUSED"

**Solutions:**

1. **Check connection string:**
   ```bash
   # Verify MONGODB_URI in .env
   echo $MONGODB_URI
   ```

2. **Verify MongoDB is running:**
   ```bash
   # For local MongoDB
   mongosh --eval "db.adminCommand('ping')"
   
   # For Docker
   docker ps | grep mongo
   ```

3. **Check network/firewall:**
   - Ensure MongoDB port (27017) is open
   - For Atlas, whitelist your IP address

4. **Validate credentials:**
   ```bash
   # Test connection manually
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/stocksync"
   ```

### Slow database queries

**Symptoms:**
- API responses take > 2 seconds
- High CPU usage on database server

**Solutions:**

1. **Add indexes:**
   ```javascript
   // Run in MongoDB shell
   db.products.createIndex({ userId: 1, sku: 1 })
   db.alerts.createIndex({ userId: 1, status: 1, createdAt: -1 })
   ```

2. **Check query patterns:**
   ```javascript
   // Enable profiling
   db.setProfilingLevel(1, { slowms: 100 })
   db.system.profile.find().sort({ ts: -1 }).limit(10)
   ```

3. **Review connection pool size:**
   - Increase `maxPoolSize` in MongoDB connection options

---

## API Issues

### 401 Unauthorized errors

**Symptoms:**
- All API requests return 401
- Authentication middleware fails

**Solutions:**

1. **Check API key/token:**
   - Verify Authorization header format
   - Ensure token hasn't expired

2. **Validate environment variables:**
   ```bash
   # Check if JWT_SECRET is set
   node -e "console.log(process.env.JWT_SECRET ? 'Set' : 'Missing')"
   ```

### 422 Validation errors

**Symptoms:**
- Create/update requests fail with validation messages

**Solutions:**

1. **Check request body format:**
   ```bash
   # Example correct format
   curl -X POST /api/products \
     -H "Content-Type: application/json" \
     -d '{"name":"Product","sku":"SKU001","quantity":100,"threshold":10}'
   ```

2. **Review required fields:**
   - Products: `name`, `sku`, `quantity`, `threshold`
   - Alerts: `productId`, `type`, `threshold`

### CORS errors in browser

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- Requests work in Postman but not browser

**Solutions:**

1. **Update next.config.ts:**
   ```typescript
   // Add CORS headers
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Origin', value: '*' },
           { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
         ],
       },
     ]
   }
   ```

---

## Payment Issues

### Stripe webhook failures

**Symptoms:**
- Payments complete but premium not activated
- Webhook endpoint returns 400

**Solutions:**

1. **Verify webhook secret:**
   ```bash
   # Check STRIPE_WEBHOOK_SECRET matches dashboard
   stripe listen --print-secret
   ```

2. **Test webhook locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger checkout.session.completed
   ```

3. **Check signature verification:**
   - Ensure raw body is passed to `constructEvent`
   - Don't parse body before verification

### Checkout session creation fails

**Symptoms:**
- 500 error when creating checkout session
- Stripe API errors in logs

**Solutions:**

1. **Verify API keys:**
   ```bash
   # Test Stripe connection
   stripe balance --api-key $STRIPE_SECRET_KEY
   ```

2. **Check price ID exists:**
   ```bash
   stripe prices retrieve price_xxx
   ```

---

## Notification Issues

### SMS notifications not sending

**Symptoms:**
- Alert triggers but no SMS received
- Logs show notification service errors

**Solutions:**

1. **Verify premium status:**
   - Check user has active premium subscription
   - SMS requires premium tier

2. **Check Twilio credentials:**
   ```bash
   curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID" \
     -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
   ```

3. **Validate phone number format:**
   - Use E.164 format: +1234567890

### Email notifications delayed

**Symptoms:**
- Emails arrive late or not at all

**Solutions:**

1. **Check email service status:**
   - Verify SendGrid/SES API status
   - Review bounce/complaint rates

2. **Check spam folders:**
   - Add SPF/DKIM records
   - Verify sender domain

---

## Performance Issues

### High memory usage

**Symptoms:**
- Node process exceeds memory limits
- OOM errors in production

**Solutions:**

1. **Increase memory limit:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

2. **Profile memory usage:**
   ```bash
   node --inspect src/server.js
   # Use Chrome DevTools Memory tab
   ```

3. **Check for memory leaks:**
   - Review event listener cleanup
   - Ensure database connections are pooled

### Slow API responses

**Solutions:**

1. **Enable caching:**
   ```typescript
   // Add Redis caching for frequent queries
   const cached = await redis.get(`products:${userId}`)
   if (cached) return JSON.parse(cached)
   ```

2. **Optimize database queries:**
   - Use projections to limit returned fields
   - Implement pagination for large datasets

---

## Deployment Issues

### Build fails on Vercel

**Symptoms:**
- TypeScript compilation errors
- Missing dependencies

**Solutions:**

1. **Check Node version:**
   ```json
   // package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **Verify all dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Environment variables not loading

**Symptoms:**
- `undefined` values for env vars
- Different behavior in dev vs production

**Solutions:**

1. **Verify variable names:**
   - Use `NEXT_PUBLIC_` prefix for client-side vars
   - Server-side vars don't need prefix

2. **Check Vercel dashboard:**
   - Ensure all required vars are set
   - Redeploy after adding new vars

---

## Getting Help

If you're still experiencing issues:

1. **Search existing issues:** [GitHub Issues](https://github.com/your-org/stocksync/issues)
2. **Check logs:** Review application and server logs for error details
3. **Create a new issue:** Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version)
   - Relevant log output

## Debug Mode

Enable verbose logging:

```bash
DEBUG=stocksync:* npm run dev
```

This will output detailed logs for all StockSync modules.
