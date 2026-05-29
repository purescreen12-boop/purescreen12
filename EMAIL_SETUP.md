# Email Setup Guide for OTP

## Overview
This guide explains how to configure the email service for OTP functionality in GospelScreen TV using Nodemailer.

## Current Setup
- **Frontend**: Clean React/TypeScript app
- **Backend**: Express.js with MySQL and integrated email service on port 8081
- **Email Service**: Integrated into main server (no separate service needed)
- **OTP System**: Database-stored tokens with expiry

## Architecture

```
Frontend (React) → Backend API (Express:8081 with Email Service)
                                      ↓
                               MySQL Database (OTP storage)
```

## Email Service Configuration

### Environment Variables
Update `backend/.env` with your email credentials:

```env
# Email Service Configuration
MY_EMAIL=your-real-gmail@gmail.com
MY_PASSWORD=your-gmail-app-password
```

## Starting the Service

### Start Main Backend (includes email service)
```bash
cd backend
node server.js
```
This starts both the API and email service on `http://localhost:8081`

## Gmail Setup (Required)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable

### Step 2: Generate App Password
1. Security → 2-Step Verification → App passwords
2. Select "Mail" and "Other (custom name)"
3. Enter "GospelScreen TV"
4. Copy the 16-character password

### Step 3: Update .env
```env
MY_EMAIL=your-gmail@gmail.com
MY_PASSWORD=your-16-character-app-password
```

## Testing Email Sending

1. **Start the Backend**:
   ```bash
   cd backend && node server.js
   ```

2. **Test Email Service Directly**:
   ```bash
   curl -X POST http://localhost:8081/send_recovery_email \
     -H "Content-Type: application/json" \
     -d '{"recipient_email":"test@example.com","OTP":"123456"}'
   ```

3. **Test Through Main App**: Use forgot password in your React app

## Current Status

- ✅ **Email Service**: Integrated into `backend/server.js` (port 8081)
- ✅ **Main Backend**: `backend/server.js` (port 8081)
- ✅ **OTP Generation**: Working
- ✅ **Email Templates**: Custom GospelScreen TV branding
- ⚠️ **Email Sending**: Needs Gmail credentials
- ✅ **Main Backend**: `backend/server.js` (port 8081)
- ✅ **OTP Generation**: Working
- ✅ **Email Templates**: Custom GospelScreen TV branding
- ⚠️ **Email Sending**: Needs Gmail credentials

## Troubleshooting


### "Email sent successfully" but no email received
- Check spam/junk folder
- Verify Gmail app password is correct
- Check Gmail account settings

### "Authentication failed"
- Use App Password, not regular password
- Verify 2FA is enabled on Gmail account

## Email Service API

### Endpoint: `POST /send_recovery_email`

**Request Body:**
```json
{
  "recipient_email": "user@example.com",
  "OTP": "123456"
}
```

**Response:**
```json
"Email sent succesfuly"
```

## Production Deployment

1. **Environment Variables**: Set `MY_EMAIL` and `MY_PASSWORD` in production
2. **Security**: Store credentials securely (not in code)
3. **Monitoring**: Add logging for email delivery status
4. **Rate Limiting**: Implement email sending limits
5. **Backup**: Have fallback email providers

## Files Involved

- `backend/server.js` - Main API with integrated email service
- `backend/.env` - Email credentials
- `EMAIL_SETUP.md` - This setup guide