// ==================== API CONFIGURATION ====================
// This file configures the API base URL for all frontend requests

const CONFIG = {
  // Detect if running on Vercel or localhost
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://care-without-borders-fypi.vercel.app',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    REGISTER_PATIENT: '/api/auth/register-patient',
    REGISTER_DOCTOR: '/api/auth/register-doctor',
    LOGIN_PATIENT: '/api/auth/login-patient',
    LOGIN_DOCTOR: '/api/auth/login-doctor',
    GET_USER: '/api/auth/user',
    
    // Chatbot
    CHATBOT_CHAT: '/api/openai-chatbot/chat',
    CHATBOT_CLEAR: '/api/openai-chatbot/clear',
    CHATBOT_HISTORY: '/api/openai-chatbot/history',
    
    // Email & Prescriptions
    SEND_PRESCRIPTION: '/api/send-prescription-email',
    
    // Razorpay
    CREATE_ORDER: '/api/razorpay/create-order',
    VERIFY_PAYMENT: '/api/razorpay/verify-payment',
    
    // Health check
    HEALTH: '/api/health'
  },

  // Helper function to get full API URL
  getApiUrl: function(endpoint) {
    return this.API_BASE_URL + endpoint;
  },

  // Helper function to make API calls with proper error handling
  fetchApi: async function(endpoint, options = {}) {
    const url = this.getApiUrl(endpoint);
    
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Call Failed [${endpoint}]:`, error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== APPOINTMENT SYSTEM CONFIGURATION ====================

CONFIG.APPOINTMENT = {
  // Default timeout for appointment booking (in milliseconds)
  // Can be overridden based on patient severity
  DEFAULT_TIMEOUT_MS: 180000, // 3 minutes

  // Timeout mapping based on severity
  SEVERITY_TIMEOUTS: {
    'normal': 180000,      // 3 minutes
    'urgent': 120000,      // 2 minutes
    'emergency': 60000     // 1 minute
  },

  // Consultation fee (in INR)
  CONSULTATION_FEE: 500, // ₹500

  // Specializations
  SPECIALIZATIONS: [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'General Practice',
    'Dentistry',
    'Dermatology',
    'Psychiatry',
    'Gastroenterology',
    'ENT',
    'Pulmonology'
  ],

  // Symptoms to Specialization Mapping
  SYMPTOM_TO_SPECIALIZATION: {
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
  }
};

// ==================== VILGAX VOICE ASSISTANT CONFIGURATION ====================

CONFIG.VILGAX = {
  // Speech recognition language
  SPEECH_LANG: 'en-US',

  // Auto-greeting in selected language
  AUTO_GREETING_ENABLED: true,
  AUTO_GREETING_DELAY_MS: 1000, // 1 second

  // Command matching accuracy threshold
  MATCHING_CONFIDENCE_THRESHOLD: 0.6, // 60%

  // Voice input timeout (milliseconds)
  VOICE_INPUT_TIMEOUT_MS: 30000, // 30 seconds

  // Patient health consultation prompts
  PATIENT_HEALTH_PROMPTS: {
    INITIAL: 'Tell me about your health. Please provide your name, age, gender, location, symptoms, and how long you\'ve had them.',
    CONFIRM: 'Let me confirm the details I\'ve noted:',
    OPTIONS: 'What would you like to do?',
    APPOINTMENT_TIME: 'What date and time would you prefer for your appointment?',
    DIAGNOSIS: 'Here\'s a preliminary assessment based on your symptoms:'
  }
};

// ==================== NOTIFICATION CONFIGURATION ====================

CONFIG.NOTIFICATIONS = {
  // Doctor notification sound
  SOUND_ENABLED: true,
  SOUND_URL: '/audio/notification.mp3',

  // Notification display timeout (milliseconds)
  AUTO_DISMISS_TIMEOUT_MS: 180000, // 3 minutes

  // Desktop notification support
  DESKTOP_NOTIFICATIONS_ENABLED: true
};

// Export for use in scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
