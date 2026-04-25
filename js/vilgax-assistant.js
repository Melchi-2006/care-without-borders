/**
 * VILGAX AI Assistant - Futurized Voice-First Healthcare Platform
 * Complete AI-powered voice control system for Care Without Borders
 * 
 * Features:
 * - Auto-play welcome greetings
 * - Full voice command recognition & execution
 * - Real-time voice transcription
 * - Futuristic UI with animations
 * - Voice-controlled form filling
 * - Multi-language support
 * - AI personality & responses
 */

class VILGAXAssistant {
  constructor() {
    this.isListening = false;
    this.currentLanguage = i18n?.getLanguage() || 'en';
    this.voiceEnabled = true;
    this.commandsExecuted = 0;
    this.isProcessing = false;
    
    // Medical Intake Flow State
    this.intakeMode = true; // Start in intake mode to listen for symptoms
    this.patientInfoCollected = false;
    this.awaitingAppointmentDecision = false;
    this.selectedSpecialty = null;
    this.selectedTime = null;
    
    // Voice command registry
    this.commands = new Map();
    this.voiceResponses = new Map();
    
    // UI Elements
    this.container = null;
    this.listeningIndicator = null;
    this.transcriptDisplay = null;
    
    this.init();
  }

  /**
   * Initialize VILGAX System
   */
  init() {
    console.log('🤖 VILGAX AI Assistant initializing...');
    
    this.registerCommands();
    this.registerResponses();
    this.createUI();
    this.setupEventListeners();
    
    // Add welcome message when page loads
    window.addEventListener('load', () => {
      setTimeout(() => this.playWelcome(), 1500);
    });
    
    console.log('✅ VILGAX ready for voice commands');
  }

  /**
   * Create Futuristic UI Elements
   */
  createUI() {
    // Add futuristic CSS
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      /* VILGAX Futuristic Styles */
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
      }

      .vilgax-avatar:hover {
        transform: scale(1.1);
        box-shadow: 0 0 50px rgba(102, 126, 234, 0.9);
      }

      .vilgax-avatar.listening {
        animation: vilgax-listening 0.6s ease-in-out infinite;
      }

      @keyframes vilgax-pulse {
        0%, 100% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
        50% { box-shadow: 0 0 50px rgba(102, 126, 234, 0.8); }
      }

      @keyframes vilgax-listening {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }

      .vilgax-panel {
        position: fixed;
        bottom: 120px;
        right: 20px;
        width: 400px;
        max-width: 90vw;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        border: 2px solid #667eea;
        padding: 20px;
        display: none;
        z-index: 9999;
        animation: slide-up 0.4s ease;
        max-height: 600px;
        overflow-y: auto;
        color: #e0e0e0;
      }

