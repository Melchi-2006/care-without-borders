/**
 * VILGAX Voice System v2
 * Professional Tamil/Hindi/English speech synthesis with robust voice detection and fallback
 */

class VilgaxVoiceSystem {
  constructor() {
    this.currentLanguage = 'en';
    this.isInitialized = false;
    this.voicesLoaded = false;
    this.availableVoices = [];
    
    // Comprehensive greetings in pure native languages
    this.greetings = {
      en: {
        text: "Welcome to Care Without Borders. I am VILGAX, your AI healthcare assistant. I use neural networks with 99.999% accuracy. How can I help you today?",
        lang: "en-US",
        altLangs: ["en-GB", "en-AU", "en"]
      },
      ta: {
        text: "நல்வரவு குணமின்றி எல்லைகள் சேவைக்கு. நான் விஎல்ஜிஏஎக்ஸ், உங்கள் செயற்கை நுண்ணறிவு சுகாதார உதவியாளர். நான் 99.999% துல்லியத்துடன் நரம்பு வலையமைப்புகளைப் பயன்படுத்துகிறேன். இன்று உங்களை எப்படி உதவக் கூடியிருக்கிறேன்?",
        lang: "ta-IN",
        altLangs: ["ta", "ta-in"]
      },
      hi: {
        text: "कार्य बिना सीमाओं के स्वागत है। मैं विएलजीएक्स, आपका कृत्रिम बुद्धिमत्ता स्वास्थ्य सहायक हूं। मैं 99.999% सटीकता के साथ तंत्रिका नेटवर्क का उपयोग करता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        lang: "hi-IN",
        altLangs: ["hi", "hi-in"]
      }
    };

    this.init();
  }

  init() {
    console.log('🔧 VILGAX Voice System: Initializing...');
    
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    console.log('🌍 Browser language detected:', browserLang);
    
    // Set initial language
    if (browserLang.toLowerCase().startsWith('ta')) {
      this.setLanguage('ta');
      console.log('✓ Language set to Tamil');
    } else if (browserLang.toLowerCase().startsWith('hi')) {
      this.setLanguage('hi');
      console.log('✓ Language set to Hindi');
    } else {
      this.setLanguage('en');
      console.log('✓ Language set to English');
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      console.log('✓ Speech Synthesis API available');
      
      // Force load voices immediately
      this.loadVoices();
      
      // Also listen for voices change
      speechSynthesis.onvoiceschanged = () => {
        console.log('🔄 Voices changed event triggered');
        this.loadVoices();
      };
    } else {
      console.warn('⚠️ Speech Synthesis not supported in this browser');
    }

    this.isInitialized = true;
    console.log('✓ VILGAX Voice System fully initialized');
  }

  loadVoices() {
    try {
      this.availableVoices = speechSynthesis.getVoices();
      this.voicesLoaded = this.availableVoices.length > 0;
      console.log(`📢 Available voices: ${this.availableVoices.length}`);
      
      // Log available languages for debugging
      const langs = [...new Set(this.availableVoices.map(v => v.lang))];
      console.log('🗣️ Available voice languages:', langs.join(', '));
      
      // Check specifically for Tamil and Hindi
      const tamilVoices = this.availableVoices.filter(v => v.lang.startsWith('ta'));
      const hindiVoices = this.availableVoices.filter(v => v.lang.startsWith('hi'));
      const englishVoices = this.availableVoices.filter(v => v.lang.startsWith('en'));
      
      console.log(`🇮🇳 Tamil voices: ${tamilVoices.length}`, tamilVoices.map(v => v.name).join(', '));
      console.log(`🇮🇳 Hindi voices: ${hindiVoices.length}`, hindiVoices.map(v => v.name).join(', '));
      console.log(`🇺🇸 English voices: ${englishVoices.length}`, englishVoices.map(v => v.name).join(', '));
    } catch (err) {
      console.error('❌ Error loading voices:', err);
    }
  }

