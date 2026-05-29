# Payment and Subscription Flow Documentation

## Overview

The payment and subscription system uses **Paystack** for secure payment processing and **webhooks** for real-time subscription management. This ensures payments are reliably stored in the database even if the frontend crashes or loses connection after payment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ 1. User clicks "Subscribe Now"                                 │
│    (Frontend: pages/Membership.tsx)                            │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ 2. Paystack modal opens with payment form                      │
│    - Amount: ₦1,500 (monthly) or ₦15,000 (yearly)            │
│    - User enters card/payment details                          │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ 3. Paystack processes payment                                  │
│    - User approves payment                                      │
│    - Payment is verified                                        │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌─────────┬─┴──────────┬──────────┐
         │         │            │          │
         ▼         ▼            ▼          ▼
    Frontend  Webhook 1   Webhook 2  Webhook N
       │        │          │         │
       │        └──────────┬────────┘
       │                   │
       ▼                   ▼
   ┌─────────────────────────────────────────┐
   │ 4a. Frontend receives payment success    │
   │     - Shows success modal                │
   │     - Starts 60-second countdown        │
   │     - Waits for webhook to process      │
   │                                          │
   │ 4b. Backend receives webhook from       │
   │     Paystack (charge.success event)     │
   │     - Endpoint: /api/webhook/paystack   │
   │     - Extracts email and plan info      │
   │     - Creates subscription in DB        │
   │                                          │
   └────────────────┬──────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
   [Subscription Created]  [Payment Recorded]
   - subscription_start
   - subscription_end
   - status: 'active'
   - transaction_reference
         │
         │
         ▼
   ┌────────────────────────────────────────┐
   │ 5. Frontend redirects to dashboard     │
   │    (/member-dashboard)                 │
   │                                        │
   │ 6. Dashboard fetches subscription      │
   │    - Calls fetchSubscription()         │
   │    - Displays subscription status      │
   │    - Shows expiration date             │
   │    - Shows days remaining              │
   └────────────────────────────────────────┘
```

## Key Components

### 1. Frontend Payment Initiation (pages/Membership.tsx)

**Payment Config:**
```typescript
const fwConfigMonth = {
  email,
  amount: 150000, // Amount in kobo (₦1,500)
  publicKey: 'pk_test_2688c949815725156559249feb369cefde3892bf',
  metadata: {
    custom_fields: [
      {
        display_name: 'Membership',
        variable_name: 'membership_type',
        value: '1 Month',
      },
    ],
  },
  onSuccess: (reference) => handlePaymentSuccess('Monthly', reference),
  onClose: () => handleCancel('month'),
};
```

**Payment Success Handler:**
```typescript
const handlePaymentSuccess = async (planName: string, reference: string) => {
  // Verify payment with backend
  const verifyResponse = await fetch('http://localhost:8081/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference })
  });

  // Show success modal with 60-second countdown
  setShowSuccessModal(true);
  
  // Redirect after 60 seconds (allows webhook time to process)
  setTimeout(() => {
    navigate('/member-dashboard');
  }, 60000);
};
```

### 2. Backend Webhook Handler (backend/server.js: /api/webhook/paystack)

**Webhook Endpoint:** `POST /api/webhook/paystack`

**What It Does:**
1. Receives `charge.success` event from Paystack
2. Validates the payment reference
3. Extracts user email and plan type from metadata
4. Creates subscription record in database

**Subscription Created with:**
- `user_id`: User's database ID
- `plan_id`: Plan ID (Monthly or Yearly)
- `subscription_start`: Current date
- `subscription_end`: Current date + duration (30 or 365 days)
- `status`: 'active'
- `transaction_reference`: Paystack reference (for tracking)

**Database Schema:**
```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  subscription_start DATETIME,
  subscription_end DATETIME,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  transaction_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES login(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  UNIQUE KEY unique_active_sub (user_id, status)
);
```

### 3. Subscription Fetch Endpoints

**GET /api/subscription/fetch-subscription?email=user@example.com**

Returns subscription details with plan information:
```typescript
{
  id: 1,
  user_id: 5,
  plan_id: 2,
  plan_name: "Monthly", // From plans table
  subscription_start: "2024-01-15 10:30:00",
  subscription_end: "2024-02-15 10:30:00",
  status: "active",
  transaction_reference: "reference123456",
  created_at: "2024-01-15 10:30:00",
  duration_days: 30
}
```

**GET /api/subscription/plans**

Returns available subscription plans:
```typescript
[
  {
    id: 1,
    plan_name: "Monthly",
    price: 1500,
    duration_days: 30
  },
  {
    id: 2,
    plan_name: "Yearly",
    price: 15000,
    duration_days: 365
  }
]
```

### 4. Frontend Subscription Service (services/subscriptionService.ts)

```typescript
export const subscriptionService = {
  // Fetch user's subscription info
  fetchSubscription: async (email: string) => {
    const res = await axios.get(`/api/subscription/fetch-subscription`, { 
      params: { email } 
    });
    return res.data; // Returns Subscription type
  },

  // Cancel subscription
  cancelSubscription: async (email: string) => {
    const res = await axios.post(`/api/subscription/cancel-subscription`, { email });
    return res.data;
  },

  // Get all subscription plans
  getSubscriptionPlans: async () => {
    const res = await axios.get(`/api/subscription/plans`);
    return res.data;
  },
};
```

### 5. Subscription Status Display Components

**SubscriptionStatus Component** (components/SubscriptionStatus.tsx)

Reusable component to display subscription status across the app:

```typescript
interface SubscriptionStatusProps {
  showDetails?: boolean;  // Detailed view with expiration
  className?: string;
}

