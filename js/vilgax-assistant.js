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
    this.commands.set('book appointment', () => {
      this.respond('Opening appointment booking form...');
      document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => audio?.speakTranslation('pages.patient.bookNewAppointment'), 800);
    });

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
      this.respond('I can help you with: Book appointment, Find medicine, Show records, Start video call, View prescriptions. What would you like to do?');
      audio?.speak('I can help you with: Book appointment, Find medicine, Show records, Start video call, or View prescriptions. What would you like to do?');
    });

    this.commands.set('close', () => {
      this.togglePanel();
      this.respond('Panel closed. Say "Hey VILGAX" to open again.');
    });

    // Appointment form voice commands
    this.commands.set('cardiologist', () => {
      const field = document.getElementById('appointment')?.querySelector('[name="selectDoctorSpecialty"]');
      if (field) {
        field.value = 'Cardiology';
        field.dispatchEvent(new Event('change', { bubbles: true }));
        this.respond('Specialty set to Cardiology. Now tell me your chief complaint.');
      }
    });

    this.commands.set('dermatologist', () => {
      const field = document.getElementById('appointment')?.querySelector('[name="selectDoctorSpecialty"]');
      if (field) {
        field.value = 'Dermatology';
        field.dispatchEvent(new Event('change', { bubbles: true }));
        this.respond('Specialty set to Dermatology. Now tell me your chief complaint.');
      }
    });

    this.commands.set('psychiatrist', () => {
      const field = document.getElementById('appointment')?.querySelector('[name="selectDoctorSpecialty"]');
      if (field) {
        field.value = 'Psychiatry';
        field.dispatchEvent(new Event('change', { bubbles: true }));
        this.respond('Specialty set to Psychiatry. Now tell me your chief complaint.');
      }
    });

    this.commands.set('general practitioner|general doctor|general physician', () => {
      const field = document.getElementById('appointment')?.querySelector('[name="selectDoctorSpecialty"]');
      if (field) {
        field.value = 'General Practice';
        field.dispatchEvent(new Event('change', { bubbles: true }));
        this.respond('Specialty set to General Practice. Now tell me your chief complaint.');
      }
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
      'en': "Hello! I'm VILGAX, your AI health assistant. Welcome to Care Without Borders. I can help you book appointments, find medicines, view your medical records, and more. Just tell me what you need!",
      'ta': "வணக்கம்! நான் விள்கேக்ஸ், உங்களின் AI சுகாதார உதவியாளர். கேர் வித்தவுட் வோர்டர்ஸ்க்கு வரவேற்கிறோம். மருத்துவர் சந்திப்பு பதிவு செய்ய, மருந்து கண்டுபிடிக்க, உங்கள் மருத்துவ பதிவுகளைப் பார்க்க நான் உதவ முடியும். என்ன செய்ய வேண்டும் என்று சொல்லுங்கள்!",
      'hi': "नमस्ते! मैं VILGAX, आपका AI स्वास्थ्य सहायक। Care Without Borders में आपका स्वागत है। मैं आपको डॉक्टर की नियुक्ति बुक करने, दवाएं खोजने, अपने चिकित्सा रिकॉर्ड देखने में मदद कर सकता हूं। बताइए आपको क्या चाहिए!"
    };

    const welcomeText = welcomeTexts[this.currentLanguage] || welcomeTexts['en'];
    this.respond('Welcome to VILGAX AI Assistant! 🤖');
    
    setTimeout(() => {
      audio?.speak(welcomeText);
    }, 1000);
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

    // No match found
    this.respond(`Sorry, I didn't understand "${command}". Try: Book appointment, Find medicine, Show records, or Video call.`);
    audio?.speak('Sorry, I did not understand. Try asking for: Book appointment, Find medicine, Show records, or Video call.');
    this.isProcessing = false;
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
