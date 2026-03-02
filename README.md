# 💳 Razorpay Payment Integration - Complete Guide

## 📋 Overview

This integration enables secure payments for video consultations in the Care Without Borders healthcare platform.

**Pricing:** ₹5 for 15 minutes of consultation

## 🎯 What's Included

### 1. **Frontend Components**
- `js/razorpay.js` - Payment handler (initiate, verify, success/failure)
- `video-room.html` - Video consultation interface with payment
- `video-consultation-component.html` - Doctor selection UI
- `js/payment-utils.js` - Session & billing management utilities

### 2. **Backend API**
- `api/razorpay.js` - Express routes for order creation & verification
- `server.js` - Main server configuration
- Routes:
  - `POST /api/create-order` - Create Razorpay order
  - `POST /api/verify-payment` - Verify payment signature
  - `GET /api/payment-status/:id` - Check payment status
  - `POST /api/refund-payment` - Process refund

### 3. **Utilities**
- `js/payment-utils.js` - Session management, billing, analytics
- Classes:
  - `PaymentSession` - Track individual consultation sessions
  - `BillingManager` - Calculate bills and refunds
  - `SessionManager` - Manage multiple sessions
  - `WalletManager` - Patient wallet system
  - `ConsultationAnalytics` - Generate reports

### 4. **Documentation**
- `QUICK_START.md` - 5-minute setup guide
- `RAZORPAY_INTEGRATION.md` - Detailed technical documentation
- `.env.example` - Configuration template

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- npm or yarn
- Razorpay account (free)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your Razorpay credentials
# Edit .env and add:
# RAZORPAY_KEY_ID=rzp_test_XXXXX
# RAZORPAY_KEY_SECRET=XXXXX

# 4. Start server
npm start
```

Server runs at: `http://localhost:5000`

## 💰 Pricing Structure

| Metric | Value |
|--------|-------|
| Consultation Cost | ₹5 |
| Duration | 15 minutes |
| Currency | INR |
| Amount in paise | 500 |

## 🏗️ Architecture

```
User Browser (Razorpay Checkout)
        ↓
   Frontend (js/razorpay.js)
        ↓
   Backend API (/api/razorpay.js)
        ↓
  Razorpay Gateway
        ↓
   Payment Verification
        ↓
  Video Session Starts
```

## 📖 Usage Examples

### 1. Initiate Payment

```javascript
import { initiateVideoCallPayment } from './js/razorpay.js';
import { auth } from './js/firebase.js';

// Start payment
await initiateVideoCallPayment(
  patientId,
  patientEmail,
  patientName,
  doctorId
);
```

### 2. Create & Manage Session

```javascript
import { SessionManager, BillingManager } from './js/payment-utils.js';

// Start session
const session = SessionManager.startSession(
  patientId,
  doctorId,
  paymentId,
  500  // ₹5 in paise
);

// Get remaining time
const remaining = session.formatRemainingTime(); // "15:00"

// End session & calculate refund
const result = SessionManager.endSession(sessionId);
console.log(result.refundMessage); // Refund amount if applicable
```

### 3. Manage Wallet

```javascript
import { WalletManager } from './js/payment-utils.js';

// Initialize wallet
WalletManager.initializeWallet(patientId, 1000); // ₹10 initial balance

// Add funds
WalletManager.addFunds(patientId, 500, transactionId);

// Deduct funds
WalletManager.deductFunds(patientId, 500, sessionId);

// Get balance
const balance = WalletManager.formatBalance(patientId); // "₹5.00"
```

### 4. Get Analytics

```javascript
import { ConsultationAnalytics } from './js/payment-utils.js';

const metrics = ConsultationAnalytics.calculateMetrics();
console.log(metrics);
// {
//   totalConsultations: 42,
//   totalRevenue: 210000,
//   averageSessionDuration: 600,
//   totalPatients: 15,
//   totalDoctors: 5,
//   ...
// }
```

## 🔐 Security Implementation

### Payment Verification
```javascript
// Backend verifies payment signature
const signature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

// Verify matches
if (signature === razorpaySignature) {
  // Payment is legitimate
}
```

### Best Practices
✅ Store credentials in `.env`  
✅ Verify all payments on backend  
✅ Use HTTPS in production  
✅ Never expose Key Secret  
✅ Log all transactions  
✅ Implement rate limiting  

## 🧪 Testing

### Test Credentials
- **Card:** 4111 1111 1111 1111
- **Expiry:** 12/25 (any future date)
- **CVV:** 123 (any 3 digits)
- **OTP:** 123456 (any 6 digits)

### Test Payment Flow
1. Go to `http://localhost:5000/patient.html`
2. Click video consultation panel
3. Select a doctor
4. Click "Start Consultation" (₹5)
5. Use test card:
   - Card: 4111 1111 1111 1111
   - Expiry: 12/25
   - CVV: 123
6. Approve OTP
7. Video room opens with 15-minute timer

