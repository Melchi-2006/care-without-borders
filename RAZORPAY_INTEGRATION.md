# Razorpay Integration Setup Guide

## Video Consultation Pricing
- **Cost**: ₹5 (500 paise)
- **Duration**: 15 minutes
- **Currency**: INR

## Installation & Setup

### 1. Install Required Packages

```bash
npm install razorpay express dotenv cors
```

### 2. Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in to your account
3. Navigate to **Settings → API Keys**
4. Copy your **Key ID** and **Key Secret**
5. Keep these secure - add to environment variables

### 3. Environment Setup

Create a `.env` file in your project root:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
NODE_ENV=development
PORT=5000
```

### 4. Update Frontend Configuration

In `js/razorpay.js`, replace:
```javascript
export const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"; // Replace with your actual Key ID
```

### 5. Setup Backend Server

Create `server.js` in your project root:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const razorpayRoutes = require('./api/razorpay');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.use('/api', razorpayRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### 6. Implementation Flow

#### **Payment Flow:**
1. Patient initiates video consultation
2. User clicks "Start Consultation" button
3. Frontend calls `initiateVideoCallPayment()`
4. Payment gateway opens Razorpay checkout
5. User completes payment
6. Signature is verified on backend
7. Video call starts (15 minutes duration)
8. Session timer counts down
9. Call ends automatically after 15 minutes

#### **Key Functions:**

**Frontend (js/razorpay.js):**
- `initiateVideoCallPayment()` - Start payment process
- `handlePaymentSuccess()` - Handle successful payment
- `handlePaymentFailure()` - Handle failed payment
- `formatAmount()` - Format amount for display

**Backend (api/razorpay.js):**
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment signature
- `GET /api/payment-status/:paymentId` - Get payment status
- `POST /api/refund-payment` - Process refund

### 7. Integration Points

**In patient.html:**
Add button to start consultation:
```html
<button onclick="window.location.href='video-room.html?doctorId=doctor123&doctorName=Dr.%20John&specialty=Cardiologist'">
  💰 Start Video Consultation (₹5 for 15 min)
</button>
```

**In patient.js:**
```javascript
// Add to book appointment function
window.startVideoConsultation = function(doctorId, doctorName) {
  window.location.href = `video-room.html?doctorId=${doctorId}&doctorName=${encodeURIComponent(doctorName)}`;
};
```

### 8. Testing

**Test Credentials:**
- Card: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3-digit number
- OTP: Any 6-digit number

### 9. Security Best Practices

✅ **Always verify signatures on backend**
✅ **Never expose Key Secret in frontend code**
✅ **Use HTTPS in production**
✅ **Store payment records in database**
✅ **Implement proper error handling**
✅ **Add logging for transactions**

### 10. Database Storage (Firebase)

Add payment records to Firestore:

```javascript
// In api/razorpay.js after verification
const { doc, setDoc } = require('firebase/firestore');

await setDoc(doc(db, 'payments', razorpay_payment_id), {
  paymentId: razorpay_payment_id,
  orderId: razorpay_order_id,
  patientId: patientId,
  doctorId: doctorId,
  amount: amount,
  status: 'completed',
  timestamp: new Date(),
  duration: 15, // minutes
  consultationType: 'video_call'
});
```

### 11. Error Handling

The integration handles:
- ❌ Network failures
- ❌ Payment cancellation
- ❌ Invalid amounts
- ❌ Signature verification failure
- ❌ Razorpay script loading failure

### 12. File Structure

```
care-without-borders/
├── js/
│   ├── razorpay.js          (Frontend payment handler)
│   └── firebase.js
├── api/
│   └── razorpay.js          (Backend payment processor)
├── video-room.html          (Video consultation interface)
├── patient.html
├── .env                      (Environment variables)
├── server.js                 (Express server)
└── package.json
```

### 13. Troubleshooting

**Issue: "Razorpay script failed to load"**
- Check internet connection
- Verify CDN is accessible
- Check browser console for errors

**Issue: "Payment verification failed"**
- Verify Key Secret in .env is correct
- Check signature algorithm
- Ensure order ID matches

**Issue: "CORS errors"**
- Install and configure cors middleware
- Add frontend URL to Razorpay allowed origins

### 14. Additional Features to Add

- 💾 Payment history in patient dashboard
- 🔔 Payment notifications
- 💵 Wallet/prepaid balance system
- 📊 Transaction reports for doctors
- 🎫 Discount/coupon codes
- 🔄 Automatic refunds on cancellation
- 📝 Invoice generation

### 15. Support & Documentation

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Payment Gateway](https://razorpay.com/docs/payments/payments-gateway/)

## Contact & Testing

For testing and development questions, refer to Razorpay's test credentials and sandbox environment.
