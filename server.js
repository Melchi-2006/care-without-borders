// Complete Razorpay Server Implementation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const razorpayRoutes = require('./api/razorpay');
const emailService = require('./api/email-service');
const authService = require('./api/auth-service');

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

// ============ AUTHENTICATION ROUTES ============

// Register Doctor
app.post('/api/auth/register-doctor', (req, res) => {
  try {
    const { email, password, licenseNumber, name, specialization, phone } = req.body;
    
    const result = authService.registerDoctor({
      email,
      password,
      licenseNumber,
      name,
      specialization,
      phone
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Register Patient
app.post('/api/auth/register-patient', (req, res) => {
  try {
    const { email, password, name, phone, age, gender } = req.body;
    
    const result = authService.registerPatient({
      email,
      password,
      name,
      phone,
      age,
      gender
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login Doctor
app.post('/api/auth/login-doctor', (req, res) => {
  try {
    const { email, password, licenseNumber } = req.body;
    
    if (!email || !password || !licenseNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, password, and license number are required' 
      });
    }
    
    const result = authService.loginDoctor(email, password, licenseNumber);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Login Patient
app.post('/api/auth/login-patient', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }
    
    const result = authService.loginPatient(email, password);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/user/:userType/:id', (req, res) => {
  try {
    const { userType, id } = req.params;
    
    let user = null;
    if (userType === 'doctor') {
      user = authService.getDoctorById(id);
    } else if (userType === 'patient') {
      user = authService.getPatientById(id);
    }
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Error fetching user' });
  }
});

// ============ RAZORPAY ROUTES ============
app.use('/api', razorpayRoutes);

// ============ EMAIL ROUTES ============

// Send prescription email
app.post('/api/send-prescription-email', async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;
    
    // Validate request
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, htmlContent'
      });
    }
    
    // Send email
    const result = await emailService.sendPrescriptionEmail(to, subject, htmlContent);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Prescription sent successfully',
        messageId: result.messageId,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send appointment reminder
app.post('/api/send-appointment-reminder', async (req, res) => {
  try {
    const { to, appointmentData } = req.body;
    
    if (!to || !appointmentData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, appointmentData'
      });
    }
    
    const result = await emailService.sendAppointmentReminder(to, appointmentData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Reminder sent successfully',
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Reminder send error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test email configuration
app.get('/api/test-email', async (req, res) => {
  try {
    const result = await emailService.sendTestEmail();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate email
app.post('/api/validate-email', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const isValid = emailService.isValidEmail(email);
    res.json({
      success: true,
      email,
      isValid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
