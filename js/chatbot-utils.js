// AI Chatbot Utilities - Conversation Logic & Natural Language Processing

import { DISEASE_MEDICINE_DATABASE, SYMPTOMS_TO_DISEASES } from './disease-medicine-database.js';

export class ChatbotEngine {
  constructor() {
    this.conversationHistory = [];
    this.userProfile = {
      name: null,
      age: null,
      gender: null,
      medicalHistory: [],
      currentSymptoms: []
    };
    this.sessionActive = true;
  }

  // Greeting responses
  static GREETINGS = {
    casual: [
      "Hi there! 👋 How are you feeling today?",
      "Hello! Welcome to Care Without Borders. What brings you here today?",
      "Hey! How can I help you with your health today?",
      "Hi! I'm your AI health assistant. What's troubling you?",
      "Hello friend! Tell me what's going on with your health."
    ],
    responding: [
      "I'm here to help! 😊",
      "Glad to be chatting with you!",
      "Thanks for asking! Let's focus on your health.",
      "I'm doing great! How about you?",
      "Thanks! I'm here to assist you."
    ]
  };

  // Farewell responses
  static FAREWELLS = [
    "Take care! 👋 Remember to follow the advice and consult a doctor if needed.",
    "Goodbye! Stay healthy and feel better soon! 💪",
    "Thank you for chatting! Take care of yourself.",
    "Bye! Don't hesitate to come back if you need more help.",
    "Wishing you good health! See you soon! 🏥"
  ];

  // Empathy responses
  static EMPATHY = [
    "I'm sorry to hear that. Let me help you with this.",
    "That sounds tough. But don't worry, we'll figure this out.",
    "I understand how that must feel. Let's find a solution.",
    "That's concerning. Let me provide some guidance.",
    "I feel for you. Let's see what we can do to help."
  ];

  // Check if message is greeting
  isGreeting(message) {
    const greetingWords = ['hi', 'hello', 'hey', 'greetings', 'howdy', 'good morning', 'good afternoon', 'good evening'];
    return greetingWords.some(word => message.toLowerCase().includes(word));
  }

  // Check if message is farewell
  isFarewell(message) {
    const farewellWords = ['bye', 'goodbye', 'see you', 'farewell', 'thanks', 'thank you', 'that\'s all', 'that is all'];
    return farewellWords.some(word => message.toLowerCase().includes(word));
  }

  // Check if asking about medication
  isAskingAboutMedicine(message) {
    const medicineWords = ['medicine', 'medication', 'drug', 'pill', 'tablet', 'treatment', 'cure', 'remedy', 'dose', 'dosage'];
    return medicineWords.some(word => message.toLowerCase().includes(word));
  }

  // Check if describing symptoms
  isDescribingSymptoms(message) {
    const symptomIndicators = ['pain', 'ache', 'sore', 'fever', 'cough', 'hurt', 'symptom', 'feel', 'sick', 'ill', 'trouble', 'problem', 'issue'];
    return symptomIndicators.some(word => message.toLowerCase().includes(word));
  }

  // Check if asking for diagnosis
  isAskingForDiagnosis(message) {
    const diagnosisWords = ['diagnose', 'diagnosis', 'what disease', 'what do i have', 'what\'s wrong', 'what is wrong'];
    return diagnosisWords.some(word => message.toLowerCase().includes(word));
  }

  // Extract symptoms from message
  extractSymptoms(message) {
    const lowerMessage = message.toLowerCase();
    const foundSymptoms = [];

    Object.keys(SYMPTOMS_TO_DISEASES).forEach(symptom => {
      if (lowerMessage.includes(symptom)) {
        foundSymptoms.push(symptom);
        this.userProfile.currentSymptoms.push(symptom);
      }
    });

    return foundSymptoms;
  }

  // Get diseases for symptoms
  getDiseasesForSymptoms(symptoms) {
    const diseaseSet = new Set();
    
    symptoms.forEach(symptom => {
      if (SYMPTOMS_TO_DISEASES[symptom]) {
        SYMPTOMS_TO_DISEASES[symptom].forEach(disease => diseaseSet.add(disease));
      }
    });

    return Array.from(diseaseSet);
  }

  // Extract name from message
  extractName(message) {
    const patterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
      /it's (\w+)/i,
    ];

