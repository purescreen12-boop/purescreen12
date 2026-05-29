# Paystack Webhook Setup Guide

## How the Webhook System Works

Instead of relying on the frontend to create subscriptions after payment, we now use **Paystack webhooks** which is the industry best practice:

```
User Makes Payment
    ↓
Paystack Processes Payment
    ↓
Paystack Sends Webhook → Backend
    ↓
Backend Verifies Payment
    ↓
Backend Creates Subscription in Database
    ↓
Frontend Redirects to Dashboard
    ↓
Dashboard Fetches and Displays Subscription
```

### Benefits:
- ✅ **Reliable**: Works even if frontend crashes after payment
- ✅ **Secure**: Backend-to-backend communication
- ✅ **Accurate**: No double charging or missing subscriptions
- ✅ **Industry Standard**: How real payment systems work

---

## Setup Instructions

### Step 1: Configure Paystack Dashboard

1. Log in to [Paystack Dashboard](https://dashboard.paystack.co)
2. Go to **Settings** → **API Keys & Webhooks**
3. Find the **Webhooks** section
4. Set the **Webhook URL** to:
   ```
   http://your-domain.com/api/webhook/paystack
   ```

**For Local Testing:**
```
http://localhost:8081/api/webhook/paystack
```

5. Make sure these events are **enabled**:
   - ✅ `charge.success`

6. Click **Save**

### Step 2: Backend Endpoints

The backend now has these webhook-related endpoints:

#### Webhook Endpoint (Receives Payment Notifications)
```
POST /api/webhook/paystack
```
Paystack sends POST requests here when payment succeeds. No action needed from you - it's automatic.

#### Verification Endpoint (Optional - For Testing)
```
POST /api/verify-payment
Body: { "reference": "paystack_reference_code" }
```
Used by frontend to verify payment manually.

### Step 3: Testing Locally

Since local webhooks can't be reached from Paystack servers, use this workaround:

**Option A: Use Ngrok (Recommended)**
1. Download ngrok from https://ngrok.com
2. Run: `ngrok http 8081`
3. You'll get a URL like: `https://xxxx-xxx-xxx.ngrok.io`
4. Set webhook URL in Paystack to: `https://xxxx-xxx-xxx.ngrok.io/api/webhook/paystack`
5. Now test payments - webhook will work!

**Option B: Test in Production**
Just test with real payments in production (use test Paystack keys)

---

## Backend Code

### Webhook Endpoint Location
**File:** `backend/server.js` (Lines ~1222)

```javascript
app.post('/api/webhook/paystack', (req, res) => {
    const event = req.body;
    
    if (event.event === 'charge.success') {
        const reference = event.data.reference;
        const email = event.data.customer.email;
        const metadata = event.data.metadata;
        
        // Subscription is created here automatically
    }
});
```

### What Happens:
1. Paystack sends webhook with payment details
2. Backend extracts `email`, `reference`, and `plan` from metadata
3. Backend finds user in `login` table by email
4. Backend creates subscription in `subscriptions` table
5. Subscription is now active! ✅

---

## Frontend Integration

**File:** `pages/Membership.tsx`

After payment:
1. `onSuccess` callback receives payment `reference`
2. Frontend calls `/api/verify-payment` with reference (optional)
3. Frontend redirects to Member Dashboard
4. Dashboard fetches subscription (which was created by webhook)

---

## How to Check If Webhook Worked

### In Paystack Dashboard:
1. Go to **Settings** → **Webhooks**
2. Scroll down to see recent webhook deliveries
3. Green checkmark = successful
4. Red X = failed

### In Database:
```sql
SELECT * FROM subscriptions 
WHERE subscription_start >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
```
Should show the subscription created via webhook.

### In Backend Logs:
Look for:
```
Webhook received from Paystack: charge.success
Processing payment success for: user@example.com
✓ Subscription created via webhook for user: 123
```

---

## Production Checklist

Before going live:

- [ ] Set Paystack to **Live Mode** (not test mode)
- [ ] Update webhook URL to production domain
- [ ] Use production Paystack secret key
- [ ] Test with real payment
- [ ] Verify subscription appears in dashboard
- [ ] Check database for subscription record
- [ ] Monitor logs for any errors

---

## Troubleshooting

### Webhook Not Received
- **Check:** Is backend running? Is it accessible from internet (or ngrok)?
- **Check:** Is webhook URL correct in Paystack dashboard?
- **Check:** Are firewall/security settings blocking it?

### Subscription Not Created
- **Check:** Is MySQL connected? `http://localhost:8081/api/health` should show "database":"connected"
- **Check:** Does user exist in `login` table?
- **Check:** Do `plans` table have data (id 1 & 2)?
- **Check:** Backend logs for errors

### Payment Reference Not Passed
- **Check:** Paystack `onSuccess` callback structure
- **Check:** Reference format is correct

---

## Webhook Payload Example

When Paystack sends a webhook, it looks like this:

```json
{
  "event": "charge.success",
  "data": {
    "reference": "7epzoa6ybr",
    "customer": {
      "email": "user@example.com",
      "id": 123456
    },
    "amount": 150000,
    "metadata": {
      "membership_type": "1 Month",
      "custom_fields": [...]
    }
  }
}
```

The backend automatically:
- Extracts the email
- Looks up the user
- Determines plan type from metadata
- Creates subscription with proper end date
- Returns success response to Paystack

---

## Security Notes

- ✅ Webhook comes directly from Paystack (trusted source)
- ✅ We verify the email matches a real user before creating subscription
- ✅ Plan duration comes from database (can't be spoofed)
- ⚠️ In production, also verify Paystack signature on webhook
  (To prevent someone faking a webhook)

To add signature verification in production:
```javascript
const crypto = require('crypto');
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (hash !== req.headers['x-paystack-signature']) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## Contact

For Paystack support: https://support.paystack.com
