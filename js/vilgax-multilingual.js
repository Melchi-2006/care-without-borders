/**
 * VILGAX Multilingual Assistant v2.0
 * Features: Auto-greeting, Voice commands, Language-aware navigation
 * Integrates with: i18n system, Audio system, Browser navigation
 */

class VilgaxMultilingual {
  constructor() {
    this.isInitialized = false;
    this.currentLanguage = localStorage.getItem('language') || 'en';
    
    // Messages in different languages
    this.messages = {
      'en': {
        greeting: "Welcome to Care Without Borders! I'm VILGAX AI, your intelligent health assistant. I can help you with symptom analysis, disease information, book appointments, find medicines, and connect with doctors. You can speak commands like: doctor, medicines, appointments, chatbot, or ask me a health question. What can I help you with today?",
        listeningPrompt: "I'm listening... Say a command or ask a question.",
        notUnderstood: "I didn't understand that. You can say: doctor, medicines, appointments, chatbot, or ask me anything about health.",
        navigating: "Opening that for you now.",
        commandsList: "Available commands: doctor, medicines, appointments, chatbot, medical records, prescriptions. Or just ask me a health question!"
      },
      'ta': {
        greeting: "கேர் விதவுட் பார்டர்ஸ் க்கு வரவேற்கிறோம்! நான் விலின்கஸ் AI, உங்கள் புத்திசாலி சுகாதார உதவியாளர். நான் உங்களுக்கு அறிகுறி பகுப்பாய்வு, நோய் தகவல், நியமனம் புத்தகம், மருந்து கண்டுபிடிக்கவும், மற்றும் டாக்டர்களுடன் இணைக்க முடியும். நீங்கள் பேசக்கூடிய கட்டளைகள்: டாக்டர், மருந்தே, நியமனங்கள், சாட்போட், அல்லது சுகாதார கேள்வி கேட்க. இன்று நான் உங்களுக்கு என்ன உதவ முடியும்?",
        listeningPrompt: "நான் கேட்கிறேன்... கட்டளை பேசுங்கள் அல்லது கேள்வி கேளுங்கள்.",
        notUnderstood: "நான் அதை புரிந்துகொள்ளவில்லை. நீ சொல்லலாம்: டாக்டர், மருந்தே, நியமனங்கள், சாட்போட், அல்லது சுகாதாரம் பற்றி என்னிடம் கேள்வி கேள்.",
        navigating: "இப்போது அதை உங்களுக்கு திறக்கிறேன்.",
        commandsList: "கிடைக்கக்கூடிய கட்டளைகள்: டாக்டர், மருந்தே, நியமனங்கள், சாட்போட், மருத்துவ பதிவுகள், பரிந்துரைகள். அல்லது சுகாதாரம் பற்றி என்னிடம் கேள்வி கேள்!"
      },
      'hi': {
        greeting: "केयर विदाउट बॉर्डर्स में आपका स्वागत है! मैं विलगैक्स एआई, आपका बुद्धिमान स्वास्थ्य सहायक। मैं आपको लक्षण विश्लेषण, रोग की जानकारी, नियुक्ति बुक करने, दवाएं खोजने, और डॉक्टरों से जुड़ने में मदद कर सकता हूं। आप कुछ आदेश बोल सकते हैं: डॉक्टर, दवाएं, नियुक्तियां, चैटबॉट, या मुझसे कोई स्वास्थ्य प्रश्न पूछ सकते हैं। आज मैं आपकी क्या मदद कर सकता हूं?",
        listeningPrompt: "मैं सुन रहा हूं... कमांड बोलें या कोई प्रश्न पूछें।",
        notUnderstood: "मैंने वह नहीं समझा। आप कह सकते हैं: डॉक्टर, दवाएं, नियुक्तियां, चैटबॉट, या स्वास्थ्य के बारे में मुझसे कोई प्रश्न पूछ सकते हैं।",
        navigating: "अब मैं इसे आपके लिए खोल रहा हूं।",
        commandsList: "उपलब्ध कमांड: डॉक्टर, दवाएं, नियुक्तियां, चैटबॉट, चिकित्सा रिकॉर्ड, प्रिस्क्रिप्शन। या बस स्वास्थ्य के बारे में मुझसे प्रश्न पूछें!"
      }
    };

    // Voice command mappings with synonyms in each language
    this.commands = {
      'en': {
        'doctor': ['doctor', 'doctors', 'see doctor', 'talk to doctor', 'doctor page'],
        'medicines': ['medicine', 'medicines', 'drug', 'drugs', 'medicine finder', 'find medicine'],
        'appointments': ['appointment', 'appointments', 'book appointment', 'schedule', 'schedule appointment'],
        'chatbot': ['chatbot', 'ai', 'assistant', 'chat', 'vilgax', 'talk to ai'],
        'records': ['medical records', 'records', 'my records', 'medical'],
        'prescriptions': ['prescription', 'prescriptions', 'my prescriptions', 'prescribe'],
        'help': ['help', 'commands', 'what can you do', 'assist', 'support']
      },
      'ta': {
        'doctor': ['டாக்டர்', 'டாக்டர்கள்', 'டாக்டரைப் பார்க்கவும்', 'டாக்டருடன் பேசுங்கள்'],
        'medicines': ['மருந்து', 'மருந்தே', 'மருந்து கண்டுபிடிக்கவும்', 'மருந்து தேடுங்கள்'],
        'appointments': ['நியமனம்', 'நியமனங்கள்', 'நியமனம் புத்தகம்', 'திட்டமிடல்'],
        'chatbot': ['சாட்போட்', 'எআई', 'உதவியாளர்', 'விலின்கஸ்'],
        'records': ['மருத்துவ பதிவுகள்', 'பதிவுகள்', 'என் பதிவுகள்'],
        'prescriptions': ['பரிந்துரைகள்', 'என் பரிந்துரைகள்'],
        'help': ['உதவி', 'கட்டளைகள்', 'என்ன உதவ முடியும்']
      },
      'hi': {
        'doctor': ['डॉक्टर', 'डॉक्टर्स', 'डॉक्टर देखें', 'डॉक्टर से बात करें'],
        'medicines': ['दवा', 'दवाएं', 'दवा खोजें', 'दवा ढूंढें'],
        'appointments': ['नियुक्ति', 'नियुक्तियां', 'नियुक्ति बुक करें', 'शेड्यूल'],
        'chatbot': ['चैटबॉट', 'एआई', 'सहायक', 'विलगैक्स'],
        'records': ['चिकित्सा रिकॉर्ड', 'रिकॉर्ड', 'मेरे रिकॉर्ड'],
        'prescriptions': ['प्रेस्क्रिप्शन', 'मेरी प्रेस्क्रिप्शन'],
        'help': ['मदद', 'कमांड', 'आप क्या कर सकते हैं']
      }
    };

    // Page navigation mappings
    this.pageRoutes = {
      'doctor': 'doctor.html',
      'medicines': 'medicine-finder.html',
      'appointments': 'patient.html#appointments',
      'records': 'medical-records.html',
      'prescriptions': 'prescription.html',
      'chatbot': 'chatbot.html'
    };

    this.init();
  }

