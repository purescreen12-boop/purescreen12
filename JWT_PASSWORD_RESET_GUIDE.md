# JWT-Based Password Reset with Nodemailer Implementation

## Overview

This guide explains the complete implementation of JWT-based password reset functionality with Nodemailer email notifications for GospelScreen TV.

## System Architecture

```
User Request (Frontend)
    ↓
POST /api/forgot-password (email)
    ↓
Backend generates JWT token (1 hour expiry)
    ↓
Nodemailer sends email with reset link containing JWT
    ↓
User clicks link → Frontend extracts JWT from URL
    ↓
POST /api/verify-reset-token (JWT token)
    ↓
POST /api/reset-password (JWT token + new password)
    ↓
Password updated in database
```

## Configuration

### 1. Environment Variables (.env)

Add these to your `backend/.env` file:

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

### 2. Gmail Setup (Required)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](httpsd://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Go to "How you sign in to Google"
4. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go back to Security settings
2. Find "App passwords" (appears after enabling 2FA)
3. Select "Mail" and "Other (custom name)"
4. Enter "GospelScreen TV" as the custom name
5. Copy the 16-character password
6. Paste it as `MY_PASSWORD` in your `.env` file

## API Endpoints

### 1. Forgot Password

**Endpoint:** `POST /api/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

**Process:**
- Validates if user exists (doesn't reveal existence for security)
- Generates JWT token with 1-hour expiry
- Sends email with reset link containing JWT
- Returns generic message for security

**JWT Token Payload:**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "iat": 1712345678,
  "exp": 1712349278
}
```

### 2. Verify Reset Token

**Endpoint:** `POST /api/verify-reset-token`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Valid):**
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

**Response (Expired):**
```json
{
  "valid": false,
  "error": "Reset link has expired. Please request a new password reset."
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Invalid reset link."
}
```

**Process:**
- Verifies JWT signature and expiry
- Confirms user still exists in database
- Returns user info for frontend validation

### 3. Reset Password

**Endpoint:** `POST /api/reset-password`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Response (Expired Token):**
```json
{
  "error": "Reset link has expired. Please request a new password reset."
}
```

**Validation Rules:**
- Password must be at least 8 characters long
- JWT token must be valid and not expired
- User must exist in database

**Process:**
1. Verifies JWT token
2. Validates new password length
3. Hashes new password using bcrypt
4. Updates password in database
5. Returns success message

## Email Template

The password reset email includes:

- Professional HTML template with GospelScreen TV branding
- Clickable "Reset My Password" button
- Fallback text link for email clients that don't support buttons
- Security notice about 1-hour expiry
- Footer with company information
- Responsive design for mobile and desktop

**Email Subject:** `GOSPELSCREEN TV - Password Reset`

## Frontend Integration

### Example React Implementation

```typescript
// 1. Request password reset
const handleForgotPassword = async (email: string) => {
  const response = await fetch('http://localhost:8081/api/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  console.log(data.message);
};

// 2. Extract token from URL and verify
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get('token');

const verifyToken = async () => {
  const response = await fetch('http://localhost:8081/api/verify-reset-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken })
  });
  return await response.json();
};

// 3. Submit new password
const handleResetPassword = async (newPassword: string) => {
  const response = await fetch('http://localhost:8081/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: resetToken,
      newPassword
    })
  });
  const data = await response.json();
  if (response.ok) {
    console.log('Password reset successfully');
    // Redirect to login
  } else {
    console.error(data.error);
  }
};
```

## Security Features

### 1. Token Security
- **JWT Signature:** Tokens are cryptographically signed with `JWT_RESET_SECRET`
- **Expiry:** Tokens expire after 1 hour
- **No Database Storage:** Token validity is verified via JWT signature, not database lookups
- **Unique Secrets:** Separate `JWT_RESET_SECRET` from authentication tokens

### 2. Password Security
- **Bcrypt Hashing:** Passwords hashed with bcrypt salt of 10
- **Minimum Length:** 8 characters required
- **No Plain Text:** Passwords never logged or exposed