    for (let pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Generate initial response
  generateInitialResponse(userMessage) {
    if (this.isGreeting(userMessage)) {
      return this.getRandomResponse(ChatbotEngine.GREETINGS.casual);
    }

    if (this.isFarewell(userMessage)) {
      return this.getRandomResponse(ChatbotEngine.FAREWELLS);
    }

    if (this.isDescribingSymptoms(userMessage)) {
      const symptoms = this.extractSymptoms(userMessage);
      if (symptoms.length > 0) {
        return `I see you're experiencing ${symptoms.join(', ')}. ${this.generateSymptomResponse(symptoms)}`;
      }
      return "I understand you're not feeling well. Can you describe your symptoms in more detail? For example, any pain, fever, cough, or other issues?";
    }

    if (this.isAskingAboutMedicine(userMessage)) {
      return "I can help with medicine information! What disease or symptom would you like to know about?";
    }

    if (this.isAskingForDiagnosis(userMessage)) {
      if (this.userProfile.currentSymptoms.length === 0) {
        return "To help diagnose, I need to know your symptoms. What are you experiencing?";
      }
      const possibleDiseases = this.getDiseasesForSymptoms(this.userProfile.currentSymptoms);
      return this.generateDiagnosisResponse(possibleDiseases);
    }

    const nameInMessage = this.extractName(userMessage);
    if (nameInMessage && !this.userProfile.name) {
      this.userProfile.name = nameInMessage;
      return `Nice to meet you, ${nameInMessage}! 😊 What health concerns do you have today?`;
    }

    return this.generateGenericResponse(userMessage);
  }

  // Generate symptom response
  generateSymptomResponse(symptoms) {
    const possibleDiseases = this.getDiseasesForSymptoms(symptoms);
    
    if (possibleDiseases.length === 0) {
      return "Let me ask you more details about your condition to better understand what might be happening.";
    }

    if (possibleDiseases.length === 1) {
      const disease = possibleDiseases[0];
      const diseaseInfo = DISEASE_MEDICINE_DATABASE[disease];
      return `This might indicate ${disease}. ${diseaseInfo.severity} case. Common medicines include: ${diseaseInfo.medicines.slice(0, 2).map(m => m.name).join(', ')}. Would you like more details?`;
    }

    return `These symptoms could indicate several conditions. I'm narrowing it down. Can you tell me if you also have: fever, difficulty breathing, or any other symptoms?`;
  }

  // Generate diagnosis response
  generateDiagnosisResponse(possibleDiseases) {
    if (possibleDiseases.length === 0) {
      return "I need more information about your symptoms. Can you describe in detail what you're feeling?";
    }

    const topDiseases = possibleDiseases.slice(0, 3);
    let response = "Based on your symptoms, this could be:\n\n";

    topDiseases.forEach((disease, index) => {
      const info = DISEASE_MEDICINE_DATABASE[disease];
      response += `${index + 1}. **${disease}** (${info.severity})\n`;
    });

    response += "\n⚠️ **Please note:** This is not a medical diagnosis. You should consult a healthcare professional for accurate diagnosis and treatment.";
    
    return response;
  }

  // Generate generic response
  generateGenericResponse(message) {
    const questions = [
      "Are you asking for medical advice?",
      "Can you provide more specific health information?",
      "Tell me about your symptoms so I can help better.",
      "What health concern would you like to discuss?",
      "Could you describe your current health condition?"
    ];

    return this.getRandomResponse(questions);
  }

  // Get medicine information
  getMedicineInfo(diseaseName) {
    const disease = DISEASE_MEDICINE_DATABASE[diseaseName.toLowerCase()];
    
    if (!disease) {
      return `Sorry, I don't have information about "${diseaseName}". Let me search similar conditions...`;
    }

    let info = `**${diseaseName.toUpperCase()}**\n\n`;
    info += `📋 Category: ${disease.category}\n`;
    info += `⚠️ Severity: ${disease.severity}\n`;
    info += `🩺 Symptoms: ${disease.symptoms}\n\n`;
    info += `💊 **Recommended Medicines:**\n`;

    disease.medicines.forEach((med, index) => {
      info += `\n${index + 1}. **${med.name}**\n`;
      info += `   - Dosage: ${med.dosage}\n`;
      info += `   - Frequency: ${med.frequency}\n`;
    });

    info += `\n⏱️ Expected Duration: ${disease.duration}`;

    if (disease.consultDoctor) {
      info += `\n\n⚠️ **IMPORTANT:** Please consult a healthcare professional for this condition.`;
    }

    return info;
  }

  // Search medicine in database
  searchMedicine(medicineName) {
    let results = [];

    Object.entries(DISEASE_MEDICINE_DATABASE).forEach(([disease, info]) => {
      info.medicines.forEach(med => {
        if (med.name.toLowerCase().includes(medicineName.toLowerCase())) {
          results.push({
            medicine: med.name,
            disease: disease,
            dosage: med.dosage,
            frequency: med.frequency
          });
        }
      });
    });

    if (results.length === 0) {
      return `No results found for "${medicineName}". Try searching for a specific disease or symptom.`;
    }

    let response = `Found **${results.length}** uses for "${medicineName}":\n\n`;
    results.slice(0, 5).forEach((result, index) => {
      response += `${index + 1}. **${result.medicine}** - Used for ${result.disease}\n`;
      response += `   Dosage: ${result.dosage}, Frequency: ${result.frequency}\n\n`;
    });

    return response;
  }

  // Drug interaction checker
  checkDrugInteraction(drug1, drug2) {
    // Simple rule-based system for common interactions
    const interactions = {
      "aspirin_ibuprofen": "⚠️ Both are NSAIDs - avoid taking together",
      "warfarin_aspirin": "⚠️ Increases bleeding risk",
      "metformin_alcohol": "⚠️ May cause lactic acidosis",
      "lisinopril_potassium": "⚠️ High potassium levels risk",
    };

    const key1 = `${drug1.toLowerCase()}_${drug2.toLowerCase()}`;
    const key2 = `${drug2.toLowerCase()}_${drug1.toLowerCase()}`;

    return interactions[key1] || interactions[key2] || "✅ No known major interactions";
  }

  // Emergency check
  checkIfEmergency(message) {
    const emergencyWords = ['emergency', 'critical', 'dying', 'severe', 'chest pain', 'can\'t breathe', 'can\'t breath', 'call ambulance', 'call 911', 'call emergency'];
    return emergencyWords.some(word => message.toLowerCase().includes(word));
  }

  // Get random response
  static getRandomResponse(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Get random response (instance method)
  getRandomResponse(arr) {
    return ChatbotEngine.getRandomResponse(arr);
  }

  // Build full response with context
  buildResponse(userMessage) {
    const response = {
      message: '',
      type: 'normal', // normal, emergency, info, warning
      suggestions: []
    };

    // Check for emergency
    if (this.checkIfEmergency(userMessage)) {
      response.type = 'emergency';
      response.message = "🚨 **EMERGENCY DETECTED**\n\n";
      response.message += "If this is a life-threatening emergency:\n";
      response.message += "- Call your local emergency number (911 in US, 112 in India)\n";
      response.message += "- Seek immediate medical help\n";
      response.message += "- Do not delay!";
      return response;
    }

    // Generate main response
    response.message = this.generateInitialResponse(userMessage);

    // Add follow-up suggestions based on context
    if (this.isDescribingSymptoms(userMessage)) {
      response.suggestions = [
        "Tell me about the severity",
        "When did it start?",
        "Any other symptoms?"
      ];
    } else if (this.isAskingAboutMedicine(userMessage)) {
      response.suggestions = [
        "Search for medicine",
        "Check drug interactions",
        "List all conditions"
      ];
    }

    return response;
  }

  // Start a new session
  startSession() {
    this.conversationHistory = [];
    this.userProfile = {
      name: null,
      age: null,
      gender: null,
      medicalHistory: [],
      currentSymptoms: []
    };
    this.sessionActive = true;
    return "Hi! 👋 Welcome to Care Without Borders AI Assistant. What can I help you with today?";
  }

  // End session
  endSession() {
    this.sessionActive = false;
    return this.getRandomResponse(ChatbotEngine.FAREWELLS);
  }

  // Add message to history
  addToHistory(role, content) {
    this.conversationHistory.push({
      role: role, // 'user' or 'assistant'
      content: content,
      timestamp: new Date()
    });
  }

  // Get conversation history
  getHistory(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }

  // Clear conversation (privacy)
  clearHistory() {
    this.conversationHistory = [];
    return "Conversation cleared for privacy. Starting fresh!";
  }
}

// Export functions
export function initializeChatbot() {
  return new ChatbotEngine();
}

export function processUserMessage(chatbot, message) {
  chatbot.addToHistory('user', message);
  const response = chatbot.buildResponse(message);
  chatbot.addToHistory('assistant', response.message);
  return response;
}
