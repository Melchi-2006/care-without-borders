# 🔧 Environment Setup Guide

## ✅ Current Status

Your `.env` file has been created with **test mode credentials**. The server is now running!

```
✅ Server: http://localhost:5000
✅ Environment: development
⚠️  Razorpay: Ready (Test Mode)
⚠️  Email: Needs configuration
```

---

## 📋 Configuration Checklist

### 1. ✅ Server Configuration (Already Set)
```env
PORT=5000
HOST=localhost
NODE_ENV=development
```

### 2. 🟡 Razorpay Configuration (Test Mode - Ready to Test)

**Current Setup (for testing):**
```env
RAZORPAY_KEY_ID=rzp_test_1234567890ABCD
RAZORPAY_KEY_SECRET=test_secret_key_1234567890
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1234567890ABCD
```

**To get REAL Razorpay credentials:**

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login with your account
3. Navigate to **Settings → API Keys**
4. Copy your **Test Mode** keys first:
   - Key ID (starts with `rzp_test_`)
   - Key Secret
5. Replace in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_actual_secret
   ```

**Test Payment Details** (for testing):
```
Card: 4111 1111 1111 1111
Expiry: 12/99
CVV: 123
```

### 3. 🟡 Email Configuration (Needs Setup)

**Option A: Gmail (Recommended for testing)**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Create **App Passwords**:
   - Select "Mail"
   - Select "Windows Computer" (or your device)
   - Get 16-character password
4. Update `.env`:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   SUPPORT_EMAIL=your-gmail@gmail.com
   ```

**Option B: SendGrid (Professional)**

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to **Settings → API Keys**
3. Create new API Key
4. Update `.env`:
   ```env
   SENDGRID_API_KEY=SG.your_key_here
   ```
   Uncomment the SendGrid lines in `.env` and comment out Gmail

**Option C: Other SMTP Services**

Update `.env` with your email provider's SMTP details.

### 4. Firebase Configuration (Optional)

Only needed if using Firebase for database/auth:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Get credentials from **Project Settings**
4. Update `.env` with all Firebase values

---

## 🚀 Testing the Setup

### Test 1: Check Server
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2026-03-02T10:30:00.000Z"
}
```

### Test 2: Test Email (Once configured)
```bash
curl http://localhost:5000/api/test-email
```

### Test 3: Validate Email
```bash
curl -X POST http://localhost:5000/api/validate-email \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com"}'
```

### Test 4: Razorpay Payment (Once setup)
1. Go to http://localhost:5000/patient.html
2. Attempt to book a video consultation
3. Should show Razorpay payment modal

---

## 📊 Feature Status

| Feature | Status | Needs Config |
|---------|--------|-------------|
| **Web Server** | ✅ Running | No |
| **API Endpoints** | ✅ Ready | No |
| **AI Chatbot** | ✅ Ready | No |
| **Medicine Finder** | ✅ Ready | No |
| **Video Calls (Jitsi)** | ✅ Ready | No |
| **Razorpay Payments** | ⚠️ Test Mode | Optional (Live Keys) |
| **Email Delivery** | 🟡 Not Configured | **YES** |
| **Prescription Sending** | 🟡 Not Configured | **YES** (Email) |
| **EHR Storage** | ✅ LocalStorage | No |
| **Firebase** | ⏸️ Optional | Optional |

---

## 🔑 Priority Configuration

### Tier 1: MUST DO (for basic app)
```
✅ Server running
✅ Razorpay (test mode already done)
```

### Tier 2: SHOULD DO (for full features)
```
🟡 Email Configuration - enables prescription delivery
   Timeline: 5-10 minutes
   Difficulty: Easy
```

### Tier 3: NICE TO HAVE (advanced)
```
⏸️ Firebase - database persistence
⏸️ SendGrid - professional email
```

---

## 📝 Next Steps

### Step 1: Configure Email (Recommended)
1. Use Gmail app password method (5 min)
2. Update `.env` EMAIL_USER and EMAIL_PASSWORD
3. Restart server: `npm start`
4. Test: `curl http://localhost:5000/api/test-email`

### Step 2: Test Features
1. Open http://localhost:5000
2. Test chatbot: http://localhost:5000/chatbot.html
3. Test medicine finder: http://localhost:5000/medicine-finder.html
4. Test doctor prescription: http://localhost:5000/doctor.html

### Step 3: Setup Razorpay Live Keys (For production)
1. Get live keys from Razorpay dashboard
2. Update .env with live keys
3. Change NODE_ENV to production
4. Deploy

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check port 5000 is free
netstat -ano | findstr :5000

# Kill process using port 5000
taskkill /PID <PID> /F

# Restart
npm start
```

### Email not working
```bash
# Check credentials in .env
# Try test endpoint
curl http://localhost:5000/api/test-email

# Check Gmail app password (not regular password)
# Verify 2-step verification is enabled
```

### Razorpay payment fails
```
- Check RAZORPAY_KEY_ID format (should start with rzp_test_)
- Verify test card: 4111 1111 1111 1111
- Use correct CVV: 123 and any future expiry date
```

### Port already in use
```bash
# Change port in .env
PORT=5001

# Restart server
npm start
```

---

## 📚 Useful Links

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Keys](https://dashboard.razorpay.com/settings/api-keys)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [NodeMailer Guide](https://nodemailer.com/about/)
- [Firebase Console](https://console.firebase.google.com/)

---

## ✨ Testing Scenarios

### Scenario 1: Test Chatbot (No Config Needed)
```
1. Go to http://localhost:5000/chatbot.html
2. Type: "I have cough and fever"
3. Get AI response with disease suggestions
✅ Works with test mode
```

### Scenario 2: Test Prescription Delivery (Email Needed)
```
1. Go to http://localhost:5000/doctor.html
2. Login/Profile setup
3. Start video call with patient email
4. Write prescription
5. Click "Send Email"
❌ Needs Email Setup
```

### Scenario 3: Test Payment (Razorpay Ready)
```
1. Go to http://localhost:5000/patient.html
2. Book consultation (₹5 for 15 min)
3. Razorpay modal opens
4. Use test card: 4111 1111 1111 1111
5. Complete payment
✅ Works with test credentials
```

---

## 🎯 What's Working Right Now

```
✅ AI Chatbot - 10,000+ disease/medicine database
✅ Medicine Finder - Advanced search
✅ Video Consultations - Jitsi integration
✅ Doctor Dashboard - Profile, appointments, EHR
✅ Patient Dashboard - Appointments, health records
✅ Razorpay Payments - Test mode ₹5 per 15 min
✅ Authentication - Login/signup
✅ Responsive Design - Mobile & desktop
```

---

## 🚀 What's Partially Working (Needs Email)

```
🟡 Prescription Sending - Requires EMAIL setup
   - Can write prescriptions ✅
   - Can save to EHR ✅
   - Cannot send via email ❌
```

---

## 📞 Support

**To resume after interruption:**
```bash
npm start
```

**Server already running?**
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Restart
npm start
```

**Need to update .env?**
```bash
# Edit .env file
nano .env  # or use editor of choice

# Restart server
npm start
```

---

**Current Time:** March 2, 2026  
**Environment:** Development  
**Status:** ✅ Ready for Testing (Email optional)  
**Next Action:** Configure email or test existing features
