# 🚀 Quick Start: Razorpay Integration for Care Without Borders

## ⚡ 5-Minute Setup

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com
2. Click **Sign Up** → Select **Business Account**
3. Enter business details and verify email
4. Complete KYC verification (takes 1-2 hours)

### Step 2: Get API Keys
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Copy **Key ID** and **Key Secret** (keep secret!)
4. Switch to **Test Mode** for development

### Step 3: Setup Project
```bash
# Install dependencies
npm install

# Create .env file in project root
# Add your Razorpay credentials:
# RAZORPAY_KEY_ID=rzp_test_xxx
# RAZORPAY_KEY_SECRET=xxx
```

### Step 4: Copy .env.example
```bash
# Copy template
copy .env.example .env

# Edit .env with your credentials
# RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 5: Update Frontend Config
Edit `js/razorpay.js`:
```javascript
export const RAZORPAY_KEY_ID = "YOUR_KEY_ID_HERE";
```

### Step 6: Start Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs at: http://localhost:5000

## 📁 Important Files

| File | Purpose |
|------|---------|
| `js/razorpay.js` | Frontend payment handler |
| `api/razorpay.js` | Backend payment processor |
| `server.js` | Express server |
| `video-room.html` | Video consultation interface |
| `.env` | Configuration (credentials) |
| `RAZORPAY_INTEGRATION.md` | Full documentation |

## 🎯 Features Included

✅ **Payment Integration**
- ₹5 for 15-minute consultation
- Secure payment processing
- Signature verification

✅ **Video Consultation**
- HD video/audio
- Live chat
- Auto session timer
- Microphone & camera controls

✅ **Error Handling**
- Payment failure recovery
- Network error handling
- Session timeout management

## 🧪 Testing

**Test Card Details:**
- Card: `4111 1111 1111 1111`
- Expiry: `12/25` (any future date)
- CVV: `123` (any 3 digits)
- OTP: `123456` (any 6 digits)

**Start Test Consultation:**
1. Go to http://localhost:5000/patient.html
2. Click "Video Consultation" panel
3. Select a doctor
4. Click "Start" button (₹5)
5. Use test card details
6. See video room open

## 📊 Pricing Details

| Metric | Value |
|--------|-------|
| **Cost** | ₹5 |
| **Duration** | 15 minutes |
| **Currency** | INR |
| **Amount in paise** | 500 |

## 🔧 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/create-order` | Create payment order |
| POST | `/api/verify-payment` | Verify payment signature |
| GET | `/api/payment-status/:id` | Get payment status |
| POST | `/api/refund-payment` | Process refund |
| GET | `/api/health` | Health check |

## ⚠️ Common Issues & Solutions

**Issue: "Razorpay script not loading"**
```
Solution: Check internet connection & browser console for errors
```

**Issue: "Key ID not found"**
```
Solution: Ensure .env file exists with correct RAZORPAY_KEY_ID
```

**Issue: "Signature verification failed"**
```
Solution: Verify Key Secret is correct in .env file
```

**Issue: "CORS error"**
```
Solution: Check origin in server.js CORS configuration
```

## 🔐 Security Checklist

- [ ] Store credentials in `.env` file (never in code)
- [ ] `.env` file added to `.gitignore`
- [ ] Use HTTPS in production
- [ ] Never expose Key Secret
- [ ] Verify all payments on backend
- [ ] Store payment records in database
- [ ] Implement rate limiting
- [ ] Log all transactions

## 📱 Integration Points

### Option 1: Add to Patient Dashboard
```html
<button onclick="window.location.href='video-room.html?doctorId=doc123'">
  💰 Start Video Call (₹5)
</button>
```

### Option 2: Use Component
Reference `video-consultation-component.html` for full doctor selection UI

### Option 3: From Appointment
```javascript
// After booking appointment
const appointmentId = appointment.id;
window.location.href = `video-room.html?appointmentId=${appointmentId}`;
```

## 🚀 Production Deployment

1. **Switch to Live Mode:**
   - Go to Razorpay Dashboard
   - Settings → Keys → Switch to live mode
   - Update .env with live credentials

2. **Use HTTPS:**
   - Get SSL certificate
   - Update frontend URLs

3. **Database Integration:**
   - Store payments in Firestore
   - Create payment records
   - Send notifications

4. **Monitoring:**
   - Setup error tracking
   - Log all transactions
   - Monitor payment failures

## 📞 Support

- **Razorpay Docs:** https://razorpay.com/docs/
- **Razorpay Support:** support@razorpay.com
- **API Status:** https://status.razorpay.com

## 📝 Next Steps

1. ✅ Setup account & get keys
2. ✅ Install dependencies
3. ✅ Update .env file
4. ✅ Update frontend config
5. ✅ Start server
6. ✅ Test payment flow
7. ✅ Deploy to production

---

**Created:** March 2026  
**Last Updated:** March 2026  
**Version:** 1.0.0
