# StartupLense Backend API

Complete MongoDB-based backend for StartupLense platform built with Node.js, Express, and MongoDB.

## 🚀 Features

### 1. User & Authentication
- User registration with email verification
- JWT-based authentication
- Password reset functionality
- Session management

### 2. Role & Access Control
- Role-based access (free, paid, admin)
- Middleware for authentication and authorization
- Premium content access control

### 3. Subscription & Payment
- Multiple subscription plans (Monthly, Yearly, Lifetime)
- Razorpay payment integration
- Subscription management
- Payment history tracking

### 4. CMS - Content Engine
- Article management system
- Categories and tags
- SEO optimization fields
- Premium content flags
- Draft/Published status

### 5. Premium Content Access
- Reading limits for free users
- Subscription-based access control
- Article access tracking

### 6. Search, Filter & Sort
- MongoDB text search
- Advanced filtering
- Trending searches
- Search analytics

### 7. Admin Dashboard
- Dashboard statistics
- User management
- Analytics aggregation
- Content management

### 8. Email & Notifications
- Welcome emails
- Email verification
- Password reset emails
- Newsletter system
- Notification preferences

### 9. Analytics & Tracking
- Event tracking
- Conversion tracking
- User analytics
- Article read tracking

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## ⚙️ Environment Variables

Create a `.env` file with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/startuplense
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
```

## 🏃 Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout

### Articles
- `GET /api/articles` - Get all articles (with filters)
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create article (Admin)
- `PUT /api/articles/:id` - Update article (Admin)
- `DELETE /api/articles/:id` - Delete article (Admin)

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `GET /api/subscriptions/me` - Get user subscription
- `GET /api/subscriptions/check` - Check subscription status
- `POST /api/subscriptions/create` - Create subscription

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Search
- `GET /api/search/articles` - Search articles
- `GET /api/search/trending` - Get trending searches

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `GET /api/admin/analytics` - Get analytics

### Analytics
- `POST /api/analytics/events` - Track event
- `POST /api/analytics/conversions` - Track conversion
- `GET /api/analytics/me` - Get user analytics

## 🗄️ MongoDB Collections

- `users` - User accounts
- `email_verifications` - Email verification tokens
- `password_resets` - Password reset tokens
- `sessions` - User sessions
- `plans` - Subscription plans
- `subscriptions` - User subscriptions
- `payments` - Payment records
- `articles` - Content articles
- `categories` - Article categories
- `user_article_access` - Article access tracking
- `reading_limits` - Reading limits by role
- `search_logs` - Search history
- `email_logs` - Email sending logs
- `notification_preferences` - User notification settings
- `analytics_events` - Analytics events
- `conversions` - Conversion tracking

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- CORS configuration
- Environment variable security

## 📊 MongoDB Indexes

- Email indexes for fast user lookup
- Text indexes for article search
- Compound indexes for complex queries
- TTL indexes for auto-deleting expired tokens

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 License

ISC