  /**
   * Initialize the multilingual VILGAX system
   */
  init() {
    // Wait for i18n to be ready
    if (typeof i18n !== 'undefined' && typeof audio !== 'undefined') {
      this.setupVilgax();
    } else {
      // Retry if systems not yet loaded
      setTimeout(() => this.init(), 500);
    }
  }

  /**
   * Setup VILGAX greeting and listen for language changes
   */
  setupVilgax() {
    // Update language on i18n ready event
    window.addEventListener('i18nReady', (e) => {
      this.currentLanguage = e.detail.language || localStorage.getItem('language') || 'en';
      console.log(`✓ VILGAX switched to: ${this.currentLanguage}`);
      this.setupSpeechRecognition();
    });

    // Listen for language change events
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language || localStorage.getItem('language') || 'en';
      console.log(`✓ VILGAX updated language to: ${this.currentLanguage}`);
      this.setupSpeechRecognition();
    });

    // Initial setup
    this.currentLanguage = i18n.getLanguage && i18n.getLanguage() || localStorage.getItem('language') || 'en';
    this.setupSpeechRecognition();

    // Auto-greet after page loads (small delay to ensure everything is ready)
    window.addEventListener('load', () => {
      setTimeout(() => this.autoGreet(), 1000);
    });

    this.isInitialized = true;
    console.log('✓ VILGAX Multilingual initialized');
  }

  /**
   * Auto-greet with current language
   */
  autoGreet() {
    const greetingMsg = this.messages[this.currentLanguage]?.greeting || this.messages['en'].greeting;
    console.log(`🎙️ VILGAX greeting in ${this.currentLanguage}: ${greetingMsg.substring(0, 50)}...`);
    
    if (audio && typeof audio.speak === 'function') {
      audio.speak(greetingMsg, {
        lang: this.getLanguageCode(this.currentLanguage)
      });
    }
  }

  /**
   * Setup speech recognition with current language
   */
  setupSpeechRecognition() {
    if (!audio || !audio.recognition) return;

    // Set language for recognition
    const langCode = this.getLanguageCode(this.currentLanguage);
    audio.recognition.lang = langCode;

    // Clear old listeners
    audio.recognition.onend = null;

    // Setup recognition result handler
    audio.recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript.trim()) {
        console.log(`🎤 Recognized: ${finalTranscript}`);
        this.processVoiceCommand(finalTranscript.trim());
      }
    };

    audio.recognition.onerror = (event) => {
      console.log(`❌ Speech recognition error: ${event.error}`);
    };

    audio.recognition.onend = () => {
      console.log('Stopped listening');
    };
  }

  /**
   * Process voice command and navigate or respond
   */
  processVoiceCommand(transcript) {
    const langCommands = this.commands[this.currentLanguage] || this.commands['en'];
    let matchedCommand = null;

    // Find matching command
    for (const [command, keywords] of Object.entries(langCommands)) {
      for (const keyword of keywords) {
        if (transcript.includes(keyword.toLowerCase())) {
          matchedCommand = command;
          break;
        }
      }
      if (matchedCommand) break;
    }

    if (matchedCommand) {
      this.executeCommand(matchedCommand);
    } else {
      // If no command matches, respond that we didn't understand
      const msg = this.messages[this.currentLanguage]?.notUnderstood || this.messages['en'].notUnderstood;
      audio.speak(msg, { lang: this.getLanguageCode(this.currentLanguage) });
    }
  }

  /**
   * Execute navigation command
   */
  executeCommand(command) {
    const navigationMsg = this.messages[this.currentLanguage]?.navigating || this.messages['en'].navigating;
    
    // Announce navigation
    audio.speak(navigationMsg, { lang: this.getLanguageCode(this.currentLanguage) });

    // Small delay to finish speaking before navigation
    setTimeout(() => {
      if (command === 'help') {
        const helpMsg = this.messages[this.currentLanguage]?.commandsList || this.messages['en'].commandsList;
        audio.speak(helpMsg, { lang: this.getLanguageCode(this.currentLanguage) });
      } else if (this.pageRoutes[command]) {
        window.location.href = this.pageRoutes[command];
      }
    }, 500);
  }

  /**
   * Convert language code to speech synthesis language code
   */
  getLanguageCode(lang) {
    const langMap = {
      'en': 'en-US',
      'ta': 'ta-IN',
      'hi': 'hi-IN'
    };
    return langMap[lang] || 'en-US';
  }

  /**
   * Listen for voice commands manually
   */
  listenForCommands() {
    if (!audio || !audio.recognition) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    const listeningMsg = this.messages[this.currentLanguage]?.listeningPrompt || this.messages['en'].listeningPrompt;
    audio.speak(listeningMsg, { lang: this.getLanguageCode(this.currentLanguage) });

    setTimeout(() => {
      audio.recognition.start();
      console.log('🎤 Listening for commands...');
    }, 500);
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (audio && audio.recognition) {
      audio.recognition.stop();
      console.log('Stopped listening');
    }
  }
}

/**
 * Initialize VILGAX Multilingual on page load
 */
let vilgax = null;

document.addEventListener('DOMContentLoaded', () => {
  vilgax = new VilgaxMultilingual();
  window.vilgax = vilgax; // Make available globally
  console.log('✓ VILGAX Multilingual ready for voice commands');
});

// Expose functions globally for HTML onclick handlers
window.activateVilgaxListener = () => {
  if (vilgax) {
    vilgax.listenForCommands();
  }
};

window.stopVilgaxListener = () => {
  if (vilgax) {
    vilgax.stopListening();
  }
};

window.autoGreetVilgax = () => {
  if (vilgax) {
    vilgax.autoGreet();
  }
};