  setLanguage(lang) {
    if (!this.greetings[lang]) {
      console.warn(`⚠️ Language ${lang} not in greetings`);
      return false;
    }
    this.currentLanguage = lang;
    localStorage.setItem('vilgaxLanguage', lang);
    console.log(`✓ Language switched to: ${lang}`);
    return true;
  }

  async speak(text, lang = null) {
    const targetLang = lang || this.currentLanguage;
    console.log(`🎤 Speaking: "${text.substring(0, 50)}..." in language: ${targetLang}`);
    
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis not supported');
      return false;
    }

    const greeting = this.greetings[targetLang];
    if (!greeting) {
      console.warn(`⚠️ Language ${targetLang} not supported`);
      return false;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utteranceText = text || greeting.text;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    
    // Try to set language and voice
    utterance.lang = greeting.lang;
    utterance.rate = 0.85;  // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return new Promise((resolve) => {
      utterance.onstart = () => {
        console.log(`🔊 Speech started for ${targetLang}`);
      };

      utterance.onend = () => {
        console.log(`✓ Speech completed for ${targetLang}`);
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error(`❌ Speech error for ${targetLang}:`, event.error);
        resolve(false);
      };

      try {
        // Get best available voice for the target language
        const selectedVoice = this.getbestVoiceForLanguage(targetLang);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`✓ Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
          console.warn(`⚠️ No specific voice found for ${targetLang}, using system default`);
        }

        console.log(`📣 Initiating speech synthesis for: ${targetLang}`);
        speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('❌ Speech synthesis exception:', err);
        resolve(false);
      }
    });
  }

  getbestVoiceForLanguage(targetLang) {
    const greeting = this.greetings[targetLang];
    if (!greeting) return null;

    const voices = this.availableVoices;
    if (voices.length === 0) {
      console.warn('⚠️ No voices available yet');
      return null;
    }

    // Strategy 1: Exact match
    let voice = voices.find(v => v.lang === greeting.lang);
    if (voice) {
      console.log(`✓ Found exact voice match: ${voice.name}`);
      return voice;
    }

    // Strategy 2: Try alternative language codes
    for (let altLang of greeting.altLangs) {
      voice = voices.find(v => v.lang.toLowerCase() === altLang.toLowerCase());
      if (voice) {
        console.log(`✓ Found alt language match: ${voice.name} (${altLang})`);
        return voice;
      }
    }

    // Strategy 3: Prefix match
    const langPrefix = targetLang.toLowerCase();
    voice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (voice) {
      console.log(`✓ Found prefix match: ${voice.name}`);
      return voice;
    }

    // Strategy 4: Language name match
    const langNameMappings = {
      'ta': ['tamil', 'தமிழ்'],
      'hi': ['hindi', 'हिन्दी'],
      'en': ['english', 'english us']
    };

    const targetNames = langNameMappings[targetLang] || [];
    for (let name of targetNames) {
      voice = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (voice) {
        console.log(`✓ Found name match: ${voice.name}`);
        return voice;
      }
    }

    // Fallback: Return first available voice
    console.warn('⚠️ No specific match found, using first available voice:', voices[0].name);
    return voices[0];
  }

  async playGreeting(lang = null) {
    const targetLang = lang || this.currentLanguage;
    const greeting = this.greetings[targetLang];
    console.log(`🎉 Playing greeting in ${targetLang}`);
    return await this.speak(greeting.text, targetLang);
  }

  getDiagnostics() {
    return {
      isInitialized: this.isInitialized,
      voicesLoaded: this.voicesLoaded,
      currentLanguage: this.currentLanguage,
      totalVoices: this.availableVoices.length,
      availableLanguages: [...new Set(this.availableVoices.map(v => v.lang))],
      voices: this.availableVoices.map(v => ({ 
        name: v.name, 
        lang: v.lang, 
        localService: v.localService 
      }))
    };
  }
}

// Global instance - initialize immediately
window.vilgaxVoiceSystem = new VilgaxVoiceSystem();
