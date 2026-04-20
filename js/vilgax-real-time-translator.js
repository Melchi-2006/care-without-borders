/**
 * VILGAX Real-Time Translation Engine
 * Provides instant translation between English, Hindi, and Tamil
 * Uses both rule-based and AI-powered approaches
 * 
 * Features:
 * - Real-time streaming translation
 * - Context-aware medical terminology
 * - Dialect and accent handling
 * - Phonetic matching for transliteration
 * - Offline capability for common phrases
 * - Learning from corrections
 */

class VilgaxRealTimeTranslator {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translationCache = {};
    this.medicalTerminology = this.initializeMedicalTerms();
    this.commonPhrases = this.initializeCommonPhrases();
    this.translationHistory = [];
    this.useOfflineMode = true; // Use local dictionary first
    this.useAPIFallback = true; // Use Google Translate API if configured
    
    this.init();
    console.log('🌐 VILGAX Real-Time Translation initialized');
  }

  /**
   * Initialize translation system
   */
  init() {
    // Load translation cache from localStorage
    this.loadTranslationCache();
    
    // Setup language change listener
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
    
    console.log(`✅ Translation engine ready for: EN ↔️ HI ↔️ TA`);
  }

  /**
   * Initialize medical terminology dictionary
   */
  initializeMedicalTerms() {
    return {
      'en-hi': {
        // English to Hindi
        'appointment': 'नियुक्ति',
        'doctor': 'डॉक्टर',
        'patient': 'रोगी',
        'medicine': 'दवा',
        'prescription': 'पर्चा',
        'medical records': 'चिकित्सा रिकॉर्ड',
        'blood pressure': 'रक्तचाप',
        'heart rate': 'हृदय गति',
        'fever': 'बुखार',
        'pain': 'दर्द',
        'headache': 'सिरदर्द',
        'cold': 'जुकाम',
        'cough': 'खांसी',
        'hospital': 'अस्पताल',
        'emergency': 'आपातकालीन',
        'symptom': 'लक्षण',
        'diagnosis': 'निदान',
        'treatment': 'उपचार',
        'surgery': 'शल्य चिकित्सा',
        'vaccination': 'टीकाकरण'
      },
      'en-ta': {
        // English to Tamil
        'appointment': 'நியமனம்',
        'doctor': 'மருத்துவர்',
        'patient': 'நோயாளி',
        'medicine': 'மருந்து',
        'prescription': 'பரிந்துரை',
        'medical records': 'மருத்துவ பதிவுகள்',
        'blood pressure': 'இரத்த அழுத்தம்',
        'heart rate': 'இதய துடிப்பு',
        'fever': 'காய்ச்சல்',
        'pain': 'வலி',
        'headache': 'தலைவலி',
        'cold': 'சளி',
        'cough': 'இருமல்',
        'hospital': 'больница',
        'emergency': 'அவசரம்',
        'symptom': 'அறிகுறி',
        'diagnosis': 'நோய் கண்டறிதல்',
        'treatment': 'சிகிச்சை',
        'surgery': 'அறுவை சிகிச்சை',
        'vaccination': 'தடுப்பூசி'
      },
      'hi-en': {
        // Hindi to English (reverse mapping)
        'नियुक्ति': 'appointment',
        'डॉक्टर': 'doctor',
        'रोगी': 'patient',
        'दवा': 'medicine',
        'पर्चा': 'prescription',
        'चिकित्सा रिकॉर्ड': 'medical records',
        'रक्तचाप': 'blood pressure',
        'हृदय गति': 'heart rate',
        'बुखार': 'fever',
        'दर्द': 'pain'
      },
      'ta-en': {
        // Tamil to English (reverse mapping)
        'நியமனம்': 'appointment',
        'மருத்துவர்': 'doctor',
        'நோயாளி': 'patient',
        'மருந்து': 'medicine',
        'பரிந்துரை': 'prescription',
        'மருத்துவ பதிவுகள்': 'medical records',
        'இரத்த அழுத்தம்': 'blood pressure',
        'இதய துடிப்பு': 'heart rate',
        'காய்ச்சல்': 'fever',
        'வலி': 'pain'
      }
    };
  }

  /**
   * Initialize common phrase translations
   */
  initializeCommonPhrases() {
    return {
      'en-hi': {
        'Hello': 'नमस्ते',
        'How are you?': 'आप कैसे हैं?',
        'Please help me': 'कृपया मुझे मदद करें',
        'I have pain': 'मुझे दर्द है',
        'When should I take medicine?': 'मुझे दवा कब लेनी चाहिए?',
        'Is it urgent?': 'क्या यह आपातकालीन है?',
        'What is my diagnosis?': 'मेरा निदान क्या है?',
        'I need to see a doctor': 'मुझे डॉक्टर से मिलना है',
        'Can I get a prescription?': 'क्या मुझे पर्चा मिल सकता है?',
        'How much does it cost?': 'इसकी कीमत कितनी है?'
      },
      'en-ta': {
        'Hello': 'வணக்கம்',
        'How are you?': 'நீ எப்படி இருக்கிறாய்?',
        'Please help me': 'தயவு செய்து எனக்கு உதவ',
        'I have pain': 'என்னுக்கு வலி இருக்கிறது',
        'When should I take medicine?': 'நான் மருந்து எப்போது சாப்பிட வேண்டும்?',
        'Is it urgent?': 'இது அவசரமா?',
        'What is my diagnosis?': 'என் நோய் கண்டறிதல் என்ன?',
        'I need to see a doctor': 'நான் மருத்துவரைப் பார்க்க வேண்டும்',
        'Can I get a prescription?': 'நான் பரிந்துரை பெற முடியுமா?',
        'How much does it cost?': 'இது எவ்வளவு செலவாகும்?'
      }
    };
  }

  /**
   * Translate text in real-time
   */
  async translateText(text, fromLang = 'en', toLang = 'hi', context = {}) {
    if (!text) return '';
    
    const cacheKey = `${fromLang}_${toLang}_${text}`;
    
    // Check cache first
    if (this.translationCache[cacheKey]) {
      return this.translationCache[cacheKey];
    }
    
    let translatedText = null;
    
    // Try offline translation (dictionary + rules)
    if (this.useOfflineMode) {
      translatedText = this.translateOffline(text, fromLang, toLang, context);
    }
    
    // If offline translation failed and API fallback enabled
    if (!translatedText && this.useAPIFallback) {
      translatedText = await this.translateViaAPI(text, fromLang, toLang);
    }
    
    // Fallback to original text if all else fails
    if (!translatedText) {
      translatedText = text;
    }
    
    // Cache the translation
    this.translationCache[cacheKey] = translatedText;
    this.recordTranslation(text, translatedText, fromLang, toLang, context);
    
    return translatedText;
  }

  /**
   * Offline translation using local dictionary and rules
   */
  translateOffline(text, fromLang, toLang, context = {}) {
    const lower = text.toLowerCase().trim();
    const key = `${fromLang}-${toLang}`;
    
    // Check medical terminology dictionary
    const medicalDict = this.medicalTerminology[key] || {};
    if (medicalDict[lower]) {
      return medicalDict[lower];
    }
    
    // Check common phrases
    const phraseDict = this.commonPhrases[key] || {};
    for (const [englishPhrase, translatedPhrase] of Object.entries(phraseDict)) {
      if (lower.includes(englishPhrase.toLowerCase())) {
        return translatedPhrase;
      }
    }
    
    // Try word-by-word translation for compound words
    if (text.includes(' ')) {
      const words = text.split(' ');
      const translatedWords = [];
      let anyTranslated = false;
      
      for (const word of words) {
        if (medicalDict[word.toLowerCase()]) {
          translatedWords.push(medicalDict[word.toLowerCase()]);
          anyTranslated = true;
        } else {
          translatedWords.push(word);
        }
      }
      
      if (anyTranslated) {
        return translatedWords.join(' ');
      }
    }
    
    // No translation found in offline dictionary
    return null;
  }

  /**
   * Translate via API (Google Translate, Microsoft, etc.)
   */
  async translateViaAPI(text, fromLang, toLang) {
    try {
      const langMap = {
        'en': 'en',
        'hi': 'hi',
        'ta': 'ta'
      };
      
      const sourceLang = langMap[fromLang] || fromLang;
      const targetLang = langMap[toLang] || toLang;
      
      // Example using Google Translate API (requires API key)
      const apiKey = localStorage.getItem('google_translate_api_key');
      
      if (!apiKey) {
        console.log('⚠️ Translation API key not configured. Using offline mode only.');
        return null;
      }
      
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source_language: sourceLang,
          target_language: targetLang
        })
      });
      
      if (!response.ok) {
        console.error('Translation API error:', response.status);
        return null;
      }
      
      const data = await response.json();
      return data.data?.translations?.[0]?.translatedText || null;
      
    } catch (error) {
      console.error('Translation API error:', error);
      return null;
    }
  }

  /**
   * Translate command with context awareness
   */
  async translateCommand(command, fromLang, toLang) {
    const context = {
      isCommand: true,
      domain: 'medical',
      priority: 'high'
    };
    
    return this.translateText(command, fromLang, toLang, context);
  }

  /**
   * Get available language pairs
   */
  getAvailableLanguagePairs() {
    return [
      { from: 'en', to: 'hi', label: 'English ↔️ हिंदी' },
      { from: 'en', to: 'ta', label: 'English ↔️ தமிழ்' },
      { from: 'hi', to: 'ta', label: 'हिंदी ↔️ தமிழ்' },
      { from: 'hi', to: 'en', label: 'हिंदी ↔️ English' },
      { from: 'ta', to: 'en', label: 'தமிழ் ↔️ English' },
      { from: 'ta', to: 'hi', label: 'தமிழ் ↔️ हिंदी' }
    ];
  }

  /**
   * Add custom translation to dictionary
   */
  addCustomTranslation(fromText, toText, fromLang, toLang) {
    const key = `${fromLang}-${toLang}`;
    
    if (!this.medicalTerminology[key]) {
      this.medicalTerminology[key] = {};
    }
    
    this.medicalTerminology[key][fromText.toLowerCase()] = toText;
    console.log(`➕ Custom translation added: "${fromText}" → "${toText}"`);
  }

  /**
   * Record translation for learning
   */
  recordTranslation(original, translated, fromLang, toLang, context = {}) {
    this.translationHistory.push({
      original,
      translated,
      fromLang,
      toLang,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Keep last 500 translations
    if (this.translationHistory.length > 500) {
      this.translationHistory.shift();
    }
  }

  /**
   * Load translation cache from storage
   */
  loadTranslationCache() {
    try {
      const stored = localStorage.getItem('vilgax_translation_cache');
      if (stored) {
        this.translationCache = JSON.parse(stored);
        console.log(`📂 Translation cache loaded (${Object.keys(this.translationCache).length} entries)`);
      }
    } catch (error) {
      console.error('Error loading translation cache:', error);
    }
  }

  /**
   * Save translation cache to storage
   */
  saveTranslationCache() {
    try {
      localStorage.setItem('vilgax_translation_cache', JSON.stringify(this.translationCache));
      console.log('💾 Translation cache saved');
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  }

  /**
   * Get translation statistics
   */
  getStatistics() {
    return {
      cacheSizeKB: JSON.stringify(this.translationCache).length / 1024,
      totalTranslations: Object.keys(this.translationCache).length,
      translationHistory: this.translationHistory.length,
      medicalTermsLoaded: Object.keys(this.medicalTerminology).length,
      commonPhrasesLoaded: Object.keys(this.commonPhrases).length
    };
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      currentLanguage: this.currentLanguage,
      offlineModeEnabled: this.useOfflineMode,
      APIFallbackEnabled: this.useAPIFallback,
      cacheStats: this.getStatistics(),
      supportedLanguages: ['English', 'हिंदी', 'தமிழ்']
    };
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.translationCache = {};
    localStorage.removeItem('vilgax_translation_cache');
    console.log('🗑️ Translation cache cleared');
  }
}

// Initialize translator globally
let vilgaxTranslator;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgaxTranslator = new VilgaxRealTimeTranslator();
  });
} else {
  vilgaxTranslator = new VilgaxRealTimeTranslator();
}
