/**
 * VILGAX Voice - Asian English/Tanglish/Hindi Speaking Assistant
 * Male Asian English voice with calm, composed, proper Tanglish and Hindi
 * Not American or British accent - Asian style communication
 */

class VILGAXVoiceAsian {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentLanguage = 'en';
    this.isSpeaking = false;
    this.voiceIndex = 0;
    this.init();
  }

  init() {
    console.log('🤖 VILGAX Asian Voice System initializing...');
    
    // Get available voices
    const voices = this.synth.getVoices();
    if (voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        console.log('✅ VILGAX Voices loaded');
      };
    }
  }

  /**
   * Speak text in Asian English/Tanglish/Hindi style
   */
  speak(text, language = 'en') {
    if (this.isSpeak) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties for Asian style
    utterance.lang = this.getLanguageCode(language);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 0.9; // Slightly lower pitch for male voice
    utterance.volume = 1.0;

    // Select appropriate voice
    const voices = this.synth.getVoices();
    const selectedVoice = this.selectAsianVoice(voices, language);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    this.isSpeak = true;
    this.synth.speak(utterance);

    utterance.onend = () => {
      this.isSpeak = false;
    };

    return utterance;
  }

  /**
   * Get language code for speech synthesis
   */
  getLanguageCode(language) {
    const codes = {
      'en': 'en-IN', // Indian English accent
      'ta': 'ta-IN', // Tamil
      'hi': 'hi-IN'  // Hindi
    };
    return codes[language] || 'en-IN';
  }

  /**
   * Select best voice for Asian accent
   */
  selectAsianVoice(voices, language) {
    // Preference order for Asian voices
    const voicePreferences = {
      'en-IN': ['Google UK English Male', 'Microsoft Heera - Hindi', 'Google हिन्दी'],
      'ta-IN': ['Google தமிழ்', 'Tamil'],
      'hi-IN': ['Google हिन्दी', 'Heera', 'Hindi']
    };

    const langCode = this.getLanguageCode(language);
    const preferences = voicePreferences[langCode] || [];

    // First try preferred voices
    for (let pref of preferences) {
      const voice = voices.find(v => v.name.includes(pref));
      if (voice) return voice;
    }

    // Fallback to any voice matching language
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voice) return voice;

    // Ultimate fallback - first available voice
    return voices.length > 0 ? voices[0] : null;
  }

  /**
   * Stop speaking
   */
  stop() {
    this.synth.cancel();
    this.isSpeak = false;
  }

  /**
   * Get Asian English greeting variations
   */
  getAsianGreeting(language) {
    const greetings = {
      en: [
        "Namaste! Welcome to Care Without Borders, sir/madam.",
        "Hello there, friend. I am VILGAX, your health companion, no?",
        "Vanakkam! Welcome welcome. How can I be helping you today?",
        "Salam! I am very much happy to assist you with your health needs."
      ],
      ta: [
        "வணக்கம்! Care Without Borders க்கு உங்களை வரவேற்கிறோம், சார்.",
        "வாழ்க! நான் உங்கள் உடல்நலக் உதவியாளி VILGAX.",
        "ஆயுஷ்மான் பவ! இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?"
      ],
      hi: [
        "नमस्ते! Care Without Borders में आपका स्वागत है, जी।",
        "हेलो दोस्त! मैं VILGAX हूं, आपका स्वास्थ्य सहायक।",
        "आप कैसे हैं? आज मैं आपकी कितनी सहायता कर सकता हूं?"
      ]
    };

    const options = greetings[language] || greetings.en;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get Asian English task confirmations
   */
  getTaskConfirmation(task, language) {
    const confirmations = {
      en: {
        appointment: "Very good, boss! Let me help you book one appointment with our best doctors, hain?",
        symptoms: "Ah, I see. Let me check your symptoms and give you proper guidance, no?",
        medicine: "Okay fine, friend. We will search medicine for you in our complete database.",
        records: "Sure sure! Let me show your medical records only."
      },
      ta: {
        appointment: "சரி நண்பா! உங்களுக்கு ஒரு நல்ல மருத்துவரைக் கண்டுபிடிக்க இருக்கிறேன்.",
        symptoms: "அடடா! உங்கள் அறிகுறிகளை பார்த்து சரியான ஆலோசனை தர வருகிறேன்.",
        medicine: "சரிதான்! மருந்தை தேடி விடுகிறேன் என்று பார்த்துக்கொள்ளுங்கள்.",
        records: "நிச்சயமாக! உங்கள் மருத்துவ பதிவுகள் என்று காட்டி விடுகிறேன்."
      },
      hi: {
        appointment: "बिल्कुल ठीक है, भैया! मैं आपको एक बढ़िया डॉक्टर से मिलवा दूंगा।",
        symptoms: "ओहो! आपके लक्षणों को देख कर सही सलाह दे दूंगा।",
        medicine: "चल, दवा ढूंढ लेता हूं हमारे डेटाबेस से।",
        records: "जी हाँ! आपकी मेडिकल रिकॉर्ड दिखा दूंगा।"
      }
    };

    return confirmations[language]?.[task] || confirmations.en[task];
  }

  /**
   * Get Asian English thank you messages
   */
  getThankYou(language) {
    const messages = {
      en: [
        "Thank you very much for choosing Care Without Borders, sir/madam. We are honored to serve you.",
        "Shukriya! Thank you for your trust. Take care of yourself, okay?",
        "Dhanybad! You are very welcome. Get well soon, my friend."
      ],
      ta: [
        "Care Without Borders ஐத் தேர்ந்தெடுத்தமைக்கு மிக்க நன்றி, சார்.",
        "நன்றி! உங்கள் நம்பிக்கைக்கு நன்றி. குணமடைய வேண்டுதல் என்று வாழ்த்துகிறேன்.",
        "தங்களிடம் சேவை செய்வதற்கு மிக்க மகிழ்ச்சி!"
      ],
      hi: [
        "आपका धन्यवाद Care Without Borders को चुनने के लिए। हम आपकी सेवा करके गर्वित हैं।",
        "शुक्रिया! आपकी भरोसे का शुक्रिया। अपना ध्यान रखिएगा।",
        "आपकी मदद करके हमें खुशी हुई, जी।"
      ]
    };

    const options = messages[language] || messages.en;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Speak with Asian English personality
   */
  speakAsianGreeting(language = 'en') {
    const text = this.getAsianGreeting(language);
    this.speak(text, language);
  }

  speakTaskConfirmation(task, language = 'en') {
    const text = this.getTaskConfirmation(task, language);
    this.speak(text, language);
  }

  speakThankYou(language = 'en') {
    const text = this.getThankYou(language);
    this.speak(text, language);
  }

  /**
   * Speak error messages with personality
   */
  speakError(errorType, language = 'en') {
    const errors = {
      en: {
        network: "Arrey! It seems there is some problem with internet connection, sir. Please check your network.",
        timeout: "Arre, arre! The process is taking too long. Let me try again, okay?",
        notUnderstood: "I beg your pardon, boss. I could not understand you properly. Can you please repeat again, slowly?"
      },
      ta: {
        network: "சரி சரி! இணையத்தில் சிக்கல் தெரிகிறது. உங்கள் இணைப்பைக் சரிபார்க்கவும்.",
        timeout: "அடடா! இது நீண்ட நேரம் எடுக்கிறது. மீண்டும் முயற்சி செய்கிறேன்.",
        notUnderstood: "மன்னிக்கவும், ஐயா! நான் உங்களைப் புரிந்து கொள்ள முடியவில்லை. மீண்டும் சொல்லுங்கள் தயவு செய்து."
      },
      hi: {
        network: "भैया! इंटरनेट में कोई परेशानी लग रही है। कृपया अपना कनेक्शन चेक कीजिए।",
        timeout: "अरे! यह बहुत समय ले रहा है। मैं फिर से कोशिश करता हूं।",
        notUnderstood: "कृपया क्षमा करें, सर! मैं आपको सही समझ न सका। कृपया धीरे से दोबारा बोलिए।"
      }
    };

    const text = errors[language]?.[errorType] || errors.en[errorType];
    if (text) {
      this.speak(text, language);
    }
  }

  /**
   * Speak encouragement
   */
  speakEncouragement(language = 'en') {
    const encouragements = {
      en: [
        "Very good! You are doing excellent, sir/madam.",
        "Fantastic! I am very pleased with you, boss.",
        "Wonderful! Keep it up, my friend."
      ],
      ta: [
        "சபாஷ்! நீங்கள் மிகவும் நன்றாக செய்கிறீர்கள்.",
        "அபாரம்! நீங்கள் மிக மென்மையாக செய்கிறீர்கள்.",
        "ஆனந்தம்! தொடர்ந்து செய்யுங்கள்!"
      ],
      hi: [
        "वाह! आप बहुत अच्छा कर रहे हैं, भैया।",
        "शानदार! मुझे आपसे बहुत खुशी है।",
        "बढ़िया! इसी तरह चलता रहो।"
      ]
    };

    const options = encouragements[language] || encouragements.en;
    const text = options[Math.floor(Math.random() * options.length)];
    this.speak(text, language);
  }

  /**
   * Wait for user response with timeout
   */
  waitForResponse(timeoutMs = 30000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.speakError('timeout', this.currentLanguage);
        resolve(null);
      }, timeoutMs);
    });
  }

  /**
   * Health-related responses
   */
  speakHealthTip(language = 'en') {
    const tips = {
      en: [
        "Remember to drink plenty of water, sir. It is very important for your health.",
        "You must take rest, okay? Do not overwork yourself, my friend.",
        "Eat healthy food and get good sleep. This is my advice, boss."
      ],
      ta: [
        "அதிகம் நீர் குடியுங்கள், சார். இது உங்கள் ஆரோக்கியத்திற்கு மிக முக்கியம்.",
        "நீங்கள் ஓய்வு எடுக்க வேண்டும், ஐயா। உங்களை அதிக வேலை செய்ய வேண்டாம்.",
        "ஆரோக்கியமான உணவு சாப்பிடுங்கள் மற்றும் நன்றாக தூங்குங்கள்."
      ],
      hi: [
        "बहुत सारा पानी पीजिए, सर। यह आपके स्वास्थ्य के लिए बहुत जरूरी है।",
        "आपको आराम करना चाहिए। अपने आप को अधिक परिश्रम न करवाइए।",
        "स्वस्थ खाना खाइए और अच्छी नींद लीजिए।"
      ]
    };

    const options = tips[language] || tips.en;
    const text = options[Math.floor(Math.random() * options.length)];
    this.speak(text, language);
  }

  /**
   * Appointment related responses
   */
  speakAppointmentConfirmed(language = 'en', doctorName = 'Doctor') {
    const confirmations = {
      en: `Excellent! Your appointment with ${doctorName} is confirmed, sir/madam. You will receive a call at the scheduled time. Thank you very much!`,
      ta: `சரி தான்! ${doctorName} ஆய்வாளருடன் உங்கள் நியமனம் உறுதி செய்யப்பட்டுவிட்டது। நির்ধारிত நேரத்தில் நீங்கள் ஒரு அழைப்பைப் பெறுவீர்கள்.`,
      hi: `बहुत अच्छा! ${doctorName} के साथ आपकी नियुक्ति की पुष्टि हो गई है। आप निर्धारित समय पर कॉल पाएंगे।`
    };

    const text = confirmations[language] || confirmations.en;
    this.speak(text, language);
  }

  /**
   * Set current language context
   */
  setLanguage(language) {
    this.currentLanguage = language;
  }
}

// Initialize global instance
window.vilgaxVoice = new VILGAXVoiceAsian();

console.log('✅ VILGAX Asian Voice System loaded');
