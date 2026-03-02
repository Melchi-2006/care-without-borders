// Complete Razorpay Server Implementation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const razorpayRoutes = require('./api/razorpay');

const app = express();

// ============ MIDDLEWARE ============
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// ============ LOGGING MIDDLEWARE ============
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Razorpay routes
app.use('/api', razorpayRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/patient', (req, res) => {
  res.sendFile(path.join(__dirname, 'patient.html'));
});

app.get('/doctor', (req, res) => {
  res.sendFile(path.join(__dirname, 'doctor.html'));
});

app.get('/video-room', (req, res) => {
  res.sendFile(path.join(__dirname, 'video-room.html'));
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     Care Without Borders - Server Started      ║
║                                                ║
║  Server: http://${HOST}:${PORT}                  ║
║  Status: Ready to accept connections           ║
║                                                ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Razorpay: ${process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Not Configured'}        ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);

  // Verify Razorpay configuration
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  WARNING: Razorpay credentials not found in .env file');
    console.warn('   Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
  }
});

module.exports = app;