### 3. Email Security
- **SMTP/TLS:** Gmail SMTP with port 465 (secure)
- **App Password:** Uses Gmail app-specific password instead of main password
- **Generic Messages:** Doesn't reveal account existence

### 4. General Security
- **Rate Limiting Recommended:** Implement on `/api/forgot-password` to prevent abuse
- **HTTPS Required:** Always use HTTPS in production
- **CORS Configured:** Full CORS setup in Express

## Troubleshooting

### Email Not Sending

**Problem:** Emails not being sent but no error logs

**Solutions:**
1. Verify Gmail credentials in `.env`
2. Check if 2FA is enabled on Gmail account
3. Verify app password is correct (16 characters)
4. Check firewall/anti-virus isn't blocking SMTP (port 465)
5. Enable "Less secure app access" if 2FA isn't working

**Fallback:** Tokens are logged to console if email fails:
```
Reset link for user@example.com: http://localhost:5173/reset-password?token=...
```

### Token Expired Before User Can Reset

**Problem:** User gets "Reset link has expired" error

**Solution:** 
- Increase token expiry in `/api/forgot-password`:
```javascript
// Change from '1h' to '2h' or '24h'
const resetToken = jwt.sign(
    { userId: user.id, email: user.email },
    jwtResetSecret,
    { expiresIn: '2h' }  // Changed from '1h'
);
```

### Wrong Email/Password in .env

**Problem:** Getting "Error: Invalid login" or 530 SMTP error

**Solution:**
1. Double-check `.env` file for correct email and app password
2. Ensure path to `.env` file is correct (should be in `backend/` directory)
3. Restart Node.js server after changing `.env`
4. Verify Gmail 2FA and app password generation

## Testing

### Manual Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Test Forgot Password:**
   ```bash
   curl -X POST http://localhost:8081/api/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Check Console for JWT Token:**
   Look for output like:
   ```
   JWT reset token generated for test@example.com
   Reset link for test@example.com: http://localhost:5173/reset-password?token=eyJhbGc...
   ```

4. **Test Verify Token:**
   ```bash
   curl -X POST http://localhost:8081/api/verify-reset-token \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_JWT_TOKEN_HERE"}'
   ```

5. **Test Reset Password:**
   ```bash
   curl -X POST http://localhost:8081/api/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_JWT_TOKEN_HERE","newPassword":"NewPassword123"}'
   ```

## Migration from Old System

If migrating from the previous bcrypt token system:

1. Update `.env` with new variables
2. Deploy updated `server.js` files
3. Old columns (`reset_token`, `reset_token_expiry`) can remain in database but won't be used
4. Existing password reset links will no longer work (expected behavior)

## Dependencies

Ensure these are installed in `backend/package.json`:

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.x.x",
    "nodemailer": "^7.0.12",
    "bcrypt": "^6.0.0",
    "express": "^5.2.1",
    "dotenv": "^17.2.3"
  }
}
```

## Production Deployment

### Checklist

- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update `MY_EMAIL` and `MY_PASSWORD` with production Gmail account
- [ ] Use strong, unique values for `JWT_SECRET` and `JWT_RESET_SECRET`
- [ ] Enable HTTPS on frontend and backend
- [ ] Configure CORS properly for production domain
- [ ] Implement rate limiting on `/api/forgot-password`
- [ ] Set up monitoring/alerting for email failures
- [ ] Test email delivery to various providers
- [ ] Store secrets in secure environment management (not in .env in production)

### Environment Variables (Production)

Use a secure secrets manager (AWS Secrets Manager, Azure Key Vault, etc.):

```
MY_EMAIL: [stored in secrets manager]
MY_PASSWORD: [stored in secrets manager]
JWT_SECRET: [strong random string]
JWT_RESET_SECRET: [strong random string]
FRONTEND_URL: https://purescreen.site
```

## Support & Issues

For issues or questions:
1. Check this documentation
2. Review server logs for JWT verification errors
3. Check browser console for frontend errors
4. Verify email configuration in Nodemailer
5. Test endpoints using curl or Postman

---

**Last Updated:** April 2026
**Version:** 1.0 - JWT-Based Reset