// Usage in pages:
<SubscriptionStatus showDetails={true} />
```

**MemberDashboard** (pages/MemberDashboard.tsx)

Displays full subscription information:
- Subscription status (active/cancelled)
- Plan name (Monthly/Yearly)
- Days remaining
- Expiration date
- Cancel button

## Data Flow Summary

### 1. User Makes Payment
```
Frontend → Paystack Modal
         ↓
      User enters payment details
         ↓
      Paystack processes payment
```

### 2. Payment Success
```
Paystack → Frontend callback (reference)
         ↓
   Frontend shows success modal
         ↓
   Frontend verifies with backend
         ↓
   Frontend waits 60 seconds for webhook
         ↓
   Frontend redirects to dashboard
```

### 3. Webhook Processing
```
Paystack → Backend webhook endpoint
         ↓
   Backend verifies signature
         ↓
   Backend queries user by email
         ↓
   Backend creates subscription record
         ↓
   Subscription now active in database
```

### 4. Dashboard Display
```
Frontend loads dashboard
         ↓
   Fetches subscription via API
         ↓
   Calculates days remaining
         ↓
   Displays subscription status
         ↓
   User sees their membership details
```

## Important Files

| File | Purpose |
|------|---------|
| `pages/Membership.tsx` | Payment UI and payment initiation |
| `pages/MemberDashboard.tsx` | Subscription display and management |
| `services/subscriptionService.ts` | API calls for subscription data |
| `components/SubscriptionStatus.tsx` | Reusable subscription status component |
| `backend/server.js` | Webhook handler and API endpoints |
| `types.ts` | TypeScript types for Subscription interface |

## Payment Status States

### Active Subscription
- Status: `active`
- Current date is before `subscription_end`
- User has full access to member features

### Cancelled Subscription
- Status: `cancelled`
- User cancelled their plan
- Access maintained until `subscription_end`

### Expired Subscription
- Status: `active` but current date is after `subscription_end`
- User should renew to maintain access

## Testing the Webhook

### Local Testing Setup

1. **Using Paystack Test Mode:**
   - Use test public key: `pk_test_2688c949815725156559249feb369cefde3892bf`
   - Test card: 4111 1111 1111 1111
   - Any future date for expiry
   - Any 3-digit CVC

2. **Using ngrok for Local Webhook Testing:**
   ```bash
   ngrok http 8081
   ```
   Then update Paystack dashboard webhook URL to: `https://your-ngrok-url/api/webhook/paystack`

3. **Check Webhook Processing:**
   - Monitor browser console for success modal
   - Check backend logs for webhook trigger message
   - Verify subscription created in database
   - Check MemberDashboard shows subscription

### Testing Checklist

- [ ] User can initiate payment from Membership page
- [ ] Paystack modal opens with correct amount
- [ ] Payment success shows modal with countdown
- [ ] Webhook is triggered (check backend logs)
- [ ] Subscription created in database
- [ ] Dashboard fetches and displays subscription
- [ ] Days remaining calculated correctly
- [ ] User can cancel subscription
- [ ] Cancelled status prevents renewal

## Troubleshooting

### Payment appears successful but no subscription created
- **Cause:** Webhook not receiving/processing event
- **Solution:** 
  1. Check Paystack dashboard webhook URL is correct
  2. Verify webhook event type is `charge.success`
  3. Check backend server logs for webhook trigger
  4. Ensure email in payment metadata matches database user

### Subscription displays but shows wrong expiration
- **Cause:** Duration calculation incorrect
- **Solution:**
  1. Verify plan duration_days in database
  2. Check timezone handling in subscription_end calculation
  3. Ensure MySQL uses correct timezone

### Error fetching subscription
- **Cause:** Endpoint returning wrong data type
- **Solution:**
  1. Verify `/api/subscription/fetch-subscription` includes plan_name
  2. Check query joins `plans` table
  3. Ensure email parameter is being passed

## Security Considerations

1. **Webhook Verification:** Backend verifies Paystack signature (already implemented)
2. **Email Validation:** Webhook validates user email exists before creating subscription
3. **Transaction Reference:** Stored to prevent duplicate subscriptions
4. **Status Tracking:** Clear subscription status (active/cancelled/expired) prevents unauthorized access

## Future Enhancements

- [ ] Automatic renewal reminders (10 days before expiration)
- [ ] Grace period after expiration (7 days)
- [ ] Subscription plan upgrades/downgrades
- [ ] Refund handling for failed payments
- [ ] Email notifications for subscription events
- [ ] Admin dashboard for subscription management
