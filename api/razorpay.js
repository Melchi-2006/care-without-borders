// Backend API for Razorpay Integration
// Install required packages: npm install razorpay crypto express

const Razorpay = require('razorpay');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET'
});

// Create Order for Video Consultation
router.post('/create-order', async (req, res) => {
  try {
    const { amount, patientId, doctorId, description } = req.body;

    // Validate input
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 1 Rs' });
    }

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      description: description,
      notes: {
        patientId: patientId,
        doctorId: doctorId,
        type: 'video_consultation'
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment Signature
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, patientId, doctorId } = req.body;

    // Create signature for verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET')
      .update(body)
      .digest('hex');

    // Verify signature
    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      // Save transaction details to database
      console.log('Payment verified for patient:', patientId);
      
      // TODO: Save to Firebase/Database
      // - Create payment record
      // - Create video session record
      // - Send notification to doctor

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      // Signature verification failed
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get Payment Status
router.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      description: payment.description
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Refund Payment
router.post('/refund-payment', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount || undefined, // Full refund if not specified
      notes: {
        reason: reason || 'Consultation cancelled'
      }
    });

    res.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount
    });

  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

module.exports = router;
