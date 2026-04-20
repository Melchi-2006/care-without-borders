/**
 * VILGAX Patient Assistant
 * 
 * Core functionality for patient health consultation:
 * 1. Voice/text input capture
 * 2. Health detail extraction (name, age, gender, location, symptoms, duration)
 * 3. Symptom-to-specialization mapping
 * 4. Firestore storage of health consultations
 * 5. AI diagnosis preliminary assessment
 * 6. Appointment booking workflow
 * 
 * Usage: Load in patient.html after patient sign-in
 * - Replaces standard VILGAX chat with health-focused assistant
 * - Extracts medical details from natural language
 * - Suggests specialist based on symptoms
 * - Saves data to Firestore immediately for doctor access
 */

import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class VilgaxPatientAssistant {
  constructor() {
    this.consultation = {
      patientId: null,
      patientName: null,
      name: null,
      location: null,
      age: null,
      gender: null,
      symptoms: [],
      duration: null,
      suggestedSpecialization: null,
      aiDiagnosis: null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.conversationState = 'INITIAL'; // INITIAL, COLLECTED_DETAILS, OPTIONS_SHOWN
    this.extractedDetails = {};

    this.init();
  }

  async init() {
    // Wait for Firebase and i18n to load
    await this.waitForDependencies();
    
    // Check if user is logged in
    if (!auth.currentUser) {
      console.log('[VILGAX Patient] User not authenticated, skipping init');
      return;
    }

    this.consultation.patientId = auth.currentUser.uid;
    this.consultation.patientName = auth.currentUser.displayName || 'Patient';

    console.log('[VILGAX Patient Assistant] Initialized for patient:', auth.currentUser.email);
  }

  async waitForDependencies() {
    return new Promise((resolve) => {
      // Check for Firebase
      if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
        resolve();
      } else {
        // Wait for Firebase to load
        const checkInterval = setInterval(() => {
          if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });
  }

  /**
   * Main entry point - capture voice/text input from patient
   * @param {string} input - User speech or text
   */
  async processPatientInput(input) {
    if (!input || input.trim().length === 0) return;

    console.log('[VILGAX Patient] Processing input:', input);

    // Extract health details from input
    this.extractedDetails = this.extractHealthDetails(input);
    
    // Update consultation object
    Object.assign(this.consultation, this.extractedDetails);

    // Get suggested specialization based on symptoms
    if (this.consultation.symptoms.length > 0) {
      this.consultation.suggestedSpecialization = 
        await this.mapSymptomsToSpecialization(this.consultation.symptoms);
    }

    // Save consultation to Firestore
    const consultationId = await this.saveConsultationToFirestore();
    this.consultation.id = consultationId;

    // Move to next state
    this.conversationState = 'COLLECTED_DETAILS';

    return this.getResponseOptions();
  }

  /**
   * Extract medical details from natural language input
   * Uses regex patterns and fuzzy matching
   * 
   * Example input: "I am MELCHI from ERODE, 32 years old male, fever for 2 days, vomiting, dysentery"
   * Expected output: {
   *   name: 'MELCHI',
   *   location: 'ERODE',
   *   age: 32,
   *   gender: 'male',
   *   symptoms: ['fever', 'vomiting', 'dysentery'],
   *   duration: '2 days'
   * }
   */
  extractHealthDetails(input) {
    const details = {};
    const textLower = input.toLowerCase();

    // 1. Extract Name - pattern: "I am [NAME] from" or "my name is [NAME]"
    const nameMatch = input.match(/(?:i am|my name is)\s+([a-z]+)/i);
    if (nameMatch) {
      details.name = nameMatch[1].trim();
    }

    // 2. Extract Location - pattern: "from [LOCATION]" or "in [LOCATION]"
    const locationMatch = input.match(/(?:from|in)\s+([a-z\s]+?)(?:,|\.|$)/i);
    if (locationMatch) {
      details.location = locationMatch[1].trim();
    }

    // 3. Extract Age - pattern: "[NUMBER] years old" or "[NUMBER] year old"
    const ageMatch = input.match(/(\d+)\s+years?\s+old/i);
    if (ageMatch) {
      details.age = parseInt(ageMatch[1]);
    }

    // 4. Extract Gender - pattern: "male", "female", "boy", "girl", etc.
    if (/\b(male|man|boy|mr\.)\b/i.test(input)) {
      details.gender = 'male';
    } else if (/\b(female|woman|girl|ms\.|mrs\.)\b/i.test(input)) {
      details.gender = 'female';
    }

    // 5. Extract Symptoms - common medical symptoms
    const commonSymptoms = [
      'fever', 'cough', 'cold', 'headache', 'body ache', 'fatigue',
      'vomiting', 'nausea', 'diarrhea', 'dysentery', 'constipation',
      'chest pain', 'back pain', 'leg pain', 'arm pain', 'joint pain',
      'itching', 'rash', 'skin issues', 'anxiety', 'depression',
      'high blood pressure', 'low blood pressure', 'diabetes', 'asthma',
      'shortness of breath', 'difficulty breathing', 'sore throat',
      'stomach pain', 'abdominal pain', 'indigestion', 'acidity'
    ];

    details.symptoms = [];
    commonSymptoms.forEach(symptom => {
      const regex = new RegExp(`\\b${symptom}\\b`, 'i');
      if (regex.test(input)) {
        details.symptoms.push(symptom.toLowerCase());
      }
    });

    // 6. Extract Duration - pattern: "for [NUMBER] [days/weeks/months]" or "since [time]"
    const durationMatch = input.match(/(?:for|since)\s+(\d+\s+(?:days?|weeks?|months?|hours?))/i);
    if (durationMatch) {
      details.duration = durationMatch[1].trim();
    }

    console.log('[VILGAX Patient] Extracted details:', details);
    return details;
  }

  /**
   * Map symptoms to appropriate medical specialization
   * Uses disease-medicine-database.js if available
   * 
   * @param {array} symptoms - List of symptoms
   * @returns {string} - Suggested specialization
   */
  async mapSymptomsToSpecialization(symptoms) {
    if (!symptoms || symptoms.length === 0) {
      return 'General Practice';
    }

    // If disease-medicine-database is loaded, use it
    if (typeof diseaseMedicineDatabase !== 'undefined') {
      const db = diseaseMedicineDatabase;
      
      for (const symptom of symptoms) {
        const disease = db.findDiseaseBySymptom(symptom);
        if (disease && disease.specialization) {
          return disease.specialization;
        }
      }
    }

    // Fallback: manual mapping if database not available
    const symptomToSpeciality = {
      // Cardiology
      'chest pain': 'Cardiology',
      'high blood pressure': 'Cardiology',
      'low blood pressure': 'Cardiology',
      'heart': 'Cardiology',

      // Gastroenterology
      'vomiting': 'Gastroenterology',
      'diarrhea': 'Gastroenterology',
      'dysentery': 'Gastroenterology',
      'stomach pain': 'Gastroenterology',
      'abdominal pain': 'Gastroenterology',
      'acidity': 'Gastroenterology',
      'indigestion': 'Gastroenterology',

      // Orthopedics
      'back pain': 'Orthopedics',
      'leg pain': 'Orthopedics',
      'arm pain': 'Orthopedics',
      'joint pain': 'Orthopedics',
      'fracture': 'Orthopedics',

      // Dermatology
      'rash': 'Dermatology',
      'skin': 'Dermatology',
      'itching': 'Dermatology',

      // ENT
      'sore throat': 'ENT',
      'cough': 'ENT',
      'cold': 'ENT',

      // Psychiatry
      'anxiety': 'Psychiatry',
      'depression': 'Psychiatry',
      'stress': 'Psychiatry',

      // Pulmonology
      'shortness of breath': 'Pulmonology',
      'difficulty breathing': 'Pulmonology',
      'asthma': 'Pulmonology'
    };

    // Check each symptom and return first match
    for (const symptom of symptoms) {
      const specialty = symptomToSpeciality[symptom.toLowerCase()];
      if (specialty) {
        console.log(`[VILGAX Patient] Symptom "${symptom}" mapped to "${specialty}"`);
        return specialty;
      }
    }

    // Default to General Practice if no match
    return 'General Practice';
  }

  /**
   * Save consultation to Firestore immediately
   * @returns {string} - Consultation ID
   */
  async saveConsultationToFirestore() {
    try {
      const consultationsRef = collection(db, 'health_consultations');
      
      const docRef = await addDoc(consultationsRef, {
        patientId: this.consultation.patientId,
        patientName: this.consultation.patientName,
        name: this.consultation.name || '',
        location: this.consultation.location || '',
        age: this.consultation.age || null,
        gender: this.consultation.gender || '',
        symptoms: this.consultation.symptoms,
        duration: this.consultation.duration || '',
        suggestedSpecialization: this.consultation.suggestedSpecialization || 'General Practice',
        status: 'pending',
        createdAt: new Date(),
        appointmentId: null
      });

      console.log('[VILGAX Patient] Consultation saved to Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[VILGAX Patient] Error saving consultation:', error);
      return null;
    }
  }

  /**
   * Generate preliminary AI diagnosis based on symptoms
   * @returns {string} - Diagnosis text
   */
  async generateAIDiagnosis() {
    const { symptoms, duration } = this.consultation;

    if (!symptoms || symptoms.length === 0) {
      return 'Please provide your symptoms for a preliminary diagnosis.';
    }

    // Simple rule-based diagnosis
    const symptomsText = symptoms.join(', ');

    let diagnosis = `Based on your symptoms (${symptomsText}), `;

    if (duration) {
      diagnosis += `lasting ${duration}, `;
    }

    // Add simple diagnosis rules
    if (symptoms.includes('fever') && symptoms.includes('vomiting') && symptoms.includes('dysentery')) {
      diagnosis += `you may have gastroenteritis or infectious diarrhea. Please consult a Gastroenterologist.`;
    } else if (symptoms.includes('chest pain')) {
      diagnosis += `chest pain requires urgent medical evaluation. Please consult a Cardiologist.`;
    } else if (symptoms.includes('cough') && symptoms.includes('cold')) {
      diagnosis += `you may have a common cold or viral infection. Please consult an ENT specialist.`;
    } else if (symptoms.includes('back pain') || symptoms.includes('joint pain')) {
      diagnosis += `you may have musculoskeletal issues. Please consult an Orthopedic specialist.`;
    } else {
      diagnosis += `it's recommended to consult a healthcare professional for proper evaluation. We'll connect you with a ${this.consultation.suggestedSpecialization || 'General Practice'} specialist.`;
    }

    return diagnosis;
  }

  /**
   * Get response options after health details collected
   * Shows: "Book Doctor", "Get AI Diagnosis", "Continue Talking"
   */
  getResponseOptions() {
    const response = {
      type: 'OPTIONS',
      message: 'Great! I\'ve noted your symptoms. What would you like to do?',
      details: this.extractedDetails,
      suggestedSpecialization: this.consultation.suggestedSpecialization,
      options: [
        {
          id: 'book_doctor',
          label: 'Book Doctor Appointment',
          icon: '👨‍⚕️',
          action: 'BOOK_APPOINTMENT'
        },
        {
          id: 'ai_diagnosis',
          label: 'Get AI Diagnosis',
          icon: '🤖',
          action: 'GET_AI_DIAGNOSIS'
        },
        {
          id: 'continue_talking',
          label: 'Continue Talking to VILGAX',
          icon: '💬',
          action: 'CONTINUE_CONVERSATION'
        }
      ]
    };

    return response;
  }

  /**
   * Handle user selection of action
   * @param {string} action - Selected action (BOOK_APPOINTMENT, GET_AI_DIAGNOSIS, CONTINUE_CONVERSATION)
   */
  async handleUserAction(action) {
    console.log('[VILGAX Patient] User selected action:', action);

    switch (action) {
      case 'BOOK_APPOINTMENT':
        return this.startAppointmentBooking();

      case 'GET_AI_DIAGNOSIS':
        const diagnosis = await this.generateAIDiagnosis();
        return {
          type: 'AI_DIAGNOSIS',
          message: diagnosis,
          suggestedSpecialization: this.consultation.suggestedSpecialization,
          nextAction: 'SHOW_APPOINTMENT_BOOKING'
        };

      case 'CONTINUE_CONVERSATION':
        return {
          type: 'CONTINUE',
          message: 'Sure! Tell me more about your symptoms or any other concerns.'
        };

      default:
        return {
          type: 'ERROR',
          message: 'Invalid action'
        };
    }
  }

  /**
   * Start appointment booking workflow
   */
  startAppointmentBooking() {
    this.conversationState = 'OPTIONS_SHOWN';

    return {
      type: 'APPOINTMENT_BOOKING_START',
      message: `I'll help you book an appointment with a ${this.consultation.suggestedSpecialization} specialist. When would you prefer your appointment?`,
      suggestedSpecialization: this.consultation.suggestedSpecialization,
      examples: [
        'Tomorrow at 2 PM',
        'Next Monday morning',
        '3:30 PM today',
        'This Friday at 10 AM'
      ],
      nextAction: 'WAIT_FOR_APPOINTMENT_TIME'
    };
  }

  /**
   * Parse appointment date/time from natural language
   * @param {string} input - User input like "tomorrow at 2pm" or "next monday morning"
   * @returns {object} - { date: ISO string, time: HH:MM }
   */
  parseAppointmentDateTime(input) {
    const now = new Date();
    let appointmentDate = new Date();
    let time = '10:00'; // Default time

    const inputLower = input.toLowerCase();

    // Parse time
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      // Check for "morning", "afternoon", "evening"
      if (/morning/.test(inputLower)) {
        time = '09:00';
      } else if (/afternoon/.test(inputLower)) {
        time = '14:00';
      } else if (/evening/.test(inputLower)) {
        time = '18:00';
      }
    }

    // Parse date
    if (/today/.test(inputLower)) {
      appointmentDate = new Date(now);
    } else if (/tomorrow/.test(inputLower)) {
      appointmentDate = new Date(now);
      appointmentDate.setDate(appointmentDate.getDate() + 1);
    } else if (/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(input)) {
      const dayMatch = input.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      const targetDay = dayMatch[1].toLowerCase();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = days.indexOf(targetDay);
      const currentDay = appointmentDate.getDay();
      let daysAhead = targetDayIndex - currentDay;
      if (daysAhead <= 0) {
        daysAhead += 7;
      }
      appointmentDate.setDate(appointmentDate.getDate() + daysAhead);
    }

    return {
      date: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD
      time: time
    };
  }

  /**
   * Confirm appointment booking and send to doctor queue
   * @param {string} appointmentDateTime - User's appointment time preference
   */
  async confirmAppointmentBooking(appointmentDateTime) {
    const parsedDateTime = this.parseAppointmentDateTime(appointmentDateTime);

    console.log('[VILGAX Patient] Booking appointment for:', parsedDateTime);

    return {
      type: 'APPOINTMENT_CONFIRMED',
      message: `Perfect! I'm connecting you with available ${this.consultation.suggestedSpecialization} specialists for ${parsedDateTime.date} at ${parsedDateTime.time}. Please wait...`,
      consultationId: this.consultation.id,
      appointmentDetails: {
        patientId: this.consultation.patientId,
        patientName: this.consultation.patientName,
        symptoms: this.consultation.symptoms,
        specialization: this.consultation.suggestedSpecialization,
        preferredDate: parsedDateTime.date,
        preferredTime: parsedDateTime.time,
        duration: this.consultation.duration,
        consultationId: this.consultation.id
      },
      nextAction: 'SEND_TO_DOCTOR_QUEUE'
    };
  }

  /**
   * Get consultation summary
   */
  getConsultationSummary() {
    return {
      id: this.consultation.id,
      patientName: this.consultation.name || this.consultation.patientName,
      age: this.consultation.age,
      gender: this.consultation.gender,
      location: this.consultation.location,
      symptoms: this.consultation.symptoms,
      duration: this.consultation.duration,
      suggestedSpecialization: this.consultation.suggestedSpecialization,
      createdAt: this.consultation.createdAt
    };
  }
}

export default VilgaxPatientAssistant;

// Auto-initialize when module is imported
let vilgaxPatientAssistant;

export async function initVilgaxPatientAssistant() {
  return new Promise((resolve) => {
    if (auth && db) {
      vilgaxPatientAssistant = new VilgaxPatientAssistant();
      window.vilgaxPatientAssistant = vilgaxPatientAssistant;
      console.log('✓ VILGAX Patient Assistant initialized');
      resolve(vilgaxPatientAssistant);
    } else {
      // Retry if Firebase not ready
      setTimeout(() => initVilgaxPatientAssistant().then(resolve), 500);
    }
  });
}
