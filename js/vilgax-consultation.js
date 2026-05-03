/**
 * VILGAX Consultation System
 * AI-powered patient consultation with speech-to-text, detail extraction, and doctor booking
 */

class VilgaxConsultation {
  constructor() {
    this.isListening = false;
    this.consultationData = {
      patientName: '',
      age: '',
      gender: '',
      symptoms: '',
      duration: '',
      severity: 'Moderate'
    };
    this.recognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.recognition = null;
    
    if (this.recognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  setupRecognition() {
    if (!this.recognition) return;

    const currentLang = window.vilgaxVoiceSystem?.currentLanguage || 'en';
    const langMap = {
      'en': 'en-US',
      'ta': 'ta-IN',
      'hi': 'hi-IN'
    };

    this.recognition.lang = langMap[currentLang] || 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.handlePatientInput(transcript, event.results[event.results.length - 1].isFinal);
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error);
      window.vilgaxVoiceSystem.speak('Sorry, I could not understand. Please try again.');
    };

    this.recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      this.isListening = false;
      updateMicButton();
    };
  }

  startListening() {
    if (!this.recognitionSupported) {
      alert('Speech recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    this.isListening = true;
    this.recognition.start();
    return true;
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  handlePatientInput(userInput, isFinal) {
    if (!isFinal) return;

    const input = userInput.toLowerCase().trim();
    console.log('📝 Patient said:', input);

    // Add to chat
    addChatMessage(userInput, 'user');

    // Extract details from patient input
    const extracted = this.extractPatientDetails(input);
    
    // Update consultation data
    if (extracted.name) this.consultationData.patientName = extracted.name;
    if (extracted.age) this.consultationData.age = extracted.age;
    if (extracted.gender) this.consultationData.gender = extracted.gender;
    if (extracted.symptoms) this.consultationData.symptoms = extracted.symptoms;
    if (extracted.duration) this.consultationData.duration = extracted.duration;

    // Determine next action
    if (input.includes('book') || input.includes('appointment') || input.includes('doctor')) {
      this.proceedToBooking();
    } else if (input.includes('diagnosis') || input.includes('analyze')) {
      this.proceedToAIDiagnosis();
    } else if (this.hasEnoughDetails()) {
      this.askForNextStep();
    } else {
      this.askForMissingDetails();
    }
  }

  extractPatientDetails(input) {
    const extracted = {
      name: null,
      age: null,
      gender: null,
      symptoms: null,
      duration: null
    };

    // Extract name (look for "I am [Name]" or "my name is [Name]")
    // IMPORTANT: Don't extract gender words as names
    const nameMatch = input.match(/(?:i am|my name is|i'm|call me|i'm calling myself)\s+([a-z]+)/i);
    if (nameMatch) {
      const candidate = nameMatch[1].toLowerCase();
      // Exclude gender-related and common non-name words
      if (!['male', 'female', 'man', 'woman', 'boy', 'girl', 'doctor', 'patient', 'yes', 'no', 'ok', 'okay'].includes(candidate)) {
        extracted.name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      }
    }

    // Extract age (look for numbers followed by "years old" or "years")
    const ageMatch = input.match(/(\d{1,3})\s*(?:years old|years|yrs|year)/i);
    if (ageMatch) {
      extracted.age = ageMatch[1];
    }

    // Extract gender
    if (input.match(/\bmale\b/i) || input.match(/\bman\b/i)) {
      extracted.gender = 'Male';
    } else if (input.match(/\bfemale\b/i) || input.match(/\bwoman\b/i)) {
      extracted.gender = 'Female';
    }

    // Extract symptoms (disease/medicine database keywords)
    const symptomKeywords = [
      'fever', 'cold', 'cough', 'sore throat', 'headache', 'pain', 'nausea', 'vomiting', 'vomit',
      'diarrhea', 'dysintry', 'dizziness', 'fatigue', 'weakness', 'rash', 'itching', 'allergy',
      'asthma', 'breathing', 'shortness', 'chest pain', 'heart', 'blood pressure', 'diabetes',
      'infection', 'flu', 'pneumonia', 'bronchitis', 'stomach', 'acidity', 'constipation'
    ];

    const foundSymptoms = symptomKeywords.filter(keyword => input.includes(keyword));
    if (foundSymptoms.length > 0) {
      extracted.symptoms = foundSymptoms.join(', ');
    }

    // Extract duration (look for "for [X] days/weeks/hours")
    const durationMatch = input.match(/for\s+(?:the\s+)?(?:past\s+)?(\d+)\s+(days?|weeks?|hours?|months?)/i);
    if (durationMatch) {
      extracted.duration = `${durationMatch[1]} ${durationMatch[2]}`;
    }

    console.log('📊 Extracted details:', extracted);
    return extracted;
  }

  hasEnoughDetails() {
    return this.consultationData.symptoms && (this.consultationData.age || this.consultationData.gender);
  }

  askForMissingDetails() {
    let message = '📋 I need more information. ';
    
    if (!this.consultationData.patientName) {
      message += 'What is your name? ';
    }
    if (!this.consultationData.age) {
      message += 'How old are you? ';
    }
    if (!this.consultationData.gender) {
      message += 'What is your gender? ';
    }
    if (!this.consultationData.symptoms) {
      message += 'Please describe your symptoms in detail. ';
    }
    if (!this.consultationData.duration) {
      message += 'For how long have you been experiencing this? ';
    }

    addChatMessage(message, 'vilgax');
    window.vilgaxVoiceSystem.speak(message);
  }

  askForNextStep() {
    const message = `Great! I have collected your information. Would you like me to:\n1. Provide AI diagnosis based on your symptoms\n2. Book an appointment with a specialist doctor\n\nJust say "diagnosis" or "book appointment"`;
    addChatMessage(message, 'vilgax');
    window.vilgaxVoiceSystem.speak('Would you like AI diagnosis or to book an appointment with a doctor?');
  }

  proceedToAIDiagnosis() {
    const message = '🔬 Analyzing your symptoms with VILGAX AI...';
    addChatMessage(message, 'vilgax');

    // Simple diagnosis based on symptoms
    setTimeout(() => {
      const diagnosis = this.generateDiagnosis();
      addChatMessage(diagnosis, 'vilgax');
      window.vilgaxVoiceSystem.speak('Based on your symptoms, here is my analysis. Would you still like to book a doctor appointment?');
      
      // Store consultation for potential booking
      saveConsultationToLocalStorage(this.consultationData);
    }, 1500);
  }

  generateDiagnosis() {
    const symptoms = this.consultationData.symptoms.toLowerCase();
    
    let diagnosis = '🏥 AI Diagnosis Analysis:\n\n';
    
    if (symptoms.includes('fever') && symptoms.includes('vomit')) {
      diagnosis += '⚠️ Possible Conditions:\n';
      diagnosis += '1. Viral Infection (Common)\n';
      diagnosis += '2. Food Poisoning\n';
      diagnosis += '3. Gastroenteritis\n\n';
      diagnosis += '💊 Recommended:\n';
      diagnosis += '• Stay hydrated\n';
      diagnosis += '• Rest for 2-3 days\n';
      diagnosis += '• Consult doctor if fever persists >103°F\n\n';
    } else if (symptoms.includes('cough') || symptoms.includes('cold')) {
      diagnosis += '⚠️ Possible Conditions:\n';
      diagnosis += '1. Common Cold\n';
      diagnosis += '2. Bronchitis\n';
      diagnosis += '3. Allergic Cough\n\n';
      diagnosis += '💊 Recommended:\n';
      diagnosis += '• Use cough syrup\n';
      diagnosis += '• Drink warm liquids\n';
      diagnosis += '• Consult if cough persists >1 week\n\n';
    } else {
      diagnosis += '⚠️ Your symptoms suggest:\n';
      diagnosis += 'Possible condition based on: ' + this.consultationData.symptoms + '\n\n';
      diagnosis += '⚠️ Disclaimer: This is AI analysis only.\n';
      diagnosis += 'Please consult a qualified doctor for proper diagnosis.\n\n';
    }

    diagnosis += '💬 Would you like to book an appointment with a specialist?';
    return diagnosis;
  }

  proceedToBooking() {
    addChatMessage('📅 Let me find the best doctor for you...', 'vilgax');
    
    // Determine specialty based on symptoms
    const specialty = this.determineSpecialty();
    console.log('🏥 Recommended Specialty:', specialty);

    // Get available doctors
    const availableDoctors = getAvailableDoctorsForSpecialty(specialty);
    
    if (availableDoctors.length === 0) {
      addChatMessage('❌ No doctors available for your condition right now. Please try again later or visit our clinic.', 'vilgax');
      window.vilgaxVoiceSystem.speak('No doctors available right now. Please try again later.');
      return;
    }

    // Ask for preferred time
    const message = `Perfect! I found ${availableDoctors.length} doctors available for ${specialty}.\n\nWhat time would you prefer for your appointment? (e.g., "10 AM", "2 PM", "tomorrow morning")`;
    addChatMessage(message, 'vilgax');
    window.vilgaxVoiceSystem.speak(`I found doctors available for ${specialty}. What time would you prefer?`);

    // Store for next interaction
    window.pendingConsultation = {
      data: this.consultationData,
      specialty: specialty,
      doctors: availableDoctors
    };
  }

  determineSpecialty() {
    const symptoms = this.consultationData.symptoms.toLowerCase();

    // Specialty mapping based on symptoms
    const specialtyMap = {
      'General': ['fever', 'cold', 'cough', 'headache', 'fatigue', 'weakness'],
      'Gastroenterology': ['vomit', 'vomiting', 'diarrhea', 'dysintry', 'stomach', 'acidity', 'constipation'],
      'Cardiology': ['chest pain', 'heart', 'blood pressure', 'breathing'],
      'Pulmonology': ['cough', 'asthma', 'breathing', 'shortness', 'pneumonia', 'bronchitis'],
      'Dermatology': ['rash', 'itching', 'allergy', 'skin'],
      'Neurology': ['headache', 'dizziness', 'migraine']
    };

    for (const [specialty, keywords] of Object.entries(specialtyMap)) {
      if (keywords.some(keyword => symptoms.includes(keyword))) {
        return specialty;
      }
    }

    return 'General';
  }

  reset() {
    this.consultationData = {
      patientName: '',
      age: '',
      gender: '',
      symptoms: '',
      duration: '',
      severity: 'Moderate'
    };
  }
}

// Global instance
window.vilgaxConsultation = new VilgaxConsultation();

// ==================== CHAT HELPER FUNCTIONS ====================

function addChatMessage(message, sender = 'vilgax') {
  const chatBox = document.getElementById('consultationChatBox') || document.getElementById('chatBox');
  if (!chatBox) return;

  const msgEl = document.createElement('div');
  msgEl.style.cssText = sender === 'user' 
    ? 'background: var(--primary-cyan); color: var(--dark-bg); padding: 12px; border-radius: 8px; text-align: right; max-width: 80%; margin-left: auto; word-wrap: break-word; margin-bottom: 8px; white-space: pre-wrap;'
    : 'background: rgba(20,184,166,0.2); color: var(--text-light); padding: 12px; border-radius: 8px; text-align: left; max-width: 80%; border-left: 3px solid var(--primary-cyan); word-wrap: break-word; margin-bottom: 8px; white-space: pre-wrap;';
  
  msgEl.textContent = message;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateMicButton() {
  const micBtn = document.getElementById('micButton');
  if (micBtn) {
    if (window.vilgaxConsultation.isListening) {
      micBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      micBtn.textContent = '🛑 Stop Listening...';
    } else {
      micBtn.style.background = 'linear-gradient(135deg, #14b8a6, #06b6d4)';
      micBtn.textContent = '🎤 Speak to VILGAX';
    }
  }
}

function toggleMic() {
  if (window.vilgaxConsultation.isListening) {
    window.vilgaxConsultation.stopListening();
  } else {
    window.vilgaxConsultation.startListening();
  }
  updateMicButton();
}

function saveConsultationToLocalStorage(data) {
  localStorage.setItem('currentConsultation', JSON.stringify(data));
}

function getAvailableDoctorsForSpecialty(specialty) {
  // Mock doctors - in production, this would query a real database
  const mockDoctors = {
    'General': [
      { id: 1, name: 'Dr. Rajesh Kumar', rating: 4.9, experience: '12 years' },
      { id: 2, name: 'Dr. Priya Singh', rating: 4.8, experience: '8 years' }
    ],
    'Gastroenterology': [
      { id: 3, name: 'Dr. Neha Sharma', rating: 4.7, experience: '10 years' },
      { id: 4, name: 'Dr. Vikram Singh', rating: 4.6, experience: '9 years' }
    ],
    'Cardiology': [
      { id: 5, name: 'Dr. Amit Patel', rating: 4.9, experience: '15 years' }
    ],
    'Pulmonology': [
      { id: 6, name: 'Dr. Sarah Johnson', rating: 4.8, experience: '11 years' }
    ],
    'Dermatology': [
      { id: 7, name: 'Dr. Ananya Desai', rating: 4.7, experience: '9 years' }
    ],
    'Neurology': [
      { id: 8, name: 'Dr. Rohit Verma', rating: 4.8, experience: '13 years' }
    ]
  };

  return mockDoctors[specialty] || mockDoctors['General'];
}

// ==================== CONSULTATION REQUEST MANAGEMENT ====================

function createConsultationRequest(patientData, specialty, preferredTime) {
  const request = {
    id: 'CONSULT-' + Date.now(),
    patientName: patientData.patientName,
    patientId: patientData.patientId || 'PATIENT-' + Date.now(),
    patientEmail: patientData.patientEmail || 'patient@example.com',
    age: patientData.age,
    gender: patientData.gender,
    symptoms: patientData.symptoms,
    duration: patientData.duration,
    specialty: specialty,
    preferredTime: preferredTime,
    status: 'pending', // pending, accepted, completed, cancelled
    acceptedBy: null,
    acceptedAt: null,
    createdAt: new Date().toISOString(),
    videoCallLink: null,
    waitingState: 'none',
    doctorName: null,
    doctorId: null
  };

  // Save to Firebase
  saveConsultationRequest(request);
  
  // Notify doctors (in production, use WebSocket/Push notifications)
  notifyDoctors(request);

  return request;
}

async function saveConsultationRequest(request) {
  try {
    // Try Firebase first
    if (window.firebaseConsultationService) {
      await window.firebaseConsultationService.saveConsultationRequest(request);
      console.log('💾 Consultation saved to Firebase:', request.id);
    } else {
      // Fallback to localStorage
      const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      requests.push(request);
      localStorage.setItem('consultationRequests', JSON.stringify(requests));
      console.log('💾 Consultation saved to localStorage (Firebase unavailable):', request.id);
    }
  } catch (error) {
    console.error('❌ Error saving consultation:', error);
    // Fallback to localStorage
    const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    requests.push(request);
    localStorage.setItem('consultationRequests', JSON.stringify(requests));
  }
}

function notifyDoctors(request) {
  // In production, this would send real-time notifications to doctors
  console.log('📢 Doctors notified for specialty:', request.specialty);
  console.log('📋 Patient symptoms:', request.symptoms);
}

async function acceptConsultationRequest(requestId, doctorId, doctorName = 'Dr. Unnamed') {
  try {
    const updates = {
      status: 'accepted',
      acceptedBy: doctorId,
      acceptedAt: new Date().toISOString(),
      videoCallLink: generateVideoCallLink(doctorId, requestId),
      doctorName: doctorName,
      doctorId: doctorId,
      waitingState: 'none'
    };

    // Try Firebase first
    if (window.firebaseConsultationService) {
      await window.firebaseConsultationService.updateConsultation(requestId, updates);
      console.log('✅ Request accepted by doctor (Firebase):', doctorId);
    } else {
      // Fallback to localStorage
      const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      const request = requests.find(r => r.id === requestId);
      if (request) {
        Object.assign(request, updates);
        localStorage.setItem('consultationRequests', JSON.stringify(requests));
        console.log('✅ Request accepted by doctor (localStorage):', doctorId);
      }
    }

    return updates;
  } catch (error) {
    console.error('❌ Error accepting consultation:', error);
    // Fallback to localStorage
    const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'accepted';
      request.acceptedBy = doctorId;
      request.videoCallLink = generateVideoCallLink(doctorId, requestId);
      request.doctorName = doctorName;
      request.doctorId = doctorId;
      localStorage.setItem('consultationRequests', JSON.stringify(requests));
    }
  }
}

function generateVideoCallLink(doctorId = '', requestId = '') {
  // Generate Jitsi-compatible room ID
  return `jitsi_${doctorId}_${requestId}`;
}

function completeConsultationRequest(requestId) {
  const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
  const request = requests.find(r => r.id === requestId);

  if (request) {
    request.status = 'completed';
    localStorage.setItem('consultationRequests', JSON.stringify(requests));
    console.log('✅ Consultation completed');
    return request;
  }
}
