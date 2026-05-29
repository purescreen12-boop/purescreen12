# Subscription Management - Quick Integration Guide

## What Has Been Implemented

### ✅ Backend (backend/server.js)
- **Automatic table creation** on server startup
- **4 new API endpoints:**
  1. `POST /api/subscription/update-subscription` - Create/update subscription
  2. `GET /api/subscription/fetch-subscription` - Get user's subscription
  3. `POST /api/subscription/cancel-subscription` - Cancel subscription
  4. `GET /api/subscription/plans` - Get available plans

### ✅ Frontend Service (services/subscriptionService.ts)
- Updated API base URL to port 8081
- Added `cancelSubscription()` method
- Added `getSubscriptionPlans()` method

### ✅ Member Dashboard (pages/MemberDashboard.tsx)
- Loading state with spinner
- Error handling and messages
- Cancellation confirmation dialog
- Live subscription status display
- Shows days remaining (calculated from DB)
- Shows subscription start date and renewal date
- Cancel button with disabled state when cancelled

### ✅ Database Documentation
- Complete Database Setup Guide (`DATABASE_SETUP.md`)
- SQL queries for all operations
- Troubleshooting section

---

## How It Works

### 1. User Flow
```
User Registers → Subscription Created → Dashboard Shows Details → Can Cancel Anytime
```

### 2. Data Storage
All subscription data is stored in MySQL under the `subscriptions` table:
- Plan name
- Subscription start date
- Renewal date (auto-calculated based on plan)
- Current status (active/cancelled/expired)
- Timestamps for tracking

### 3. Database Schema
```
subscriptions table:
├── id (primary key)
├── email (linked to login table)
├── subscription_plan ('Monthly', 'Yearly', etc.)
├── subscription_start (when subscription began)
├── subscription_renewal (when it renews)
├── subscription_status ('active', 'cancelled', 'expired')
└── timestamps (created_at, updated_at)
```

---

## Step-by-Step Setup

### 1. Database Setup
```sql
-- Go to PHPMyAdmin or MySQL terminal
USE gospelscreen;

-- The table will auto-create when backend starts
-- But you can manually create it:
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscription_plan VARCHAR(100),
    subscription_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    subscription_renewal DATETIME,
    subscription_status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES login(email) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_status (subscription_status)
);
```

### 2. Start Backend Server
```bash
cd backend
node server.js
```
You should see: `Subscriptions table ready`

### 3. Start Frontend
```bash
# In another terminal, from project root
npm run dev
```

---

## Testing the System

### Test 1: Create a Subscription
```bash
# Using curl or Postman
curl -X POST http://localhost:8081/api/subscription/update-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "plan": "Monthly"
  }'

# Expected response:
# {
#   "message": "Subscription updated successfully",
#   "subscription": { ... }
# }
```

### Test 2: Fetch Subscription
```bash
curl -X GET "http://localhost:8081/api/subscription/fetch-subscription?email=user@example.com"

# Expected response shows all subscription details
```

### Test 3: Full Frontend Flow
1. Register or log in with a user account
2. Go to "Member Dashboard"
3. Should see:
   - Membership status: Active
   - Subscription plan
   - Start date and renewal date
   - Days remaining (calculated)
   - Cancel subscription button
4. Click "Cancel Subscription"
5. Confirm in dialog
6. Status changes to "Cancelled"
7. Button becomes disabled

### Test 4: Verify Database
```bash
# In MySQL terminal
mysql -u root -p gospelscreen
SELECT * FROM subscriptions;

# You should see your test user's subscription record
```

---

## API Reference

### Create/Update Subscription
```
POST /api/subscription/update-subscription
Content-Type: application/json

{
  "email": "user@example.com",
  "plan": "Monthly"  // or "Yearly"
}

Returns: { message, subscription object }
```

### Get Subscription
```
GET /api/subscription/fetch-subscription?email=user@example.com

Returns: { subscription object with all details }
```

### Cancel Subscription
```
POST /api/subscription/cancel-subscription
Content-Type: application/json

{
  "email": "user@example.com"
}

Returns: { message, subscription_status: "cancelled" }
```

### Get Plans
```
GET /api/subscription/plans

Returns: [
  { id: 1, name: "Monthly", price: 9.99, duration: "month" },
  { id: 2, name: "Yearly", price: 99.99, duration: "year" }
]
```

---

## Files Modified

1. **backend/server.js**
   - Added subscription table creation (auto-runs on startup)
   - Added 4 new API endpoints
   - Lines 1024-1135 (subscription endpoints)

2. **services/subscriptionService.ts**
   - Updated API base URL from 5000 to 8081
   - Added cancellation method
   - Added plans fetching method

3. **pages/MemberDashboard.tsx**
   - Added loading states
   - Added error handling
   - Added cancel functionality
   - Improved UI to show cancellation status
   - Better subscription data display

4. **DATABASE_SETUP.md** (NEW)
   - Complete setup instructions
   - SQL queries and schemas
   - Troubleshooting guide

---

## Key Features

✅ **Automatic renewal dates** - Calculated based on plan type  
✅ **Days counter** - Shows remaining days until expiration  
✅ **Cancellation flow** - Users can cancel with confirmation  
✅ **Status tracking** - Active/Cancelled/Expired states  
✅ **Error handling** - User-friendly error messages  
✅ **Loading states** - Shows spinners while fetching  
✅ **Database persistence** - All data stored in MySQL  
✅ **User-linked records** - Foreign key to login table  

---

## Troubleshooting

### Dashboard shows "No active subscription found"
- Check if subscription exists in database: 
  ```sql
  SELECT * FROM subscriptions WHERE email = 'user@example.com';
  ```
- If empty, create one via API or manually insert

### Cancel button doesn't work
- Check browser console for errors
- Verify backend is running on port 8081
- Check network tab in DevTools

### Renewal date is wrong
- Ensure plan name contains 'Monthly' or 'Yearly'
- Check subscription_start timestamp is correct

### "Connection refused" error
- Ensure backend is running: `node backend/server.js`
- Check port 8081 is available
- Verify MySQL is running

---

## Next Features to Add (Optional)

- Payment processing integration
- Invoice generation
- Upgrade/downgrade plans
- Auto-renewal toggle
- Multiple payment methods
- Email notifications for renewal
- Subscription tier levels
- Usage statistics

---

## Support

For detailed information, see `DATABASE_SETUP.md` in the root directory.
