# Gospel Screen TV - Database Setup Guide

## Overview
This guide walks you through setting up the MySQL database for subscription management in Gospel Screen TV.

---

## 1. Database Connection
**Location:** `backend/server.js` (Lines 81-87)

```javascript
const db = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gospelscreen'
});
```

**Current Setup:**
- Host: `localhost`
- User: `root`
- Password: `` (empty)
- Database: `gospelscreen`

---

## 2. User Table Structure (Existing)

The users are stored in the `login` table:

```sql
CREATE TABLE login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profession VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    description TEXT,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Subscriptions Table (New)

The subscription management system uses this new table:

```sql
CREATE TABLE subscriptions (
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

### Column Descriptions:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `email` | VARCHAR(255) | Foreign key linking to user's email |
| `subscription_plan` | VARCHAR(100) | Plan name (e.g., "Monthly", "Yearly") |
| `subscription_start` | DATETIME | When the subscription started |
| `subscription_renewal` | DATETIME | When the subscription will renew |
| `subscription_status` | ENUM | Status: 'active', 'cancelled', or 'expired' |
| `created_at` | DATETIME | Record creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

---

## 4. How to Set Up the Database

### Option A: PHPMyAdmin (GUI)

1. Open PHPMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Log in with your MySQL credentials
3. Select the `gospelscreen` database
4. Go to the "SQL" tab
5. Paste the SQL code from Section 3 above
6. Click "Go" to execute

### Option B: MySQL Command Line

1. Open MySQL Command Line or Terminal
2. Connect to your MySQL server:
   ```bash
   mysql -u root -p
   ```
3. Select the database:
   ```sql
   USE gospelscreen;
   ```
4. Paste the subscription table creation code from Section 3
5. Press Enter to execute

### Option C: Backend Auto-Creation

The backend will **automatically create** the subscriptions table when the server starts (see `backend/server.js` lines 1024-1043).

---

## 5. Backend API Endpoints

The backend provides these endpoints for subscription management:

### Update/Create Subscription
**Method:** `POST`  
**URL:** `http://localhost:8081/api/subscription/update-subscription`

**Request Body:**
```json
{
  "email": "user@example.com",
  "plan": "Monthly"
}
```

**Response:**
```json
{
  "message": "Subscription updated successfully",
  "subscription": {
    "email": "user@example.com",
    "plan": "Monthly",
    "subscription_start": "2024-03-11T10:30:00.000Z",
    "subscription_renewal": "2024-04-11T10:30:00.000Z"
  }
}
```

---

### Fetch Subscription
**Method:** `GET`  
**URL:** `http://localhost:8081/api/subscription/fetch-subscription?email=user@example.com`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "subscription_plan": "Monthly",
  "subscription_start": "2024-03-11T10:30:00.000Z",
  "subscription_renewal": "2024-04-11T10:30:00.000Z",
  "subscription_status": "active",
  "created_at": "2024-03-11T10:30:00.000Z",
  "updated_at": "2024-03-11T10:30:00.000Z"
}
```

---

### Cancel Subscription
**Method:** `POST`  
**URL:** `http://localhost:8081/api/subscription/cancel-subscription`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Subscription cancelled successfully",
  "subscription_status": "cancelled"
}
```

---

### Get Subscription Plans
**Method:** `GET`  
**URL:** `http://localhost:8081/api/subscription/plans`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Monthly",
    "price": 9.99,
    "duration": "month"
  },
  {
    "id": 2,
    "name": "Yearly",
    "price": 99.99,
    "duration": "year"
  }
]
```

---

## 6. Frontend Integration

### Subscription Service (`services/subscriptionService.ts`)

```typescript
export const subscriptionService = {
  updateSubscription: async (email: string, plan: string) => { ... },
  fetchSubscription: async (email: string) => { ... },
  cancelSubscription: async (email: string) => { ... },
  getSubscriptionPlans: async () => { ... }
};
```

### Member Dashboard (`pages/MemberDashboard.tsx`)

The dashboard automatically:
- Loads subscription data when component mounts
- Displays subscription plan, renewal date, and days remaining
- Shows loading state while fetching
- Shows error messages if something fails
- Allows users to cancel their subscription with confirmation dialog
- Updates UI to show cancellation status

---

## 7. Database Workflow

### User Registration → Subscription

1. **User registers** (stored in `login` table)
2. **User subscribes** (calls `/api/subscription/update-subscription`)
3. **Subscription record created** in `subscriptions` table
4. **Dashboard fetches** subscription info via `/api/subscription/fetch-subscription`
5. **Dashboard displays** all subscription details

### Using the Subscription

```
subscription_start ──────────────────────── subscription_renewal
     [Start]                                    [Renewal]
     ├─ Current Status: Active
     ├─ Days Left: Calculated from start date
     └─ Renewal Date: Calculated based on plan
