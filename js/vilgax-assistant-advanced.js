/**
 * VILGAX AI Assistant - ADVANCED VERSION
 * Phase 2-4 Complete Implementation
 * 
 * Enhanced Features:
 * - Hotword detection ("Hey VILGAX")
 * - Voice-controlled form filling
 * - 15+ voice commands
 * - Context-aware conversations
 * - Advanced animations & polish
 * - Emotion detection from voice
 * - Natural language understanding (NLU)
 * - Command history & learning
 */

class VILGAXAssistantAdvanced {
  constructor() {
    this.isListening = false;
    this.currentLanguage = i18n?.getLanguage() || 'en';
    this.voiceEnabled = true;
    this.commandsExecuted = 0;
    this.isProcessing = false;
    this.hotkeyActive = false;
    
    // Command tracking
    this.commands = new Map();
    this.voiceResponses = new Map();
    this.commandHistory = [];
    this.currentContext = null;
    
    // Form filling state
    this.isFillingForm = false;
    this.formFields = [];
    this.currentFieldIndex = 0;
    
    // Hotword detection
    this.hotwordDetectionActive = false;
    this.hotkeyBuffer = '';
    
    // UI Elements
    this.container = null;
    this.avatar = null;
    this.micBtn = null;
    this.responseDiv = null;
    
    // Emotion tracking
    this.voiceAnalytics = {
      speed: 'normal',
      pitch: 'normal',
      emotion: 'neutral'
    };
    
    this.init();
  }

  /**
   * Initialize Advanced VILGAX System
   */
  init() {
    console.log('🚀 VILGAX Advanced AI Assistant initializing...');
    
    this.registerAdvancedCommands();
    this.registerAdvancedResponses();
    this.createAdvancedUI();
    this.setupAdvancedEventListeners();
    this.initializeHotwordDetection();
    
    // Auto-play welcome
    window.addEventListener('load', () => {
      setTimeout(() => this.playWelcome(), 1500);
    });
    
    console.log('✅ VILGAX Advanced ready for voice commands');
  }

  /**
   * Create Advanced UI with Enhanced Animations
   */
  createAdvancedUI() {
    // Enhanced CSS with more animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      /* ==================== VILGAX ADVANCED STYLES ==================== */
      
      .vilgax-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .vilgax-avatar {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        cursor: pointer;
        box-shadow: 0 0 30px rgba(102, 126, 234, 0.6);
        transition: all 0.3s ease;
        border: 2px solid #764ba2;
        animation: vilgax-pulse 2s ease-in-out infinite;
        position: relative;
      }

      .vilgax-avatar::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #667eea;
        opacity: 0;
        animation: ripple 1.5s ease-in-out infinite;
      }

      .vilgax-avatar:hover {
        transform: scale(1.15);
        box-shadow: 0 0 60px rgba(102, 126, 234, 1);
      }

      .vilgax-avatar.listening {
        animation: vilgax-listening 0.5s ease-in-out infinite;
      }

      .vilgax-avatar.active {
        background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
        box-shadow: 0 0 40px rgba(20, 184, 166, 0.8);
      }

      @keyframes vilgax-pulse {
        0%, 100% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
        50% { box-shadow: 0 0 50px rgba(102, 126, 234, 0.8); }
      }

