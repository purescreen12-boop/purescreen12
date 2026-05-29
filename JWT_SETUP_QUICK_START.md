# JWT Password Reset Setup - Quick Start Guide

## ✅ What Has Been Implemented

Your GospelScreen TV application now has a complete JWT-based password reset system with Nodemailer email support.

### Features:
- **JWT Tokens**: Secure 1-hour password reset tokens
- **Nodemailer Integration**: Professional HTML emails with password reset links
- **Password Validation**: Minimum 8 characters with strength indicator
- **Security**: Bcrypt password hashing, no database token storage needed
- **Error Handling**: Comprehensive error messages and validation

## 📋 Setup Checklist

### Step 1: Install Missing Dependencies

```bash
cd backend
npm install jsonwebtoken
```

**Verify installation:**
```bash
npm list jsonwebtoken nodemailer
```

You should see:
```
├── jsonwebtoken@^9.x.x
└── nodemailer@^7.0.12
```

### Step 2: Configure Environment Variables

Edit `backend/.env` and update these values:

```env
# Email Configuration (Gmail SMTP)
MY_EMAIL=your-email@gmail.com
MY_PASSWORD=your-gmail-app-password

# JWT Configuration
JWT_SECRET=BwxqVSWr2yblxKMQ6OcJlA75QvjDktVBG4NxbWK4
JWT_RESET_SECRET=ResetTokenSecret123456XYZ789ABC!@#$%^

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:5173
```

### Step 3: Gmail Configuration (Required for Email Sending)

1. **Go to Google Account Settings:**
   - Visit https://myaccount.google.com/
   - Click "Security" in the left sidebar

2. **Enable 2-Step Verification:**
   - Find "How you sign in to Google"
   - Enable "2-Step Verification"
   - Follow the setup process

3. **Generate App Password:**
   - Go back to Security settings
   - Find "App passwords" (appears after 2FA is enabled)
   - Select "Mail" and "Windows Computer" (or your platform)
   - Select "Custom name" and enter "GospelScreen TV"
   - Google will generate a 16-character password
   - Copy this password and paste into `MY_PASSWORD` in `.env`

**Example:**
```env
MY_EMAIL=gospelscreen@gmail.com
MY_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Start the Backend Server

```bash
cd backend
node server.js
```

You should see output like:
```
Server running on port 8081
JWT Reset Password system initialized
```

### Step 5: Test the Implementation

#### Option A: Using cURL (Command Line)

**1. Request Password Reset:**
```bash
curl -X POST http://localhost:8081/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Expected response:
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

Check server console for JWT token output:
```
JWT reset token generated for user@example.com
Reset link for user@example.com: http://localhost:5173/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Verify Token (Copy token from console):**
```bash
curl -X POST http://localhost:8081/api/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

Expected response:
```json
{
  "valid": true,
  "message": "Token is valid",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**3. Reset Password:**
```bash
curl -X POST http://localhost:8081/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","newPassword":"NewPassword123!"}'
```

Expected response:
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

#### Option B: Using the Test Script

```bash
cd backend
node test-jwt-reset.js
```

#### Option C: Using Postman

1. Open Postman
2. Create POST request to: `http://localhost:8081/api/forgot-password`
3. Body (raw JSON):
```json
{
  "email": "user@example.com"
}
```
4. Send and check server logs for JWT token
5. Copy token and test other endpoints

## 📁 Files Modified/Created

### Backend Changes:
- **`backend/server.js`** - Updated with:
  - `sendResetEmail()` - Sends JWT token via Nodemailer
  - `/api/forgot-password` - Generates JWT token for password reset
  - `/api/verify-reset-token` - Validates JWT token
  - `/api/reset-password` - Resets password with JWT validation

- **`backend/.env`** - Added:
  - Email configuration (MY_EMAIL, MY_PASSWORD)
  - JWT secrets (JWT_SECRET, JWT_RESET_SECRET)
  - Frontend URL for reset links

- **`backend/test-jwt-reset.js`** - Test script for the implementation

### Frontend Changes:
- **`pages/ResetPassword.tsx`** - Updated with:
  - JWT token verification on load
  - Password strength indicator
  - Enhanced error handling
  - Improved UI/UX

- **`pages/ForgotPassword.tsx`** - Already integrated

## 🔐 Security Notes

### What's Secure:
✓ JWT tokens are cryptographically signed
✓ Tokens expire after 1 hour
✓ Passwords hashed with bcrypt (salt 10)
✓ No token storage in database
✓ Email doesn't reveal account existence
✓ HTTPS ready for production

### What You Should Do:
- [ ] Update JWT secrets to strong random values in production
- [ ] Use environment variables from secure manager (not .env in production)
- [ ] Implement rate limiting on `/api/forgot-password`
- [ ] Enable HTTPS in production
- [ ] Monitor email sending failures
- [ ] Set up logging and alerting

## 🚀 Frontend Integration

The ForgotPassword page already sends requests to:
```
POST /api/forgot-password
```

The ResetPassword page (updated) handles:
1. Extracting JWT from URL: `?token=...`
2. Verifying token: `POST /api/verify-reset-token`
3. Resetting password: `POST /api/reset-password`

No additional frontend changes needed!

## 🔧 Troubleshooting

### Emails Not Sending

**Problem:** Forgot password works but emails don't arrive

**Solutions:**
1. Check `.env` file is in `backend/` directory
2. Verify Gmail 2FA is enabled
3. Verify app password is correct (should be 16 characters with spaces)
4. Check Gmail security settings allow "Less secure app access"
5. Restart Node.js server after changing `.env`

**Fallback:** Tokens are logged to console if email fails:
```
Reset link for user@example.com: http://localhost:5173/reset-password?token=...
```

### Token Expired Error

**Problem:** User gets "Reset link has expired" error immediately

**Cause:** Token expiry might be set too short

**Solution:** Update in `backend/server.js` (line ~933):
```javascript
// Change from '1h' to '24h'
const resetToken = jwt.sign(
    { userId: user.id, email: user.email },
    jwtResetSecret,
    { expiresIn: '24h' }  // <-- Change here
);
```

### "Cannot find module 'jsonwebtoken'"

**Problem:** Server crashes with this error

**Solution:**
```bash
cd backend
npm install jsonwebtoken
npm start
```

### Email Credentials Error

**Problem:** "Invalid login" or "535-5.7.8" error

**Solution:**
1. Double-check email and app password
2. Verify Gmail 2FA is enabled
3. Wait a few minutes after generating app password
4. Try disabling firewall temporarily to test

## 📧 Email Template Preview

Users will receive an email that includes:
- Professional GospelScreen TV branding
- Clickable "Reset My Password" button
- Fallback text link for compatibility
- Security notice about 1-hour expiry
- Company footer information

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install jsonwebtoken`
2. ✅ Configure `.env` with Gmail credentials
3. ✅ Test the endpoints using cURL or Postman
4. ✅ Test the complete flow in browser
5. ✅ Deploy to production with secure configs

## 📚 Documentation

For more details, see:
- [JWT_PASSWORD_RESET_GUIDE.md](./JWT_PASSWORD_RESET_GUIDE.md) - Complete technical documentation
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Email configuration details

## 🆘 Need Help?

1. Check server logs: `node server.js` output
2. Read JWT_PASSWORD_RESET_GUIDE.md for detailed troubleshooting
3. Verify .env is in correct location (`backend/.env`)
4. Test with example requests in this guide

---

**Implementation Date:** April 2026
**Status:** ✅ Complete and Ready for Testing