```

### Cancellation Flow

1. User clicks "Cancel Subscription" button
2. Confirmation dialog appears
3. If confirmed, calls `/api/subscription/cancel-subscription`
4. Database updates `subscription_status` to 'cancelled'
5. Dashboard shows "Subscription Cancelled"
6. User keeps access until renewal date

---

## 8. Sample SQL Queries

### Check All Subscriptions
```sql
SELECT * FROM subscriptions;
```

### Check Active Subscriptions
```sql
SELECT * FROM subscriptions WHERE subscription_status = 'active';
```

### Check Cancelled Subscriptions
```sql
SELECT * FROM subscriptions WHERE subscription_status = 'cancelled';
```

### Find Subscriptions Expiring Soon
```sql
SELECT * FROM subscriptions 
WHERE subscription_status = 'active' 
AND subscription_renewal < DATE_ADD(NOW(), INTERVAL 7 DAY);
```

### Get User's Subscription
```sql
SELECT * FROM subscriptions WHERE email = 'user@example.com';
```

### Manual Cancellation
```sql
UPDATE subscriptions 
SET subscription_status = 'cancelled' 
WHERE email = 'user@example.com';
```

---

## 9. Troubleshooting

### Issue: "Connection refused" error
- Check MySQL is running
- Verify database credentials in `backend/server.js`

### Issue: "Email not found" for cancellation
- Ensure subscription record exists for that email
- Run: `SELECT * FROM subscriptions WHERE email = 'user@example.com';`

### Issue: Renewal date not calculating correctly
- Check subscription plan name (should contain 'year' or 'month')
- Verify database has correct subscription_start date

### Issue: Table doesn't exist
- Backend will auto-create on startup
- Or manually run CREATE TABLE query from Section 3

---

## 10. Testing the Full Flow

### Step 1: Create a User
```bash
# Register via frontend or use:
POST /api/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password",
  "phone": "1234567890",
  "profession": "Developer"
}
```

### Step 2: Create Subscription
```bash
POST /api/subscription/update-subscription
{
  "email": "test@example.com",
  "plan": "Monthly"
}
```

### Step 3: Verify in Database
```sql
SELECT * FROM subscriptions WHERE email = 'test@example.com';
```

### Step 4: Fetch via Dashboard
- Log in with test user
- Go to Member Dashboard
- Should see subscription details

### Step 5: Test Cancellation
- Click "Cancel Subscription"
- Confirm cancellation
- Verify status changed to 'cancelled'

```sql
SELECT subscription_status FROM subscriptions WHERE email = 'test@example.com';
-- Should return: cancelled
```

---

## 11. Notes

- The `subscription_start` is set to `CURRENT_TIMESTAMP` automatically
- The `subscription_renewal` is calculated in the backend based on plan type
- Renewal dates are stored in UTC (ISO format)
- The foreign key ensures subscriptions are deleted if user is deleted
- The indexes on `email` and `status` improve query performance

---

## Next Steps

1. Run the CREATE TABLE query for subscriptions
2. Restart the backend server (`node backend/server.js`)
3. Test the subscription flow through the frontend
4. Verify data is saved in the database

For questions or issues, check the logs in the backend console.
