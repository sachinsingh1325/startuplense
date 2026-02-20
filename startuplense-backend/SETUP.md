# StartupLense Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd startuplense-backend
npm install
```

### 2. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
```

**Required Environment Variables:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random secret for JWT tokens
- `JWT_REFRESH_SECRET` - Random secret for refresh tokens
- `EMAIL_USER` & `EMAIL_PASS` - For sending emails (Gmail app password)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- `FRONTEND_URL` - Your frontend URL (default: http://localhost:5173)

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# If installed locally
mongod

# Or use MongoDB Atlas connection string in .env
```

### 4. Seed Initial Data
```bash
npm run seed
```

This will create:
- 3 subscription plans (Monthly ₹499, Yearly ₹3,999, Lifetime ₹9,999)
- Reading limits for free/paid/admin roles
- Initial categories (Startup News, Case Studies, etc.)

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📋 API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Articles (with auth token)
```bash
curl http://localhost:5000/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🗄️ MongoDB Collections Created

All collections are automatically created when you use the API. Here's what gets created:

1. **users** - User accounts
2. **email_verifications** - Email verification tokens (auto-expires)
3. **password_resets** - Password reset tokens (auto-expires)
4. **sessions** - User sessions (auto-expires)
5. **plans** - Subscription plans
6. **subscriptions** - User subscriptions
7. **payments** - Payment records
8. **articles** - Content articles
9. **categories** - Article categories
10. **user_article_access** - Article access tracking
11. **reading_limits** - Reading limits by role
12. **search_logs** - Search history
13. **email_logs** - Email sending logs
14. **notification_preferences** - User notification settings
15. **analytics_events** - Analytics events
16. **conversions** - Conversion tracking

## 🔐 Default Roles

- **free** - Free users (limited access)
- **paid** - Paid subscribers (full access)
- **admin** - Admin users (all permissions)

## 📊 MongoDB Indexes

Indexes are automatically created for:
- Fast email lookup
- Text search on articles
- Subscription queries
- Analytics aggregation

## 🧪 Testing Payment Flow

1. Create a payment order:
```bash
POST /api/payments/create-order
{
  "planId": "PLAN_ID_FROM_SEED"
}
```

2. Verify payment (after Razorpay callback):
```bash
POST /api/payments/verify
{
  "razorpayOrderId": "...",
  "razorpayPaymentId": "...",
  "razorpaySignature": "...",
  "paymentId": "..."
}
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use App Password
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`

### JWT Errors
- Make sure `JWT_SECRET` is set in `.env`
- Token expires in 7 days (configurable)

### Razorpay Errors
- Get keys from Razorpay Dashboard
- Test mode keys work for development

## 📚 Next Steps

1. Connect frontend to backend API
2. Update frontend API calls to use backend endpoints
3. Test all features end-to-end
4. Deploy to production (Heroku, Railway, etc.)

## 🔗 Frontend Integration

Update your frontend API calls to point to:
```
http://localhost:5000/api
```

Example:
```javascript
// In your React components
const API_URL = 'http://localhost:5000/api';

// Login
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```
