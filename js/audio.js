/**
 * Comprehensive Audio System for Care Without Borders
 * Features: Text-to-Speech, Speech Recognition, Voice Commands, Audio Notifications
 * Uses: Web Speech API (Browser Native) + HTML5 Audio API
 * Languages: English, Tamil, Hindi
 */

class AudioSystem {
  constructor() {
    // Speech Synthesis Setup
    this.synth = window.speechSynthesis;
    this.isSpeaking = false;
    this.currentUtterance = null;

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.shouldKeepListening = false;  // Flag to maintain continuous listening

    // Audio Notifications
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.notificationSounds = {};

    // Language Mapping for Speech
    this.languageMap = {
      'en': 'en-US',
      'ta': 'ta-IN',
      'hi': 'hi-IN'
    };

    // Voice Command Callbacks
    this.voiceCommands = new Map();

    // Configuration
    this.config = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      lang: 'en-US'
    };

    this.init();
  }

  /**
   * Initialize Audio System
   */
  init() {
    this.setupSpeechRecognition();
    this.setupNotificationSounds();
    this.registerDefaultVoiceCommands();
    console.log('✓ Audio System initialized');
  }

  /**
   * ==================== TEXT-TO-SPEECH ====================
   */

  /**
   * Speak text aloud
   * @param {string} text - Text to speak
   * @param {object} options - Voice options {rate, pitch, volume, lang}
   */
  speak(text, options = {}) {
    if (!text) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    // Merge options with config
    const settings = { ...this.config, ...options };

    // Create utterance
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = settings.rate;
    this.currentUtterance.pitch = settings.pitch;
    this.currentUtterance.volume = settings.volume;
    this.currentUtterance.lang = settings.lang;

    // Event listeners
    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      window.dispatchEvent(new CustomEvent('audioSpeakStart', { detail: { text } }));
      console.log('🔊 Speaking:', text.substring(0, 50) + '...');
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      window.dispatchEvent(new CustomEvent('audioSpeakEnd'));
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      window.dispatchEvent(new CustomEvent('audioError', { detail: { error: event.error } }));
    };

    // Speak
    this.synth.speak(this.currentUtterance);
  }

  /**
   * Speak translated text (integrates with i18n system)
   * @param {string} key - Translation key
   * @param {object} options - Voice options
   */
  speakTranslation(key, options = {}) {
    if (typeof i18n === 'undefined') {
      console.warn('i18n system not loaded');
      return;
    }

    const text = i18n.t(key);
    const lang = this.languageMap[i18n.getLanguage()] || 'en-US';

    this.speak(text, { ...options, lang });
  }

  /**
   * Stop speaking
   */
  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  /**
   * ==================== SPEECH-TO-TEXT ====================
   */

  /**
   * Setup Speech Recognition
   */
  setupSpeechRecognition() {
    this.recognition.continuous = true;  // Keep listening for multiple commands
    this.recognition.interimResults = true;
    this.recognition.lang = this.languageMap['en'];

    this.recognition.onstart = () => {
      this.isListening = true;
      window.dispatchEvent(new CustomEvent('audioListeningStart'));
      console.log('🎤 Listening...');
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Dispatch interim results
      if (interimTranscript) {
        window.dispatchEvent(new CustomEvent('audioInterimResult', {
          detail: { transcript: interimTranscript }
        }));
      }

      // Dispatch final results
      if (finalTranscript) {
        window.dispatchEvent(new CustomEvent('audioFinalResult', {
          detail: { transcript: finalTranscript }
        }));

        // Check for voice commands
        this.processVoiceCommand(finalTranscript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      window.dispatchEvent(new CustomEvent('audioListeningEnd'));
      // Auto-restart listening if it was intentionally active
      if (this.shouldKeepListening) {
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (e) {
            console.log('Cannot restart recognition:', e);
          }
        }, 100);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      window.dispatchEvent(new CustomEvent('audioError', {
        detail: { error: event.error }
      }));
    };
  }

  /**
   * Start listening for voice input
   * @param {string} lang - Language code (en, ta, hi)
   */
  listen(lang = 'en') {
    this.recognition.lang = this.languageMap[lang] || 'en-US';
    this.shouldKeepListening = true;  // Flag to keep listening active
    try {
      this.recognition.start();
    } catch (e) {
      console.log('Already listening or recognition error:', e);
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    this.shouldKeepListening = false;  // Stop auto-restart
    try {
      this.recognition.stop();
    } catch (e) {
      console.log('Already stopped or recognition error:', e);
    }
  }

  /**
   * ==================== VOICE COMMANDS ====================
   */

  /**
   * Register voice command
   * @param {string} command - Command to listen for (case-insensitive)
   * @param {function} callback - Function to execute
   */
  registerCommand(command, callback) {
    this.voiceCommands.set(command.toLowerCase(), callback);
  }

  /**
   * Register default voice commands
   */
  registerDefaultVoiceCommands() {
    const commands = {
      'book appointment': () => this.navigateTo('appointment'),
      'open chatbot': () => this.navigateTo('chatbot'),
      'find medicine': () => this.navigateTo('medicine'),
      'my prescriptions': () => this.navigateTo('prescriptions'),
      'medical records': () => this.navigateTo('records'),
      'doctor list': () => this.navigateTo('doctors'),
      'help': () => this.speakTranslation('messages.help'),
      'stop': () => this.stop(),
      'mute': () => this.setVolume(0),
      'unmute': () => this.setVolume(1)
    };

    for (const [cmd, fn] of Object.entries(commands)) {
      this.registerCommand(cmd, fn);
    }
  }

  /**
   * Process voice commands
   * @param {string} transcript - Spoken text
   */
  processVoiceCommand(transcript) {
    const text = transcript.toLowerCase().trim();

    // Check exact match
    if (this.voiceCommands.has(text)) {
      console.log('🎯 Command matched:', text);
      this.playSound('success');
      this.voiceCommands.get(text)();
      return;
    }

    // Check partial matches
    for (const [cmd, fn] of this.voiceCommands.entries()) {
      if (text.includes(cmd)) {
        console.log('🎯 Command matched (partial):', cmd);
        this.playSound('success');
        fn();
        return;
      }
    }

    // No match - inform user
    console.log('❌ Command not recognized:', text);
    this.playSound('error');
    this.speak(`Sorry, I didn't understand "${text}". Please try again.`);
  }

  /**
   * Navigate to app section via voice
   * @param {string} section - Section name
   */
  navigateTo(section) {
    const routes = {
      'appointment': 'patient.html#appointments',
      'chatbot': 'chatbot.html',
      'medicine': 'medicine-finder.html',
      'prescriptions': 'prescription.html',
      'records': 'medical-records.html',
      'doctors': 'doctor.html'
    };

    if (routes[section]) {
      window.location.href = routes[section];
    }
  }

  /**
   * ==================== AUDIO NOTIFICATIONS ====================
   */

  /**
   * Setup Notification Sounds (using Web Audio API)
   */
  setupNotificationSounds() {
    this.notificationSounds = {
      success: this.generateTone(392, 0.3),    // G4
      error: this.generateTone(196, 0.3),     // G3
      warning: this.generateTone(330, 0.3),   // E4
      notification: this.generateTone(523, 0.3), // C5
      appointment: this.generateTone(659, 0.5), // E5
      message: this.generateTone(587, 0.3)    // D5
    };
  }

  /**
   * Generate tone using Web Audio API
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   */
  generateTone(frequency, duration) {
    const audioContext = this.audioContext;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    return true;
  }

  /**
   * Play notification sound
   * @param {string} type - Sound type (success, error, warning, notification, appointment, message)
   */
  playSound(type = 'notification') {
    if (this.notificationSounds[type]) {
      this.generateTone(
        this.getSoundFrequency(type),
        this.getSoundDuration(type)
      );
      console.log('🔔 Sound played:', type);
    }
  }

  /**
   * Get sound frequency by type
   */
  getSoundFrequency(type) {
    const frequencies = {
      success: 392,      // G4
      error: 196,        // G3
      warning: 330,      // E4
      notification: 523, // C5
      appointment: 659,  // E5
      message: 587       // D5
    };
    return frequencies[type] || 523;
  }

  /**
   * Get sound duration by type
   */
  getSoundDuration(type) {
    const durations = {
      success: 0.3,
      error: 0.3,
      warning: 0.5,
      notification: 0.3,
      appointment: 0.5,
      message: 0.3
    };
    return durations[type] || 0.3;
  }

  /**
   * ==================== AUDIO GUIDANCE ====================
   */

  /**
   * Provide audio guidance for navigation
   * @param {string} page - Page being navigated to
   */
  audioGuidance(page) {
    const guidance = {
      'patient.html': 'Welcome to your patient dashboard. You can view appointments, medical records, and book consultations.',
      'chatbot.html': 'Open VILGAX AI health assistant. Ask me about symptoms, medicines, or health advice.',
      'medicine-finder.html': 'Search for medicines by name or composition. Get information on dosage and side effects.',
      'prescription.html': 'View your prescriptions from doctors.',
      'medical-records.html': 'Upload and manage your medical records securely.',
      'login.html': 'Enter your email and password to sign in.'
    };

    if (guidance[page]) {
      this.speak(guidance[page]);
    }
  }

  /**
   * ==================== SETTINGS & CONTROLS ====================
   */

  /**
   * Set speech rate
   * @param {number} rate - Rate (0.5 - 2.0)
   */
  setRate(rate) {
    this.config.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  /**
   * Set pitch
   * @param {number} pitch - Pitch (0.5 - 2.0)
   */
  setPitch(pitch) {
    this.config.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  /**
   * Set volume
   * @param {number} volume - Volume (0 - 1.0)
   */
  setVolume(volume) {
    this.config.volume = Math.max(0, Math.min(1.0, volume));
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.synth.getVoices();
  }

  /**
   * Set voice by index
   * @param {number} index - Voice index
   */
  setVoice(index) {
    const voices = this.getVoices();
    if (voices[index]) {
      this.currentVoice = voices[index];
    }
  }

  /**
   * ==================== ACCESSIBILITY ====================
   */

  /**
   * Read page element aloud
   * @param {string} selector - CSS selector or element
   */
  readElement(selector) {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (element) {
      this.speak(element.textContent);
    }
  }

  /**
   * Enable accessibility mode (read aloud on focus)
   */
  enableAccessibilityMode() {
    // Interactive elements that should be read on focus
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        this.readElement(e.target);
      }
    }, true);

    console.log('✓ Accessibility mode enabled');
  }

  /**
   * ==================== UTILITY ====================
   */

  /**
   * Get system status
   */
  getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      currentLang: this.config.lang,
      rate: this.config.rate,
      pitch: this.config.pitch,
      volume: this.config.volume,
      isSupported: this.isSupported()
    };
  }

  /**
   * Check browser support
   */
  isSupported() {
    return {
      speechSynthesis: !!this.synth,
      speechRecognition: !!this.recognition,
      audioContext: !!this.audioContext
    };
  }
}

/**
 * Initialize Audio System Globally
 */
const audio = new AudioSystem();

// Wait for i18n to be ready before syncing
window.addEventListener('i18nReady', () => {
  console.log('✓ Audio system synced with i18n');
});

// Log initialization
console.log('✓ Audio.js loaded and ready');
