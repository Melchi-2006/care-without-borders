// ==================== USER AUTHENTICATION SERVICE ====================
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// File storage for users (in production, use a real database like MongoDB)
const USERS_FILE = path.join(__dirname, '../data/users.json');
const DATA_DIR = path.join(__dirname, '../data');

// Create data directory if not exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize users file if not exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ doctors: [], patients: [] }, null, 2));
}

/**
 * Hash password using SHA-256
 * In production, use bcrypt for better security
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Get all users
 */
function getAllUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return { doctors: [], patients: [] };
  }
}

/**
 * Save all users
 */
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users file:', error);
    return false;
  }
}

/**
 * Register a new doctor
 */
function registerDoctor(doctorData) {
  try {
    const users = getAllUsers();
    
    // Check if email already exists
    if (users.doctors.some(d => d.email === doctorData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Check if license number already exists
    if (users.doctors.some(d => d.licenseNumber === doctorData.licenseNumber)) {
      return { success: false, error: 'Medical license number already registered' };
    }
    
    // Validate required fields
    if (!doctorData.email || !doctorData.password || !doctorData.licenseNumber || !doctorData.name) {
      return { success: false, error: 'Missing required fields' };
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorData.email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Validate password length
    if (doctorData.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Create new doctor
    const newDoctor = {
      id: crypto.randomBytes(8).toString('hex'),
      email: doctorData.email,
      password: hashPassword(doctorData.password),
      licenseNumber: doctorData.licenseNumber,
      name: doctorData.name,
      specialization: doctorData.specialization || 'General Practice',
      phone: doctorData.phone || '',
      createdAt: new Date().toISOString()
    };
    
    users.doctors.push(newDoctor);
    saveUsers(users);
    
    return { 
      success: true, 
      message: 'Doctor registered successfully',
      id: newDoctor.id
    };
  } catch (error) {
    console.error('Error registering doctor:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Register a new patient
 */
function registerPatient(patientData) {
  try {
    const users = getAllUsers();
    
    // Check if email already exists
    if (users.patients.some(p => p.email === patientData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Validate required fields
    if (!patientData.email || !patientData.password || !patientData.name) {
      return { success: false, error: 'Missing required fields' };
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Validate password length
    if (patientData.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Create new patient
    const newPatient = {
      id: crypto.randomBytes(8).toString('hex'),
      email: patientData.email,
      password: hashPassword(patientData.password),
      name: patientData.name,
      phone: patientData.phone || '',
      age: patientData.age || null,
      gender: patientData.gender || '',
      createdAt: new Date().toISOString()
    };
    
    users.patients.push(newPatient);
    saveUsers(users);
    
    return { 
      success: true, 
      message: 'Patient registered successfully',
      id: newPatient.id
    };
  } catch (error) {
    console.error('Error registering patient:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Login doctor
 */
function loginDoctor(email, password, licenseNumber) {
  try {
    const users = getAllUsers();
    
    // Find doctor by email
    const doctor = users.doctors.find(d => d.email === email);
    
    if (!doctor) {
      return { success: false, error: 'Email not registered' };
    }
    
    // Verify password
    if (!verifyPassword(password, doctor.password)) {
      return { success: false, error: 'Incorrect password' };
    }
    
    // Verify license number
    if (doctor.licenseNumber !== licenseNumber) {
      return { success: false, error: 'Medical license number does not match' };
    }
    
    // Return success with doctor data (without password)
    const { password: _, ...doctorData } = doctor;
    return { 
      success: true, 
      message: 'Login successful',
      doctor: doctorData,
      token: generateToken(doctor.id, 'doctor')
    };
  } catch (error) {
    console.error('Error logging in doctor:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Login patient
 */
function loginPatient(email, password) {
  try {
    const users = getAllUsers();
    
    // Find patient by email
    const patient = users.patients.find(p => p.email === email);
    
    if (!patient) {
      return { success: false, error: 'Email not registered' };
    }
    
    // Verify password
    if (!verifyPassword(password, patient.password)) {
      return { success: false, error: 'Incorrect password' };
    }
    
    // Return success with patient data (without password)
    const { password: _, ...patientData } = patient;
    return { 
      success: true, 
      message: 'Login successful',
      patient: patientData,
      token: generateToken(patient.id, 'patient')
    };
  } catch (error) {
    console.error('Error logging in patient:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Generate session token
 */
function generateToken(userId, userType) {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
}

/**
 * Get doctor by ID
 */
function getDoctorById(id) {
  const users = getAllUsers();
  const doctor = users.doctors.find(d => d.id === id);
  if (doctor) {
    const { password: _, ...doctorData } = doctor;
    return doctorData;
  }
  return null;
}

/**
 * Get patient by ID
 */
function getPatientById(id) {
  const users = getAllUsers();
  const patient = users.patients.find(p => p.id === id);
  if (patient) {
    const { password: _, ...patientData } = patient;
    return patientData;
  }
  return null;
}

module.exports = {
  registerDoctor,
  registerPatient,
  loginDoctor,
  loginPatient,
  getDoctorById,
  getPatientById,
  hashPassword,
  verifyPassword
};