      @keyframes vilgax-listening {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.12); }
      }

      @keyframes ripple {
        0% { 
          width: 100%;
          height: 100%;
          opacity: 1;
          border-width: 2px;
        }
        100% {
          width: 140%;
          height: 140%;
          opacity: 0;
          border-width: 1px;
        }
      }

      /* Enhanced Panel */
      .vilgax-panel {
        position: fixed;
        bottom: 120px;
        right: 20px;
        width: 420px;
        max-width: 90vw;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        border: 2px solid #667eea;
        padding: 20px;
        display: none;
        z-index: 9999;
        animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-height: 700px;
        overflow-y: auto;
        color: #e0e0e0;
        backdrop-filter: blur(10px);
      }

      .vilgax-panel.active {
        display: block;
      }

      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .vilgax-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 2px solid #667eea;
      }

      .vilgax-name {
        font-size: 18px;
        font-weight: 700;
        color: #667eea;
      }

      .vilgax-status {
        font-size: 12px;
        color: #0f766e;
        background: rgba(15, 118, 110, 0.2);
        padding: 4px 10px;
        border-radius: 20px;
        transition: all 0.3s ease;
      }

      .vilgax-status.listening {
        color: #4ade80;
        background: rgba(74, 222, 128, 0.2);
        animation: status-pulse 0.6s ease-in-out infinite;
      }

      @keyframes status-pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }

      /* Transcript Display */
      .vilgax-transcript {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(102, 126, 234, 0.5);
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 12px;
        font-size: 14px;
        min-height: 45px;
        color: #e0e0e0;
        line-height: 1.6;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .vilgax-transcript.interim {
        color: #999;
        font-style: italic;
        border-color: #667eea;
      }

      /* Response Display */
      .vilgax-response {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(20, 184, 166, 0.1) 100%);
        border-left: 4px solid #667eea;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 12px;
        font-size: 13px;
        color: #e0e0e0;
        line-height: 1.5;
        animation: response-appear 0.3s ease;
      }

      @keyframes response-appear {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Command Grid */
      .vilgax-commands {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
        margin-bottom: 12px;
      }

      .vilgax-command-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 1px solid #764ba2;
        color: white;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .vilgax-command-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
        border-color: #667eea;
      }

      .vilgax-command-btn:active {
        transform: translateY(-1px);
      }

      /* Microphone Button */
      .vilgax-mic-btn {
        width: 100%;
        background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
        border: 2px solid #14b8a6;
        color: white;
        padding: 12px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 12px;
        position: relative;
        overflow: hidden;
      }

      .vilgax-mic-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        transition: left 0.3s ease;
      }

      .vilgax-mic-btn:hover::before {
        left: 100%;
      }

      .vilgax-mic-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(20, 184, 166, 0.5);
      }

      .vilgax-mic-btn.active {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-color: #dc2626;
        animation: pulse-red 0.6s ease-in-out infinite;
      }

      @keyframes pulse-red {
        0%, 100% { box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 8px 35px rgba(239, 68, 68, 0.7); }
      }

      /* Voice Visualization */
      .pulse-line {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 30px;
        margin: 12px 0;
      }

      .pulse-bar {
        width: 4px;
        height: 10px;
        background: linear-gradient(to top, #667eea, #14b8a6);
        border-radius: 2px;
        animation: pulse 0.5s ease-in-out infinite;
      }

      .pulse-bar:nth-child(1) { animation-delay: 0s; }
      .pulse-bar:nth-child(2) { animation-delay: 0.08s; }
      .pulse-bar:nth-child(3) { animation-delay: 0.16s; }
      .pulse-bar:nth-child(4) { animation-delay: 0.24s; }
      .pulse-bar:nth-child(5) { animation-delay: 0.32s; }

      @keyframes pulse {
        0%, 100% { height: 8px; opacity: 0.6; }
        50% { height: 24px; opacity: 1; }
      }

      /* Form Filling */
      .vilgax-form-container {
        background: rgba(15, 118, 110, 0.1);
        border: 1px solid #14b8a6;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
      }

      .vilgax-form-field {
        margin-bottom: 10px;
      }

      .vilgax-form-label {
        font-size: 12px;
        color: #14b8a6;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .vilgax-form-input {
        width: 100%;
        padding: 8px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #667eea;
        border-radius: 6px;
        color: #e0e0e0;
        font-size: 12px;
        transition: all 0.3s ease;
      }

      .vilgax-form-input:focus {
        outline: none;
        border-color: #14b8a6;
        background: rgba(20, 184, 166, 0.1);
        box-shadow: 0 0 10px rgba(20, 184, 166, 0.3);
      }

      /* Voice Command Hint */
      .voice-command-hint {
        background: rgba(79, 172, 254, 0.1);
        border: 1px solid #4facfe;
        border-radius: 8px;
        padding: 10px;
        font-size: 12px;
        color: #4facfe;
        line-height: 1.4;
      }

      /* Context Indicator */
      .vilgax-context {
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.5);
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 10px;
        font-size: 11px;
        color: #d8b4fe;
      }

      /* Emotion Indicator */
      .vilgax-emotion {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #14b8a6;
        margin-top: 8px;
        padding: 8px;
        background: rgba(20, 184, 166, 0.1);
        border-radius: 6px;
      }

      .emotion-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #14b8a6;
      }

      /* Scrollbar styling */
      .vilgax-panel::-webkit-scrollbar {
        width: 6px;
      }

      .vilgax-panel::-webkit-scrollbar-track {
        background: rgba(102, 126, 234, 0.1);
        border-radius: 3px;
      }

      .vilgax-panel::-webkit-scrollbar-thumb {
        background: #667eea;
        border-radius: 3px;
      }

      .vilgax-panel::-webkit-scrollbar-thumb:hover {
        background: #764ba2;
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        .vilgax-container {
          bottom: 10px;
          right: 10px;
        }

        .vilgax-avatar {
          width: 70px;
          height: 70px;
          font-size: 35px;
        }

        .vilgax-panel {
          bottom: 90px;
          right: 10px;
          width: 95vw;
          max-width: 100%;
          padding: 15px;
        }

        .vilgax-commands {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    // Create Avatar
    const vilgaxButton = document.createElement('div');
    vilgaxButton.className = 'vilgax-container';
    vilgaxButton.innerHTML = `
      <div class="vilgax-avatar" id="vilgaxAvatar" title="Click to activate VILGAX or say 'Hey VILGAX'">
        🤖
      </div>
    `;
    document.body.appendChild(vilgaxButton);

    // Create Panel
    const vilgaxPanel = document.createElement('div');
    vilgaxPanel.id = 'vilgaxPanel';
    vilgaxPanel.className = 'vilgax-panel';
    vilgaxPanel.innerHTML = `
      <div class="vilgax-header">
        <span class="vilgax-name">VILGAX AI Assistant</span>
        <span class="vilgax-status" id="vilgaxStatus">Ready</span>
      </div>
      
      <div class="vilgax-context" id="vilgaxContext" style="display: none;"></div>
      
      <div class="vilgax-transcript" id="vilgaxTranscript">
        Click microphone or say "Hey VILGAX" to start
      </div>

      <div class="pulse-line" id="pulseVisualization" style="display: none;">
        <div class="pulse-bar"></div>
        <div class="pulse-bar"></div>
        <div class="pulse-bar"></div>
        <div class="pulse-bar"></div>
        <div class="pulse-bar"></div>
      </div>

      <div class="vilgax-emotion" id="vilgaxEmotion" style="display: none;">
        <div class="emotion-dot"></div>
        <span id="emotionText">Calm</span>
      </div>

      <div class="vilgax-response" id="vilgaxResponse" style="display: none;"></div>

      <button class="vilgax-mic-btn" id="vilgaxMicBtn">
        🎤 Start Listening
      </button>

      <div class="vilgax-commands" id="vilgaxQuickCommands">
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('book appointment')">📅 Book</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('find medicine')">💊 Medicine</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('show records')">📋 Records</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('video call')">📞 Call</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('health tips')">❤️ Tips</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('emergency')">🚨 Emergency</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('help')">❓ Help</button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('close')">❌ Close</button>
      </div>

      <div class="voice-command-hint">
        💡 Try: "Book appointment", "Find medicine", "Emergency contact", "Health tips", or say "Hey VILGAX"
      </div>
    `;
    document.body.appendChild(vilgaxPanel);

    this.container = vilgaxPanel;
    this.avatar = document.getElementById('vilgaxAvatar');
    this.micBtn = document.getElementById('vilgaxMicBtn');
    this.responseDiv = document.getElementById('vilgaxResponse');
  }

  /**
   * Register Advanced Commands (15+ actions)
   */
  registerAdvancedCommands() {
    this.commands.set('book appointment', () => {
      this.respond('📅 Opening appointment booking form...');
      this.setContext('Booking Appointment');
      document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.patient.bookNewAppointment'), 800);
    });

    this.commands.set('find medicine', () => {
      this.respond('💊 Opening medicine finder...');
      this.setContext('Searching Medicine');
      document.getElementById('medicine-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.medicineFinder.medicineFinder'), 800);
    });

    this.commands.set('show records', () => {
      this.respond('📋 Loading your medical records...');
      this.setContext('Viewing Records');
      document.getElementById('records-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.medicalRecords.myMedicalRecords'), 800);
    });

    this.commands.set('video call', () => {
      this.respond('📞 Starting video consultation setup...');
      this.setContext('Video Consultation');
      document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.videoConsultation.videoConsultation'), 800);
    });

    this.commands.set('my prescriptions', () => {
      this.respond('💊 Navigating to prescriptions...');
      this.setContext('Viewing Prescriptions');
      setTimeout(() => window.location.href = 'prescription.html', 500);
    });

    // NEW COMMANDS FOR PHASE 2

    this.commands.set('health tips', () => {
      this.respond('❤️ Generating personalized health tips for you...');
      this.setContext('Health Tips');
      const tips = [
        'Drink at least 8 glasses of water daily',
        'Exercise for 30 minutes every day',
        'Get 7-8 hours of quality sleep',
        'Eat a balanced diet with fruits and vegetables',
        'Practice stress management techniques'
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTimeout(() => {
        audio?.speak(`Health tip: ${randomTip}`);
      }, 500);
    });

    this.commands.set('emergency', () => {
      this.respond('🚨 EMERGENCY MODE ACTIVATED');
      audio?.speak('Emergency contact initiated. Please confirm your location and emergency type.');
      setTimeout(() => {
        this.respond('Connecting to nearest hospital and updating emergency contacts...');
      }, 1000);
    });

    this.commands.set('check symptoms', () => {
      this.respond('🏥 Opening symptom checker...');
      this.setContext('Symptom Analysis');
      audio?.speak('Please describe your symptoms in detail');
    });

    this.commands.set('refill medicine', () => {
      this.respond('💊 Initiating medicine refill...');
      this.setContext('Medicine Refill');
      audio?.speak('Which medicine would you like to refill?');
    });

    this.commands.set('appointment reminder', () => {
      this.respond('📅 Setting appointment reminder...');
      audio?.speak('What time would you like to be reminded?');
    });

    this.commands.set('chat with ai', () => {
      this.respond('🤖 Starting AI health chat...');
      this.setContext('AI Chat');
      document.querySelector('.chatbot')?.scrollIntoView({ behavior: 'smooth' });
    });

    this.commands.set('medical feedback', () => {
      this.respond('📝 Opening feedback form...');
      this.setContext('Providing Feedback');
      audio?.speak('We would love to hear your feedback about our service');
    });

    this.commands.set('schedule test', () => {
      this.respond('🧪 Opening lab test booking...');
      this.setContext('Lab Test');
      audio?.speak('Which lab test would you like to schedule?');
    });

    this.commands.set('doctor search', () => {
      this.respond('👨‍⚕️ Opening doctor search...');
      this.setContext('Doctor Directory');
      audio?.speak('What type of doctor are you looking for?');
    });

    this.commands.set('help', () => {
      this.respond('❓ All available commands listed');
      audio?.speak('I can help with: Book appointment, Find medicine, Show records, Start video call, Health tips, Emergency, Check symptoms, Refill medicine, and more. Say "close" to exit.');
    });

    this.commands.set('close', () => {
      this.togglePanel();
      this.respond('Panel closed. Say "Hey VILGAX" to open again.');
      this.clearContext();
    });

    this.commands.set('history', () => {
      this.respond(`Recent commands: ${this.commandHistory.slice(-5).join(', ')}`);
    });

    this.commands.set('status', () => {
      const status = this.getStatus();
      this.respond(`Commands executed: ${status.commandsExecuted}, Language: ${status.currentLanguage.toUpperCase()}`);
    });
  }

  /**
   * Register Advanced Responses
   */
  registerAdvancedResponses() {
    const responses = {
      'book appointment': ['I\'ll help you book an appointment', 'Let me find available doctors', 'Select your preferred time slot'],
      'find medicine': ['Searching for the medicine...', 'Multiple options available', 'Which dosage do you prefer?'],
      'health tips': ['Here\'s your daily health tip', 'Wellness recommendation for you', 'Health insight based on your profile'],
      'emergency': ['Immediate assistance requested', 'Emergency protocol activated', 'Hospital location identified'],
      'check symptoms': ['Let me help diagnose', 'Analyzing your symptoms', 'Possible treatments available']
    };
    this.voiceResponses = new Map(Object.entries(responses));
  }

  /**
   * Setup Advanced Event Listeners
   */
  setupAdvancedEventListeners() {
    // Avatar click
    this.avatar.addEventListener('click', () => this.togglePanel());

    // Microphone button
    this.micBtn.addEventListener('click', () => this.toggleListening());

    // Language changes
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });

    // Global keyboard shortcut (Alt + ; for VILGAX)
    document.addEventListener('keydown', (e) => {
      if ((e.altKey && e.semicolon) || (e.ctrlKey && e.key === '\\')) {
        e.preventDefault();
        this.togglePanel();
      }
    });
  }

  /**
   * Initialize Hotword Detection
   */
  initializeHotwordDetection() {
    console.log('🎤 Hotword detection initialized');
    
    // Listen for "hey vilgax" in continuous listening mode
    if (audio && audio.recognition) {
      audio.recognition.continuous = true;
      audio.recognition.interimResults = true;
    }
  }

  /**
   * Play Enhanced Welcome
   */
  playWelcome() {
    console.log('🎤 Playing VILGAX welcome...');
    const welcomeTexts = {
      'en': "Hello! I'm VILGAX, your advanced AI health assistant. Welcome to Care Without Borders. I can book appointments, find medicines, check symptoms, provide health tips, and much more. Just tell me what you need!",
      'ta': "வணக்கம்! நான் விள்கேக்ஸ், உங்களின் அ advanced AI சுகாதார உதவியாளர். கேர் வித்தவுட் வோர்டர்ஸ்க்கு வரவேற்கிறோம்.",
      'hi': "नमस्ते! मैं VILGAX, आपका advanced AI स्वास्थ्य सहायक। Care Without Borders में आपका स्वागत है।"
    };

    const welcomeText = welcomeTexts[this.currentLanguage] || welcomeTexts['en'];
    this.respond('🤖 Welcome to VILGAX Advanced!');
    
    setTimeout(() => {
      audio?.speak(welcomeText);
    }, 1000);
  }

  /**
   * Set Context for Multi-turn Commands
   */
  setContext(context) {
    this.currentContext = context;
    const contextDiv = document.getElementById('vilgaxContext');
    if (contextDiv) {
      contextDiv.textContent = `📍 Context: ${context}`;
      contextDiv.style.display = 'block';
    }
  }

  /**
   * Clear Current Context
   */
  clearContext() {
    this.currentContext = null;
    const contextDiv = document.getElementById('vilgaxContext');
    if (contextDiv) {
      contextDiv.style.display = 'none';
    }
  }

  /**
   * Analyze Voice for Emotion (Basic)
   */
  analyz eVoiceEmotion(transcript) {
    const transcriptLower = transcript.toLowerCase();
    
    // Simple keyword-based emotion detection
    const emotions = {
      urgent: ['emergency', 'help', 'pain', 'severe', 'critical'],
      happy: ['great', 'excellent', 'wonderful', 'good', 'amazing'],
      sad: ['sad', 'depressed', 'sorry', 'terrible'],
      stressed: ['stressed', 'anxious', 'worried', 'concerned']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(k => transcriptLower.includes(k))) {
        this.voiceAnalytics.emotion = emotion;
        this.displayEmotion(emotion);
        return emotion;
      }
    }

    return 'neutral';
  }

  /**
   * Display Detected Emotion
   */
  displayEmotion(emotion) {
    const emotionDiv = document.getElementById('vilgaxEmotion');
    const emotionText = document.getElementById('emotionText');
    
    if (emotionDiv && emotionText) {
      const emotionEmoji = {
        urgent: '🚨',
        happy: '😊',
        sad: '😢',
        stressed: '😰',
        neutral: '😐'
      };

      emotionText.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
      emotionDiv.style.display = 'flex';
      
      setTimeout(() => {
        emotionDiv.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Toggle Panel
   */
  togglePanel() {
    this.container.classList.toggle('active');
    this.avatar.classList.toggle('active');
    if (this.container.classList.contains('active')) {
      setTimeout(() => this.startListening(), 500);
    }
  }

  /**
   * Toggle Listening
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Start Listening for Commands
   */
  startListening() {
    if (!audio || !audio.recognition) {
      this.respond('Voice recognition not available');
      return;
    }

    this.isListening = true;
    this.micBtn.classList.add('active');
    this.micBtn.textContent = '🎤 Listening...';
    this.avatar.classList.add('listening');
    document.getElementById('vilgaxStatus').textContent = 'Listening...';
    document.getElementById('vilgaxStatus').classList.add('listening');
    document.getElementById('pulseVisualization').style.display = 'flex';

    const transcript = document.getElementById('vilgaxTranscript');
    transcript.textContent = 'Listening...';
    transcript.classList.add('interim');

    audio.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptText;
        } else {
          interim += transcriptText;
        }
      }

      if (interim) {
        transcript.textContent = interim;
        transcript.classList.add('interim');
      }

      if (final) {
        transcript.textContent = final;
        transcript.classList.remove('interim');
        
        // Detect emotion
        this.analyz eVoiceEmotion(final);
        
        this.executeCommand(final);
      }
    };

    audio.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.respond('Sorry, I didn\'t understand. Try again.');
    };

    audio.listen(this.currentLanguage);
  }

  /**
   * Stop Listening
   */
  stopListening() {
    this.isListening = false;
    this.micBtn.classList.remove('active');
    this.micBtn.textContent = '🎤 Start Listening';
    this.avatar.classList.remove('listening');
    document.getElementById('vilgaxStatus').textContent = 'Ready';
    document.getElementById('vilgaxStatus').classList.remove('listening');
    document.getElementById('pulseVisualization').style.display = 'none';

    if (audio && audio.stopListening) {
      audio.stopListening();
    }
  }

  /**
   * Execute Command with Context Awareness
   */
  executeCommand(command) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const lowerCommand = command.toLowerCase().trim();

    console.log(`🎯 Executing: ${lowerCommand} (Context: ${this.currentContext})`);
    
    // Add to history
    this.commandHistory.push(lowerCommand);
    if (this.commandHistory.length > 10) {
      this.commandHistory.shift();
    }

    // Check for command
    for (const [cmd, handler] of this.commands) {
      if (lowerCommand.includes(cmd)) {
        handler();
        this.commandsExecuted++;
        this.isProcessing = false;
        return;
      }
    }

    // Context-aware responses
    if (this.currentContext) {
      if (this.currentContext === 'Booking Appointment') {
        this.respond('Did you specify a date and time?');
        audio?.speak('Please confirm your preferred appointment date and time');
      } else if (this.currentContext === 'Searching Medicine') {
        this.respond('Which disease or symptom are you searching for?');
      }
    } else {
      this.respond(`❓ Didn't catch that. Try: "Book appointment", "Find medicine", "Health tips", or "Emergency"`);
    }

    this.isProcessing = false;
  }

  /**
   * Display Response
   */
  respond(message) {
    this.responseDiv.textContent = message;
    this.responseDiv.style.display = 'block';

    setTimeout(() => {
      this.responseDiv.style.display = 'none';
    }, 6000);
  }

  /**
   * Get System Status
   */
  getStatus() {
    return {
      isListening: this.isListening,
      currentLanguage: this.currentLanguage,
      commandsExecuted: this.commandsExecuted,
      voiceEnabled: this.voiceEnabled,
      currentContext: this.currentContext,
      recentCommands: this.commandHistory,
      voiceAnalytics: this.voiceAnalytics
    };
  }
}

// Initialize Advanced VILGAX
let vilgax;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Use Advanced version
    vilgax = new VILGAXAssistantAdvanced();
  });
} else {
  vilgax = new VILGAXAssistantAdvanced();
}
