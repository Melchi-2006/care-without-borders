/**
 * Firebase Service Module
 * Handles all Firestore database operations
 * Syncs with backend authentication
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : "",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
  client_id: process.env.FIREBASE_CLIENT_ID || "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
};

let db = null;

// Initialize Firebase Admin only if credentials are available
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.log('⚠️ Firebase disabled: Missing credentials in environment');
  }
} catch (error) {
  console.log('⚠️ Firebase initialization warning:', error.message);
}

// ==================== DOCTOR OPERATIONS ====================

/**
 * Save or update doctor in Firestore
 */
const saveDoctorToFirebase = async (doctorData) => {
  if (!db) {
    console.log('⚠️ Firebase not available, skipping Firestore write');
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const doctorRef = db.collection('doctors').doc(doctorData.id);
    
    await doctorRef.set({
      id: doctorData.id,
      email: doctorData.email,
      name: doctorData.name,
      phone: doctorData.phone,
      specialization: doctorData.specialization,
      licenseNumber: doctorData.licenseNumber,
      createdAt: new Date().toISOString(),
      status: 'active',
      rating: 0,
      consultations: 0,
      availableSlots: [],
      patients: []
    }, { merge: true });

    console.log(`✅ Doctor ${doctorData.email} saved to Firebase`);
    return { success: true, message: 'Doctor saved to Firebase' };
  } catch (error) {
    console.error('❌ Error saving doctor to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get doctor from Firestore
 */
const getDoctorFromFirebase = async (doctorId) => {
  if (!db) return null;

  try {
    const doc = await db.collection('doctors').doc(doctorId).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting doctor from Firebase:', error);
    return null;
  }
};

/**
 * Get all doctors from Firestore
 */
const getAllDoctorsFromFirebase = async () => {
  if (!db) return [];

  try {
    const snapshot = await db.collection('doctors').get();
    const doctors = [];
    snapshot.forEach(doc => {
      doctors.push(doc.data());
    });
    return doctors;
  } catch (error) {
    console.error('Error getting doctors from Firebase:', error);
    return [];
  }
};

// ==================== PATIENT OPERATIONS ====================

/**
 * Save or update patient in Firestore
 */
const savePatientToFirebase = async (patientData) => {
  if (!db) {
    console.log('⚠️ Firebase not available, skipping Firestore write');
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const patientRef = db.collection('patients').doc(patientData.id);
    
    await patientRef.set({
      id: patientData.id,
      email: patientData.email,
      name: patientData.name,
      phone: patientData.phone,
      age: patientData.age || null,
      gender: patientData.gender || null,
      createdAt: new Date().toISOString(),
      status: 'active',
      medicalHistory: [],
      prescriptions: [],
      appointments: [],
      consultations: []
    }, { merge: true });

    console.log(`✅ Patient ${patientData.email} saved to Firebase`);
    return { success: true, message: 'Patient saved to Firebase' };
  } catch (error) {
    console.error('❌ Error saving patient to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient from Firestore
 */
const getPatientFromFirebase = async (patientId) => {
  if (!db) return null;

  try {
    const doc = await db.collection('patients').doc(patientId).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting patient from Firebase:', error);
    return null;
  }
};

// ==================== PRESCRIPTION OPERATIONS ====================

/**
 * Save prescription to Firestore
 */
const savePrescriptionToFirebase = async (prescriptionData) => {
  if (!db) return { success: false, message: 'Firebase not configured' };

  try {
    const prescriptionRef = db.collection('prescriptions').doc();
    
    await prescriptionRef.set({
      id: prescriptionData.id,
      patientId: prescriptionData.patientId,
      doctorId: prescriptionData.doctorId,
      medicines: prescriptionData.medicines || [],
      instructions: prescriptionData.instructions || '',
      createdAt: new Date().toISOString(),
      validUntil: prescriptionData.validUntil || null,
      status: 'active'
    });

    return { success: true, prescriptionId: prescriptionRef.id };
  } catch (error) {
    console.error('❌ Error saving prescription to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient prescriptions from Firestore
 */
const getPatientPrescriptionsFromFirebase = async (patientId) => {
  if (!db) return [];

  try {
    const snapshot = await db.collection('prescriptions')
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const prescriptions = [];
    snapshot.forEach(doc => {
      prescriptions.push(doc.data());
    });
    return prescriptions;
  } catch (error) {
    console.error('Error getting prescriptions from Firebase:', error);
    return [];
  }
};

// ==================== APPOINTMENT OPERATIONS ====================

/**
 * Save appointment to Firestore
 */
const saveAppointmentToFirebase = async (appointmentData) => {
  if (!db) return { success: false, message: 'Firebase not configured' };

  try {
    const appointmentRef = db.collection('appointments').doc();
    
    await appointmentRef.set({
      id: appointmentData.id,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      scheduledTime: appointmentData.scheduledTime,
      duration: appointmentData.duration || 15,
      status: 'scheduled',
      notes: appointmentData.notes || '',
      createdAt: new Date().toISOString()
    });

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('❌ Error saving appointment to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get doctor appointments from Firestore
 */
const getDoctorAppointmentsFromFirebase = async (doctorId) => {
  if (!db) return [];

  try {
    const snapshot = await db.collection('appointments')
      .where('doctorId', '==', doctorId)
      .orderBy('scheduledTime', 'asc')
      .get();
    
    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push(doc.data());
    });
    return appointments;
  } catch (error) {
    console.error('Error getting appointments from Firebase:', error);
    return [];
  }
};

// ==================== PAYMENT OPERATIONS ====================

/**
 * Save payment record to Firestore
 */
const savePaymentToFirebase = async (paymentData) => {
  if (!db) return { success: false, message: 'Firebase not configured' };

  try {
    const paymentRef = db.collection('payments').doc(paymentData.paymentId);
    
    await paymentRef.set({
      paymentId: paymentData.paymentId,
      patientId: paymentData.patientId,
      doctorId: paymentData.doctorId,
      appointmentId: paymentData.appointmentId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      status: paymentData.status,
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpaySignature: paymentData.razorpaySignature || null,
      createdAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error saving payment to Firebase:', error);
    return { success: false, error: error.message };
  }
};

// ==================== MEDICAL RECORDS OPERATIONS ====================

/**
 * Save medical record to Firestore
 */
const saveMedicalRecordToFirebase = async (recordData) => {
  if (!db) return { success: false, message: 'Firebase not configured' };

  try {
    const recordRef = db.collection('medicalRecords').doc();
    
    await recordRef.set({
      patientId: recordData.patientId,
      recordType: recordData.recordType, // 'diagnosis', 'prescription', 'test', etc.
      data: recordData.data,
      doctorId: recordData.doctorId || null,
      createdAt: new Date().toISOString()
    });

    return { success: true, recordId: recordRef.id };
  } catch (error) {
    console.error('❌ Error saving medical record to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient medical records from Firestore
 */
const getPatientMedicalRecordsFromFirebase = async (patientId) => {
  if (!db) return [];

  try {
    const snapshot = await db.collection('medicalRecords')
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const records = [];
    snapshot.forEach(doc => {
      records.push(doc.data());
    });
    return records;
  } catch (error) {
    console.error('Error getting medical records from Firebase:', error);
    return [];
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Doctor operations
  saveDoctorToFirebase,
  getDoctorFromFirebase,
  getAllDoctorsFromFirebase,

  // Patient operations
  savePatientToFirebase,
  getPatientFromFirebase,

  // Prescription operations
  savePrescriptionToFirebase,
  getPatientPrescriptionsFromFirebase,

  // Appointment operations
  saveAppointmentToFirebase,
  getDoctorAppointmentsFromFirebase,

  // Payment operations
  savePaymentToFirebase,

  // Medical records operations
  saveMedicalRecordToFirebase,
  getPatientMedicalRecordsFromFirebase,

  // Check if Firebase is available
  isFirebaseAvailable: () => db !== null,
  getFirebaseInstance: () => db
};
