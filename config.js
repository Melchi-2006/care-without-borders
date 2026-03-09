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

// Export for use in scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
