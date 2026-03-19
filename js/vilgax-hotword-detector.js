/**
 * VILGAX Hotword Detection Engine
 * Always-on voice activation using "Hey VILGAX"
 * 
 * Features:
 * - Continuous listening in background
 * - Hotword pattern matching
 * - Low-power listening mode
 * - Multiple activation phrases
 * - Language-specific hotword detection
 */

class VILGAXHotwordDetector {
  constructor() {
    this.hotwords = {
      'en': ['hey vilgax', 'hey vilmax', 'okay vilgax', 'vilgax'],
      'hi': ['हे विलगैक्स', 'विलगैक्स'],
      'ta': ['ஹே விள்கேக்ஸ்', 'விள்கேக்ஸ்']
    };
    
    this.isListening = false;
    this.currentLanguage = i18n?.getLanguage() || 'en';
    this.confidenceThreshold = 0.7;
    this.isProcessing = false;
    
    this.init();
  }

  /**
   * Initialize Hotword Detection
   */
  init() {
    console.log('🎤 VILGAX Hotword Detector initializing...');
    
    // Setup language change listener
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      console.log(`🌍 Hotword detector switched to: ${this.currentLanguage}`);
    });

    // Start background listening after page load
    window.addEventListener('load', () => {
      setTimeout(() => this.startHotwordDetection(), 2000);
    });

    console.log('✅ Hotword detector ready');
  }

  /**
   * Start Hotword Detection (Continuous Listening)
   */
  startHotwordDetection() {
    if (!audio || !audio.recognition) {
      console.warn('Speech Recognition not available for hotword detection');
      return;
    }

    console.log('🎤 Starting continuous hotword detection...');
    this.isListening = true;

    // Enable continuous listening
    audio.recognition.continuous = true;
    audio.recognition.interimResults = true;
    audio.recognition.lang = `${this.currentLanguage}-${this.currentLanguage.toUpperCase()}`;

    // Setup recognition handlers
    audio.recognition.onstart = () => {
      console.log('🎤 Hotword detection started');
    };

    audio.recognition.onresult = (event) => {
      this.processHotwordResult(event);
    };

    audio.recognition.onerror = (event) => {
      console.error('Hotword detection error:', event.error);
      // Restart detection on error
      setTimeout(() => this.restartHotwordDetection(), 1000);
    };

    audio.recognition.onend = () => {
      console.log('🎤 Hotword detection ended, restarting...');
      this.restartHotwordDetection();
    };

    // Start listening
    audio.listen(this.currentLanguage);
  }

  /**
   * Process Hotword Recognition Result
   */
  processHotwordResult(event) {
    if (this.isProcessing) return;

    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript.toLowerCase().trim();
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Check for hotword in both interim and final
    if (this.detectHotword(interimTranscript) || this.detectHotword(finalTranscript)) {
      this.activateVILGAX();
    }
  }

  /**
   * Detect Hotword in Text
   */
  detectHotword(text) {
    if (!text || text.length < 3) return false;

    const currentHotwords = this.hotwords[this.currentLanguage] || this.hotwords['en'];
    const normalizedText = this.normalizeText(text);

    for (const hotword of currentHotwords) {
      const normalizedHotword = this.normalizeText(hotword);
      
      // Fuzzy match (allows slight variations)
      if (normalizedText.includes(normalizedHotword)) {
        const similarity = this.calculateSimilarity(normalizedText, normalizedHotword);
        if (similarity >= this.confidenceThreshold) {
          console.log(`🔥 Hotword detected: "${hotword}" (${(similarity * 100).toFixed(0)}%)`);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Normalize Text for Matching
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Calculate Similarity (Simple Levenshtein)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Get Edit Distance (Levenshtein)
   */
  getEditDistance(s1, s2) {
    const costs = [];
    
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }

  /**
   * Activate VILGAX on Hotword Detection
   */
  activateVILGAX() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('🚀 VILGAX hotword activation triggered!');

    if (vilgax) {
      // Stop continuous listening
      if (audio?.stopListening) {
        audio.stopListening();
      }

      // Pause hotword detection temporarily
      this.isListening = false;

      // Open VILGAX panel
      vilgax.container.classList.add('active');
      vilgax.avatar.classList.add('active');

      // Play activation sound
      audio?.playSound('notification');

      // Show notification
      vilgax.respond('🔥 VILGAX Activated! Listening...');
      audio?.speak('VILGAX activated. How can I help you?');

      // Start voice listening
      setTimeout(() => {
        vilgax.startListening();
        this.isProcessing = false;

        // Resume hotword detection after interaction ends
        setTimeout(() => {
          if (!vilgax.isListening) {
            console.log('🎤 Resuming hotword detection...');
            this.restartHotwordDetection();
          }
        }, 30000); // Resume after 30 seconds of no activity
      }, 1000);
    }
  }

  /**
   * Restart Hotword Detection
   */
  restartHotwordDetection() {
    if (this.isListening && audio && audio.recognition) {
      try {
        audio.recognition.abort();
        setTimeout(() => this.startHotwordDetection(), 500);
      } catch (e) {
        console.error('Error restarting hotword detection:', e);
      }
    }
  }

  /**
   * Stop Hotword Detection
   */
  stopHotwordDetection() {
    console.log('🛑 Stopping hotword detection');
    this.isListening = false;
    if (audio?.stopListening) {
      audio.stopListening();
    }
  }

  /**
   * Resume Hotword Detection
   */
  resumeHotwordDetection() {
    console.log('▶️ Resuming hotword detection');
    this.startHotwordDetection();
  }

  /**
   * Set Confidence Threshold (0-1)
   */
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`🎯 Hotword confidence threshold: ${(this.confidenceThreshold * 100).toFixed(0)}%`);
  }

  /**
   * Add Custom Hotword
   */
  addCustomHotword(language, phrase) {
    if (!this.hotwords[language]) {
      this.hotwords[language] = [];
    }
    this.hotwords[language].push(phrase.toLowerCase());
    console.log(`➕ Added custom hotword: "${phrase}" for ${language}`);
  }

  /**
   * Get Status
   */
  getStatus() {
    return {
      isListening: this.isListening,
      currentLanguage: this.currentLanguage,
      confidenceThreshold: this.confidenceThreshold,
      hotwordsCount: Object.keys(this.hotwords).length
    };
  }
}

// Global instance
let vilgaxHotwordDetector;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgaxHotwordDetector = new VILGAXHotwordDetector();
  });
} else {
  vilgaxHotwordDetector = new VILGAXHotwordDetector();
}

// Expose globally
window.VILGAXHotwordDetector = VILGAXHotwordDetector;
window.vilgaxHotwordDetector = vilgaxHotwordDetector;