## 📱 Integration Points

### Add to Patient Dashboard
```html
<div id="videoPanel">
  <h3>Video Consultation - ₹5/15 minutes</h3>
  <button onclick="window.location.href='video-room.html?doctorId=123'">
    Start Video Call
  </button>
</div>
```

### Add to Appointment Page
```javascript
// After booking appointment
await appointmentDoc.set({
  ...appointmentData,
  paymentRequired: true,
  consultationRate: 500 // paise
});

// Show "Pay Now" button
document.getElementById('payNow').addEventListener('click', () => {
  window.location.href = `video-room.html?appointmentId=${appointmentId}`;
});
```

### Add to Doctor Dashboard
```javascript
// Show earnings
const earnings = ConsultationAnalytics.getTotalRevenue();
document.getElementById('earningsDisplay').textContent = 
  `Total Earnings: ₹${(earnings/100).toFixed(2)}`;
```

## 📊 Database Schema (Firebase)

### Payments Collection
```javascript
{
  paymentId: "pay_XXXXX",
  patientId: "user123",
  doctorId: "doc456",
  amount: 500,
  currency: "INR",
  status: "success",
  consultationType: "video_call",
  duration: 15, // minutes
  timestamp: Timestamp,
  orderId: "order_XXXXX",
  signature: "XXXXX"
}
```

### Sessions Collection
```javascript
{
  sessionId: "session_123456",
  paymentId: "pay_XXXXX",
  patientId: "user123",
  doctorId: "doc456",
  startTime: Timestamp,
  endTime: Timestamp,
  durationUsed: 600, // seconds
  status: "completed",
  recordingUrl: "https://...",
  notes: "Patient diagnosed with...",
  chatMessages: []
}
```

## 🔄 Refund Policy

- **Automatic Refund:** If session unused, full refund
- **Partial Refund:** If session used < 15 minutes, pro-rata refund
- **No Refund:** If session completed for full 15 minutes
- **Cancellation:** Refund within 24 hours

```javascript
// Calculate refund
const refund = BillingManager.calculateRefund(paidAmount, usedSeconds);
// Returns refund amount in paise
```

## 📈 Advanced Features

### 1. Prepaid Wallet
```javascript
// Patient adds funds to wallet
WalletManager.addFunds(patientId, 5000); // ₹50

// Automatically deducted from wallet for each consultation
WalletManager.deductFunds(patientId, 500, sessionId);
```

### 2. Doctor Earnings
```javascript
// Track doctor earnings
const doctorTransactions = TransactionLogger.getTransactionsByDoctor(doctorId);
const earnings = doctorTransactions
  .filter(t => t.status === 'completed')
  .reduce((sum, t) => sum + (t.amount || 0), 0);
```

### 3. Referral Bonus
```javascript
// Implement referral system
if (referredByPatientId) {
  const bonus = 100; // ₹1 per referral
  WalletManager.addFunds(referredByPatientId, bonus, 'referral');
}
```

### 4. Consultation Discounts
```javascript
// Apply loyalty discount
const regularPrice = 500;
const discount = BillingManager.applyDiscount(regularPrice, 10); // 10% off
// Returns 450 paise (₹4.50)
```

## 🚨 Error Handling

The system handles:
- ❌ Network failures → Retry mechanism
- ❌ Payment cancellation → Show retry option
- ❌ Invalid amount → Minimum amount validation
- ❌ Signature mismatch → Payment rejected
- ❌ Session timeout → Auto-end & refund
- ❌ Doctor unavailable → Redirect to selection

## 📞 APIs Integrated

### Razorpay
- Create orders
- Process payments
- Verify signatures
- Handle webhooks
- Process refunds

### Firebase
- User authentication
- Payment records storage
- Session management
- Analytics

### WebRTC (Future)
- Peer-to-peer video communication
- Screen sharing
- Recording

## 🎓 Learn More

- [Razorpay Docs](https://razorpay.com/docs/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Express.js](https://expressjs.com/)

## ✅ Deployment Checklist

- [ ] Get Razorpay live credentials
- [ ] Update .env with live keys
- [ ] Switch to HTTPS
- [ ] Setup database backups
- [ ] Implement logging
- [ ] Add payment notifications
- [ ] Test complete flow
- [ ] Monitor transactions
- [ ] Setup error alerts

## 📝 Notes

- Test mode key: `rzp_test_*`
- Live mode key: `rzp_live_*`
- Always verify signatures on backend
- Store all transaction records
- Implement proper error handling
- Use HTTPS in production

## 🤝 Support

For issues or questions:
1. Check [QUICK_START.md](QUICK_START.md)
2. Review [RAZORPAY_INTEGRATION.md](RAZORPAY_INTEGRATION.md)
3. Check error logs in `.env` configuration
4. Contact Razorpay: support@razorpay.com

---

**Version:** 1.0.0  
**Last Updated:** March 2026  
**Maintained By:** Care Without Borders Team
