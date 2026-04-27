/**
 * VILGAX Voice System
 * Professional Tamil/Hindi/English speech synthesis with proper language detection
 */

class VilgaxVoiceSystem {
  constructor() {
    this.currentLanguage = 'en';
    this.isInitialized = false;
    this.voicesLoaded = false;
    this.greetings = {
      en: {
        text: "Welcome to Care Without Borders. I am VILGAX, your AI healthcare assistant. How can I help you today?",
        lang: "en-US"
      },
      ta: {
        // Pure Tamil greeting - no English words
        text: "நல்வரவு குணமின்றி எல்லைகள் சேவைக்கு. நான் விஎல்ஜிஏஎக்ஸ், உங்கள் செயற்கை நுண்ணறிவு சுகாதார உதவியாளர். இன்று உங்களை எப்படி உதவக் கூடியிருக்கிறேன்?",
        lang: "ta-IN"
      },
      hi: {
        // Pure Hindi greeting - no English words
        text: "कार्य बिना सीमाओं के स्वागत है। मैं विएलजीएक्स, आपका कृत्रिम बुद्धिमत्ता स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        lang: "hi-IN"
      }
    };

    this.init();
  }

  init() {
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    if (browserLang.startsWith('ta')) {
      this.setLanguage('ta');
    } else if (browserLang.startsWith('hi')) {
      this.setLanguage('hi');
    } else {
      this.setLanguage('en');
    }

    // Load voices when available
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
        console.log('✓ VILGAX: Voices loaded');
      };
      // Force load voices
      speechSynthesis.getVoices();
    }

    this.isInitialized = true;
    console.log('✓ VILGAX Voice System initialized with language:', this.currentLanguage);
  }

  setLanguage(lang) {
    if (!this.greetings[lang]) return;
    this.currentLanguage = lang;
    localStorage.setItem('vilgaxLanguage', lang);
  }

  async speak(text, lang = null) {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis not supported');
      return false;
    }

    const targetLang = lang || this.currentLanguage;
    const greeting = this.greetings[targetLang];

    if (!greeting) {
      console.warn(`⚠️ Language ${targetLang} not supported`);
      return false;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text || greeting.text);
    utterance.lang = greeting.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return new Promise((resolve) => {
      utterance.onend = () => resolve(true);
      utterance.onerror = (err) => {
        console.warn('⚠️ Speech synthesis error:', err);
        resolve(false);
      };

      try {
        // Get best available voice
        const voices = speechSynthesis.getVoices();
        const selectedVoice = this.getbestVoiceForLanguage(voices, greeting.lang, targetLang);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`🔊 VILGAX speaking in ${targetLang} using voice: ${selectedVoice.name}`);
        }

        speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('⚠️ Speech synthesis exception:', err);
        resolve(false);
      }
    });
  }

  getbestVoiceForLanguage(voices, langCode, langShort) {
    // First: Try exact language code
    let voice = voices.find(v => v.lang === langCode);
    if (voice) return voice;

    // Second: Try language prefix
    voice = voices.find(v => v.lang.startsWith(langShort));
    if (voice) return voice;

    // Third: Try to find by language name
    const langNames = {
      'ta': ['Tamil', 'தமிழ்'],
      'hi': ['Hindi', 'हिन्दी'],
      'en': ['English', 'English US']
    };

    const names = langNames[langShort] || [];
    for (let name of names) {
      voice = voices.find(v => v.name.includes(name) || v.lang.includes(langShort));
      if (voice) return voice;
    }

    // Fallback: Use first voice
    return voices[0];
  }

  async playGreeting(lang = null) {
    const targetLang = lang || this.currentLanguage;
    const greeting = this.greetings[targetLang];
    return await this.speak(greeting.text, targetLang);
  }

  // Utility: Get diagnostics
  getDiagnostics() {
    const voices = speechSynthesis.getVoices();
    return {
      isInitialized: this.isInitialized,
      voicesLoaded: this.voicesLoaded,
      currentLanguage: this.currentLanguage,
      totalVoices: voices.length,
      availableLanguages: [...new Set(voices.map(v => v.lang))],
      voices: voices.map(v => ({ name: v.name, lang: v.lang, localService: v.localService }))
    };
  }
}

// Global instance
window.vilgaxVoiceSystem = new VilgaxVoiceSystem();