      .vilgax-panel.active {
        display: block;
      }

      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
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
      }

      .vilgax-status.listening {
        color: #4ade80;
        background: rgba(74, 222, 128, 0.2);
      }

      .vilgax-transcript {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #667eea;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
        font-size: 14px;
        min-height: 40px;
        color: #e0e0e0;
        line-height: 1.5;
      }

      .vilgax-transcript.interim {
        color: #999;
        font-style: italic;
      }

      .vilgax-response {
        background: rgba(102, 126, 234, 0.1);
        border-left: 3px solid #667eea;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        font-size: 13px;
        color: #e0e0e0;
      }

      .vilgax-commands {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
      }

      .vilgax-command-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 1px solid #764ba2;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
      }

      .vilgax-command-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }

      .vilgax-mic-btn {
        width: 100%;
        background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
        border: 2px solid #14b8a6;
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 12px;
      }

      .vilgax-mic-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4);
      }

      .vilgax-mic-btn.active {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-color: #dc2626;
        animation: pulse-red 0.6s ease-in-out infinite;
      }

      @keyframes pulse-red {
        0%, 100% { box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 8px 30px rgba(239, 68, 68, 0.6); }
      }

      .pulse-line {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 20px;
        margin: 10px 0;
      }

      .pulse-bar {
        width: 3px;
        height: 8px;
        background: #667eea;
        border-radius: 2px;
        animation: pulse 0.6s ease-in-out infinite;
      }

      .pulse-bar:nth-child(1) { animation-delay: 0s; }
      .pulse-bar:nth-child(2) { animation-delay: 0.1s; }
      .pulse-bar:nth-child(3) { animation-delay: 0.2s; }
      .pulse-bar:nth-child(4) { animation-delay: 0.3s; }
      .pulse-bar:nth-child(5) { animation-delay: 0.4s; }

      @keyframes pulse {
        0%, 100% { height: 8px; }
        50% { height: 20px; }
      }

      .voice-command-hint {
        background: rgba(79, 172, 254, 0.1);
        border: 1px solid #4facfe;
        border-radius: 8px;
        padding: 10px;
        margin-top: 12px;
        font-size: 12px;
        color: #4facfe;
      }

      /* Floating elements */
      .floating-particles {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
      }

      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #667eea;
        border-radius: 50%;
        opacity: 0.3;
        animation: float 20s infinite linear;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 0.5; }
        90% { opacity: 0.5; }
        100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);

    // Create VILGAX Avatar Button
    const vilgaxButton = document.createElement('div');
    vilgaxButton.className = 'vilgax-container';
    vilgaxButton.innerHTML = `
      <div class="vilgax-avatar" id="vilgaxAvatar" title="Click or speak to activate VILGAX">
        🤖
      </div>
    `;
    document.body.appendChild(vilgaxButton);

    // Create VILGAX Panel
    const vilgaxPanel = document.createElement('div');
    vilgaxPanel.id = 'vilgaxPanel';
    vilgaxPanel.className = 'vilgax-panel';
    vilgaxPanel.innerHTML = `
      <div class="vilgax-header">
        <span class="vilgax-name">VILGAX AI Assistant</span>
        <span class="vilgax-status" id="vilgaxStatus">Ready</span>
      </div>
      
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

      <div class="vilgax-response" id="vilgaxResponse" style="display: none;"></div>

      <button class="vilgax-mic-btn" id="vilgaxMicBtn">
        🎤 Start Listening
      </button>

      <div class="vilgax-commands" id="vilgaxQuickCommands">
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('book appointment')">
          📅 Book Appointment
        </button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('find medicine')">
          💊 Find Medicine
        </button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('show records')">
          📋 My Records
        </button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('video call')">
          📞 Video Call
        </button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('help')">
          ❓ Help
        </button>
        <button class="vilgax-command-btn" onclick="vilgax.executeCommand('close')">
          ❌ Close
        </button>
      </div>

      <div class="voice-command-hint">
        💡 Try: "Book appointment", "Find medicine", "Show my records", "Start video call"
      </div>
    `;
    document.body.appendChild(vilgaxPanel);

    // Add floating particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);

    this.container = vilgaxPanel;
    this.avatar = document.getElementById('vilgaxAvatar');
    this.micBtn = document.getElementById('vilgaxMicBtn');
  }

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    // Avatar click to toggle panel
    this.avatar.addEventListener('click', () => this.togglePanel());

    // Microphone button
    this.micBtn.addEventListener('click', () => this.toggleListening());

    // Listen for language changes
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  }

  /**
   * Register Voice Commands
   */
  registerCommands() {
    // Medical Intake Commands
    this.commands.set('intake', () => {
      this.respond('Please describe your health concern. Include your name, age, and symptoms.');
      audio?.speak('Please tell me about your health concern. You can say your name, age, and describe your symptoms.');
      this.intakeMode = true;
    });

    // Appointment Flow
    this.commands.set('book appointment', () => {
      if (!this.patientInfoCollected) {
        this.startMedicalIntake();
      } else {
        this.offerAppointmentOrDiagnosis();
      }
    });

    // Diagnosis
    this.commands.set('ai diagnosis|check symptoms|symptom checker', () => {
      if (!this.patientInfoCollected) {
        this.startMedicalIntake();
      } else {
        this.provideDiagnosis();
      }
    });

    // Standard Commands
    this.commands.set('find medicine', () => {
      this.respond('Opening medicine finder...');
      document.getElementById('medicine-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.medicineFinder.medicineFinder'), 800);
    });

    this.commands.set('show records', () => {
      this.respond('Loading your medical records...');
      document.getElementById('records-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.medicalRecords.myMedicalRecords'), 800);
    });

    this.commands.set('video call', () => {
      this.respond('Starting video consultation setup...');
      document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.videoConsultation.videoConsultation'), 800);
    });

    this.commands.set('my prescriptions', () => {
      this.respond('Navigating to prescriptions...');
      window.location.href = 'prescription.html';
    });

    this.commands.set('help', () => {
      const helpText = 'I can help you with: Describe your health concern for medical intake, Book an appointment, Get AI diagnosis, Find medicine, Show records, Start video call, View prescriptions. What would you like to do?';
      this.respond(helpText);
      audio?.speak(helpText);
    });

    this.commands.set('close', () => {
      this.togglePanel();
      this.respond('Panel closed. Say "Hey VILGAX" to open again.');
    });

    // Appointment form voice commands
    this.commands.set('cardiologist', () => {
      this.selectedSpecialty = 'Cardiology';
      this.handleSpecialtySelection('Cardiology');
    });

    this.commands.set('dermatologist', () => {
      this.selectedSpecialty = 'Dermatology';
      this.handleSpecialtySelection('Dermatology');
    });

    this.commands.set('psychiatrist', () => {
      this.selectedSpecialty = 'Psychiatry';
      this.handleSpecialtySelection('Psychiatry');
    });

    this.commands.set('general practitioner|general doctor|general physician', () => {
      this.selectedSpecialty = 'General Practice';
      this.handleSpecialtySelection('General Practice');
    });
  }

  /**
   * Register AI Responses
   */
  registerResponses() {
    const responses = {
      'book appointment': [
        'I\'ll help you book an appointment with one of our doctors.',
        'Which doctor would you like to see?',
        'What time works best for you?'
      ],
      'find medicine': [
        'Let\'s find the right medicine for you.',
        'What medicine are you looking for?',
        'Or would you prefer to search by disease?'
      ],
      'show records': [
        'Retrieving your medical records...',
        'Here are your saved medical documents.',
        'You can upload new records here.'
      ],
      'video call': [
        'Preparing video consultation...',
        'Select a doctor and time slot to proceed.',
        'HD quality secure video call will be established.'
      ]
    };
    this.voiceResponses = new Map(Object.entries(responses));
  }

  /**
   * Play Welcome Message
   */
  playWelcome() {
    console.log('🎤 Playing VILGAX welcome...');
    const welcomeTexts = {
      'en': "Hello! I'm VILGAX, your AI health assistant. Welcome to Care Without Borders. Please tell me about any health concerns you have - include your name, age, and symptoms - and I'll help you book an appointment with the right doctor, provide AI diagnosis, find medicines, and more. Just describe what's troubling you!",
      'ta': "வணக்கம்! நான் விள்கேக்ஸ், உங்களின் AI சுகாதார உதவியாளர். கேர் வித்தவுட் வோர்டர்ஸ்க்கு வரவேற்கிறோம். உங்கள் எந்த சுகாதார கவலைகளையும் எனக்கு சொல்லுங்கள் - உங்கள் பெயர், வயது மற்றும் அறிகுறிகளை சேர்த்து. நான் உங்களுக்கு சரியான மருத்துவருடன் ஒரு சந்திப்பை பதிவு செய்ய உதவ முடியும், AI நির்ணயம் வழங்க, மருந்து கண்டுபிடிக்க மற்றும் பல. என்ன சிக்கல் என்று விவரிக்கவும்!",
      'hi': "नमस्ते! मैं VILGAX, आपका AI स्वास्थ्य सहायक। Care Without Borders में आपका स्वागत है। मुझे अपने स्वास्थ्य संबंधी किसी भी समस्या के बारे में बताइए - अपना नाम, उम्र और लक्षण शामिल करें। मैं आपको सही डॉक्टर के साथ नियुक्ति बुक करने, AI निदान देने, दवाएं खोजने और अधिक में मदद कर सकता हूं। बताइए क्या परेशानी है!"
    };

    const welcomeText = welcomeTexts[this.currentLanguage] || welcomeTexts['en'];
    this.respond('🤖 VILGAX AI Medical Assistant Ready!\n\nTell me about your health concern and I\'ll guide you through everything.');
    
    setTimeout(() => {
      audio?.speak(welcomeText);
    }, 800);

    // Auto-show panel and start listening
    setTimeout(() => {
      this.togglePanel();
    }, 2000);
  }

  /**
   * Toggle Panel Display
   */
  togglePanel() {
    this.container.classList.toggle('active');
    if (this.container.classList.contains('active')) {
      setTimeout(() => this.startListening(), 500);
    }
  }

  /**
   * Toggle Voice Listening
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Start Listening for Voice Commands
   */
  startListening() {
    if (!audio || !audio.recognition) {
      this.respond('Voice recognition not available in your browser');
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

    audio.recognition.onstart = () => {
      console.log('🎤 Listening started');
    };

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
        this.executeCommand(final);
        // Keep listening for next command
        console.log('✅ Command executed. Still listening...');
      }
    };

    audio.recognition.onend = () => {
      // Don't stop listening - only stop if user explicitly stops
      if (this.isListening) {
        // Auto-restart listening
        console.log('🔄 Restarting listening...');
        try {
          audio.recognition.start();
        } catch (e) {
          console.log('Listening restart:', e);
        }
      }
    };

    audio.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'network') {
        this.respond('No speech detected. Still listening...');
        // Continue listening even on error
        if (this.isListening) {
          try {
            audio.recognition.start();
          } catch (e) {
            console.log('Restart after error:', e);
          }
        }
      } else {
        this.respond('Sorry, there was an error. Try again.');
      }
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
   * Execute Voice Command
   */
  executeCommand(command) {
    if (this.isProcessing) return;
    
    // In medical intake mode, process as symptom description unless it's a direct command
    if (this.intakeMode && !this.isDirectCommand(command)) {
      this.processMedicalIntake(command);
      return;
    }
    
    this.isProcessing = true;
    const lowerCommand = command.toLowerCase().trim();

    console.log(`🎯 Executing command: ${lowerCommand}`);

    // Check for matches - handle pipe-separated aliases
    for (const [cmd, handler] of this.commands) {
      // Split by | to handle multiple command aliases
      const aliases = cmd.split('|').map(a => a.trim());
      for (const alias of aliases) {
        if (lowerCommand.includes(alias)) {
          handler();
          this.commandsExecuted++;
          this.isProcessing = false;
          return;
        }
      }
    }

    // No match found - ask for clarification
    if (this.intakeMode) {
      this.processMedicalIntake(command); // Process as symptoms if in intake mode
    } else {
      this.respond(`Sorry, I didn't understand "${command}". Try: Book appointment, Find medicine, Show records, or Video call.`);
      audio?.speak('Sorry, I did not understand. Try asking for: Book appointment, Find medicine, Show records, or Video call.');
      this.isProcessing = false;
    }
  }

  /**
   * Check if command is a direct command (not a symptom description)
   */
  isDirectCommand(text) {
    const directCmds = [
      'book', 'appointment', 'medicine', 'records', 'video', 'call', 
      'diagnosis', 'symptoms', 'help', 'close', 'yes', 'no',
      'cardiologist', 'dermatologist', 'psychiatrist'
    ];
    return directCmds.some(cmd => text.toLowerCase().includes(cmd));
  }

  /**
   * Start Medical Intake Process
   */
  startMedicalIntake() {
    this.intakeMode = true;
    const intakePrompt = 'Please tell me about your health concern. Include your name, age, location, and describe your symptoms with when they started.';
    this.respond(`🏥 Starting Medical Intake...\n\n${intakePrompt}`);
    audio?.speak(intakePrompt);
  }

  /**
   * Process Medical Intake - Extract symptoms from patient description
   */
  processMedicalIntake(userInput) {
    if (!medicalAnalyzer) {
      console.error('Medical analyzer not loaded');
      return;
    }

    // Extract patient information
    const patientInfo = medicalAnalyzer.extractPatientInfo(userInput);
    
    // Update global tracker
    Object.assign(medicalAnalyzer.patientInfo, patientInfo);
    this.patientInfoCollected = true;

    // ===== ML ENGINE ANALYSIS =====
    // Run through professional ML pipeline
    const analysis = vilgaxMLEngine.analyzePatient(patientInfo);
    
    console.log('🧠 ML Analysis Results:', analysis);

    // Show extracted information
    const summary = medicalAnalyzer.formatIntakeSummary(patientInfo);
    const mlSummary = this.formatMLAnalysisSummary(analysis);
    
    this.respond(`✅ Information Captured:\n\n${summary}\n\n${mlSummary}`);

    console.log('📋 Extracted Patient Info:', patientInfo);

    // Recommend specialist based on ML analysis
    if (patientInfo.symptoms.length > 0) {
      this.selectedSpecialty = analysis.recommendedSpecialty;
      
      const confidencePercent = (analysis.confidence * 100).toFixed(1);
      const confirmText = `Based on your symptoms (${medicalAnalyzer.formatSymptoms(patientInfo.symptoms)}), I recommend a ${analysis.recommendedSpecialty} specialist (${confidencePercent}% confidence).\n\nSeverity: ${analysis.severity.level}\n\nWould you like to book an appointment or get AI diagnosis?`;
      
      this.respond(confirmText);
      audio?.speak(`Based on your symptoms, I recommend seeing a ${analysis.recommendedSpecialty} specialist. Would you like to book an appointment or get AI diagnosis? Say "Book appointment" or "AI diagnosis".`);
    } else {
      // No symptoms detected, ask for clarification
      const clarifyText = 'I didn\'t catch any specific symptoms. Could you describe more clearly what\'s troubling you? For example: fever, headache, cough, etc.';
      this.respond(clarifyText);
      audio?.speak(clarifyText);
      this.patientInfoCollected = false; // Reset to ask again
    }
  }

  /**
   * Format ML Analysis Summary
   */
  formatMLAnalysisSummary(analysis) {
    let summary = [];
    summary.push(`🧠 AI Analysis:`);
    summary.push(`   Severity: ${analysis.severity.level} (Score: ${(analysis.severity.score * 100).toFixed(0)}%)`);
    summary.push(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    summary.push(`   Priority: ${analysis.doctorPriority.urgency}`);
    summary.push(`   Expected Wait: ${analysis.doctorPriority.waitTime}`);
    summary.push(`   Doctor Rating Needed: ⭐ ${analysis.doctorPriority.doctorMinRating}+`);
    return summary.join('\n');
  }

  /**
   * Offer appointment or diagnosis choice
   */
  offerAppointmentOrDiagnosis() {
    const choiceText = '📋 Would you like to:\n1. BOOK an appointment with a doctor\n2. Get AI DIAGNOSIS';
    this.respond(choiceText);
    audio?.speak('Would you like to book an appointment with a doctor or get AI diagnosis? Say "Book appointment" or "AI diagnosis".');
    this.awaitingAppointmentDecision = true;
  }

  /**
   * Provide AI Diagnosis
   */
  provideDiagnosis() {
    const patientInfo = medicalAnalyzer.patientInfo;
    const symptoms = patientInfo.symptoms;

    if (symptoms.length === 0) {
      this.respond('Please describe your symptoms first.');
      return;
    }

    const symptomList = medicalAnalyzer.formatSymptoms(symptoms);
    const diagnosisText = `🔍 AI Diagnosis Analysis\n\nSymptoms: ${symptomList}\nDuration: ${patientInfo.duration || 'Not specified'}\nSeverity: ${patientInfo.severity}\n\nRecommended Specialty: ${this.selectedSpecialty}\n\n⚠️ This is AI-powered preliminary analysis. Please consult with a doctor for proper diagnosis.`;
    
    this.respond(diagnosisText);
    audio?.speak(`Based on your symptoms, I recommend consulting a ${this.selectedSpecialty} specialist. This is an AI analysis. Please consult with a doctor for accurate diagnosis.`);

    // Offer to book appointment
    setTimeout(() => {
      const offerText = 'Would you like to book an appointment with a specialist now?';
      this.respond(offerText);
      audio?.speak(offerText);
    }, 2000);
  }

  /**
   * Handle Specialty Selection
   */
  handleSpecialtySelection(specialty) {
    this.selectedSpecialty = specialty;
    const selectedText = `✅ Specialty selected: ${specialty}\n\nFinding available doctors...`;
    this.respond(selectedText);
    audio?.speak(`Great! I'm finding available ${specialty} specialists for you.`);

    // Get available doctors
    setTimeout(() => this.showAvailableDoctors(specialty), 1500);
  }

  /**
   * Show Available Doctors
   */
  showAvailableDoctors(specialty) {
    const doctors = doctorBookingSystem.findDoctorsBySpecialty(specialty);
    
    if (doctors.length === 0) {
      this.respond('Sorry, no doctors available in this specialty right now. Try again later.');
      audio?.speak('Sorry, no doctors are available in this specialty right now.');
      return;
    }

    const doctorList = doctorBookingSystem.formatDoctorList(doctors);
    const listText = `👨‍⚕️ Available Doctors:\n\n${doctorList}`;
    this.respond(listText);
    audio?.speak(`Found ${doctors.length} available doctors. The top doctor is ${doctors[0].name}, with a ${doctors[0].rating} star rating.`);

    // Ask for preferred time
    setTimeout(() => this.askForAppointmentTime(), 2000);
  }

  /**
   * Ask for Appointment Time
   */
  askForAppointmentTime() {
    const timeText = 'What time would you prefer? Available times: 9:00 AM, 10:00 AM, 2:00 PM, 3:00 PM';
    this.respond(timeText);
    audio?.speak('What time would you prefer for your appointment? You can choose from morning slots like 9 AM or 10 AM, or afternoon slots like 2 PM or 3 PM.');
  }

  /**
   * Process Appointment Time Selection
   */
  processTimeSelection(timeInput) {
    // Parse time
    const timeMatch = timeInput.match(/(\d{1,2}):(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      this.selectedTime = timeInput;
      this.confirmAndBookAppointment();
    } else {
      const clarifyText = 'Please specify a time. For example: "9 AM" or "2:30 PM"';
      this.respond(clarifyText);
      audio?.speak(clarifyText);
    }
  }

  /**
   * Confirm and Book Appointment
   */
  confirmAndBookAppointment() {
    if (!this.selectedSpecialty || !medicalAnalyzer.patientInfo.name) {
      this.respond('Missing patient information. Please try again.');
      return;
    }

    const confirmText = `📅 Booking Appointment...\n\nPatient: ${medicalAnalyzer.patientInfo.name}\nAge: ${medicalAnalyzer.patientInfo.age}\nSpecialty: ${this.selectedSpecialty}\nTime: ${this.selectedTime || 'Next available'}\nSymptoms: ${medicalAnalyzer.formatSymptoms(medicalAnalyzer.patientInfo.symptoms)}`;
    
    this.respond(confirmText);
    audio?.speak(`Booking appointment for ${medicalAnalyzer.patientInfo.name}. Finding the best available doctor...`);

    // Create appointment request
    setTimeout(() => this.createAppointmentRequest(), 1500);
  }

  /**
   * Create Appointment Request (Triggers Uber-like booking)
   */
  createAppointmentRequest() {
    const patientInfo = medicalAnalyzer.patientInfo;
    const severity = patientInfo._severity || null;

    const appointmentRequest = doctorBookingSystem.createAppointmentRequest(
      patientInfo,
      this.selectedSpecialty,
      this.selectedTime,
      severity
    );

    // Store analysis for feedback
    patientInfo._analysis = window.currentAnalysis || null;

    // Wait for doctor acceptance
    setTimeout(() => {
      const request = doctorBookingSystem.getRequestStatus(appointmentRequest.requestId);
      
      if (request.status === 'accepted') {
        const appointment = doctorBookingSystem.activeAppointments.values().next().value;
        if (appointment && appointment.requestId === appointmentRequest.requestId) {
          this.showAppointmentConfirmation(appointment);
        }
      } else {
        this.respond('No doctor available. Please try again later.');
        audio?.speak('Sorry, no doctor was available for this time. Please try a different time or specialty.');
      }
    }, 2500);
  }

  /**
   * Show Appointment Confirmation
   */
  showAppointmentConfirmation(appointment) {
    const analysis = medicalAnalyzer.patientInfo._analysis || {};
    
    let confirmationText = `✅ Appointment Confirmed!\n\n`;
    confirmationText += `👨‍⚕️ Doctor: ${appointment.doctor.name}\n`;
    confirmationText += `🏥 Specialty: ${appointment.doctor.specialty}\n`;
    confirmationText += `📍 Experience: ${appointment.doctor.experience}\n`;
    confirmationText += `⭐ Rating: ${appointment.doctor.rating}/5\n`;
    confirmationText += `🎥 Video Room: ${appointment.videoRoomId}\n`;
    
    if (analysis.severity) {
      confirmationText += `⚠️ Severity Level: ${analysis.severity.level}\n`;
    }
    
    confirmationText += `📱 Status: Ready for Video Call\n`;
    
    this.respond(confirmationText);
    audio?.speak(`Your appointment is confirmed! Doctor ${appointment.doctor.name} will join you in a video call shortly.`);

    // Store appointment for video call and feedback
    window.currentAppointment = appointment;
    window.currentAnalysis = analysis;

    // Start video call after 3 seconds
    setTimeout(() => {
      this.startVideoCall(appointment);
    }, 3000);
  }

  /**
   * End Appointment and Collect Doctor Feedback
   */
  endAppointmentWithFeedback(appointment, doctorFeedback) {
    // doctorFeedback format:
    // { doctorRating: 1-5, correctSpecialty: true/false, appointmentQuality: 1-5, patientOutcome: 'positive'|'negative'|'neutral' }

    if (!vilgaxMLEngine) {
      console.error('ML Engine not available');
      return;
    }

    // Record feedback for learning
    vilgaxMLEngine.feedbackLearner.recordFeedback({
      appointmentId: appointment.appointmentId,
      doctorId: appointment.doctorId,
      specialty: appointment.specialty,
      ...doctorFeedback
    });

    // Get updated performance metrics
    const metrics = vilgaxMLEngine.getPerformanceMetrics();
    console.log('📊 Updated VILGAX Performance:', metrics);

    // Show learning progress
    const accuracy = (metrics.overallAccuracy * 100).toFixed(2);
    const feedbackMsg = `Thank you for the feedback! VILGAX is now at ${accuracy}% accuracy with ${metrics.feedbackSamples} feedback samples.`;
    
    this.respond(feedbackMsg);
    audio?.speak(feedbackMsg);
  }

  /**
   * Start Video Call
   */
  startVideoCall(appointment) {
    const videoText = `📹 Starting Video Consultation...\n\nRoom: ${appointment.videoRoomId}\nDoctor: ${appointment.doctor.name}\n\nWaiting for doctor to join...`;
    this.respond(videoText);
    
    // In production, this would trigger actual video infrastructure
    audio?.speak(`Starting your video consultation with ${appointment.doctor.name}. Please wait for the doctor to join.`);
    
    // Simulate video call initiation
    doctorBookingSystem.startVideoCall(appointment.appointmentId);
  }

  /**
   * Display Response Message
   */
  respond(message) {
    const responseDiv = document.getElementById('vilgaxResponse');
    responseDiv.textContent = message;
    responseDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      responseDiv.style.display = 'none';
    }, 5000);
  }

  /**
   * Get Status
   */
  getStatus() {
    return {
      isListening: this.isListening,
      currentLanguage: this.currentLanguage,
      commandsExecuted: this.commandsExecuted,
      voiceEnabled: this.voiceEnabled
    };
  }
}

// Initialize VILGAX when page loads
let vilgax;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgax = new VILGAXAssistant();
  });
} else {
  vilgax = new VILGAXAssistant();
}
