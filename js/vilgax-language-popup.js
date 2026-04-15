/**
 * VILGAX Language Selection Popup
 * Beautiful first-visit modal for language selection and auto-greeting
 * Shows only once per user (using localStorage)
 */

class VilgaxLanguagePopup {
  constructor() {
    this.isFirstVisit = !localStorage.getItem('vilgax_language_selected');
    this.selectedLanguage = localStorage.getItem('language') || 'en';
    this.isAudioPlaying = false;
  }

  /**
   * Show popup only on first visit
   */
  showOnFirstVisit() {
    if (!this.isFirstVisit) {
      console.log('✓ Language already selected, skipping popup');
      return;
    }

    console.log('🎤 First visit detected - showing language selection popup');
    this.createPopup();
    this.setupStyles();
    this.setupEventListeners();
  }

  /**
   * Create the popup HTML structure
   */
  createPopup() {
    const popup = document.createElement('div');
    popup.id = 'vilgax-language-popup';
    popup.className = 'vilgax-popup-overlay';
    
    popup.innerHTML = `
      <!-- Main Modal -->
      <div class="vilgax-popup-modal">
        <!-- Header with Animation -->
        <div class="vilgax-popup-header">
          <div class="vilgax-popup-emoji">🤖</div>
          <h1 class="vilgax-popup-title">Welcome to VILGAX AI</h1>
          <p class="vilgax-popup-subtitle">Your Intelligent Health Assistant</p>
        </div>

        <!-- Language Selection Section -->
        <div class="vilgax-popup-content">
          <p class="vilgax-popup-instruction">Select Your Language</p>
          
          <div class="vilgax-language-options">
            <!-- English Option -->
            <button class="language-option active" data-lang="en">
              <div class="lang-flag">🇬🇧</div>
              <div class="lang-name">English</div>
              <div class="lang-note">Clear & Simple</div>
            </button>

            <!-- Hindi Option -->
            <button class="language-option" data-lang="hi">
              <div class="lang-flag">🇮🇳</div>
              <div class="lang-name">हिंदी</div>
              <div class="lang-note">Hindi + Hinglish</div>
            </button>

            <!-- Tamil Option -->
            <button class="language-option" data-lang="ta">
              <div class="lang-flag">🇮🇳</div>
              <div class="lang-name">தமிழ்</div>
              <div class="lang-note">Tamil + Tanglish</div>
            </button>
          </div>
        </div>

        <!-- Continue Button -->
        <div class="vilgax-popup-footer">
          <button class="vilgax-continue-btn">
            <span class="btn-text">Continue & Meet VILGAX</span>
            <span class="btn-arrow">→</span>
          </button>
          <p class="vilgax-popup-note">Your language choice is saved • No signup required</p>
        </div>

        <!-- Loading Indicator -->
        <div class="vilgax-loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
  }

  /**
   * Setup all styles for the popup
   */
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Popup Overlay */
      .vilgax-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.4s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Modal */
      .vilgax-popup-modal {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        border-radius: 24px;
        padding: 40px;
        max-width: 500px;
        width: 90vw;
        max-height: 85vh;
        box-shadow: 
          0 0 0 1px rgba(102, 126, 234, 0.3),
          0 20px 100px rgba(0, 0, 0, 0.6),
          0 0 40px rgba(102, 126, 234, 0.1);
        animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow-y: auto;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Header */
      .vilgax-popup-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .vilgax-popup-emoji {
        font-size: 64px;
        margin-bottom: 16px;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .vilgax-popup-title {
        margin: 0;
        font-size: 32px;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
      }

      .vilgax-popup-subtitle {
        margin: 0;
        font-size: 14px;
        color: #94a3b8;
        font-weight: 500;
      }

      /* Content */
      .vilgax-popup-content {
        margin-bottom: 30px;
      }

      .vilgax-popup-instruction {
        text-align: center;
        color: #cbd5e1;
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 24px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Language Options */
      .vilgax-language-options {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .language-option {
        background: rgba(102, 126, 234, 0.05);
        border: 2px solid rgba(102, 126, 234, 0.2);
        border-radius: 16px;
        padding: 20px;
        min-width: 120px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #cbd5e1;
      }

      .language-option:hover {
        background: rgba(102, 126, 234, 0.15);
        border-color: rgba(102, 126, 234, 0.4);
        transform: translateY(-4px);
      }

      .language-option.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        color: white;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      }

      .lang-flag {
        font-size: 36px;
      }

      .lang-name {
        font-size: 16px;
        font-weight: 700;
      }

      .lang-note {
        font-size: 11px;
        color: #94a3b8;
        opacity: 0.8;
      }

      .language-option.active .lang-note {
        color: rgba(255, 255, 255, 0.8);
      }

      /* Footer */
      .vilgax-popup-footer {
        text-align: center;
      }

      .vilgax-continue-btn {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .vilgax-continue-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
      }

      .vilgax-continue-btn:active {
        transform: translateY(0);
      }

      .btn-arrow {
        display: inline-block;
        transition: transform 0.3s ease;
      }

      .vilgax-continue-btn:hover .btn-arrow {
        transform: translateX(4px);
      }

      .vilgax-popup-note {
        margin: 0;
        font-size: 12px;
        color: #64748b;
      }

      /* Loading Bar */
      .vilgax-loading-bar {
        margin-top: 20px;
        height: 2px;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 1px;
        overflow: hidden;
      }

      .loading-progress {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        animation: progress 3s ease-in-out forwards;
      }

      @keyframes progress {
        0% {
          width: 0%;
        }
        50% {
          width: 70%;
        }
        100% {
          width: 100%;
        }
      }

      /* Responsive */
      @media (max-width: 600px) {
        .vilgax-popup-modal {
          padding: 24px;
          margin: 0 12px;
        }

        .vilgax-popup-title {
          font-size: 24px;
        }

        .vilgax-popup-emoji {
          font-size: 48px;
        }

        .language-option {
          min-width: 100px;
          padding: 16px;
        }

        .lang-flag {
          font-size: 28px;
        }

        .lang-name {
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Setup event listeners for language selection
   */
  setupEventListeners() {
    // Language option buttons
    document.querySelectorAll('.language-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectLanguage(btn.dataset.lang);
      });
    });

    // Continue button
    document.querySelector('.vilgax-continue-btn').addEventListener('click', () => {
      this.continueAndGreet();
    });
  }

  /**
   * Handle language selection
   */
  selectLanguage(lang) {
    this.selectedLanguage = lang;
    
    // Update UI
    document.querySelectorAll('.language-option').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

    // Update system language
    localStorage.setItem('language', lang);
    
    console.log(`✓ Language selected: ${lang}`);
  }

  /**
   * Close popup and play greeting
   */
  continueAndGreet() {
    const popup = document.getElementById('vilgax-language-popup');
    
    // Add exit animation
    popup.style.animation = 'fadeOut 0.4s ease forwards';
    
    setTimeout(() => {
      popup.remove();
      
      // Mark as completed
      localStorage.setItem('vilgax_language_selected', 'true');
      
      // Trigger greeting and initialization
      this.playGreetingAndInit();
    }, 400);
  }

  /**
   * Play greeting in selected language and initialize VILGAX
   */
  playGreetingAndInit() {
    console.log(`🎙️ Playing greeting in ${this.selectedLanguage}...`);
    
    // Wait for audio system to be ready
    const checkAudio = setInterval(() => {
      if (typeof audio !== 'undefined' && audio.speak) {
        clearInterval(checkAudio);
        
        const greetings = {
          'en': "Welcome to Care Without Borders! I'm VILGAX AI, your intelligent health assistant. I can help you book appointments, find medicines, view your medical records, and more. Just tell me what you need!",
          'hi': "केयर विदाउट बॉर्डर्स में आपका स्वागत है! मैं विलगैक्स एआई, आपका बुद्धिमान स्वास्थ्य सहायक। मैं आपको डॉक्टर की नियुक्ति बुक करने, दवाएं खोजने, अपने चिकित्सा रिकॉर्ड देखने में मदद कर सकता हूं। बताइए आपको क्या चाहिए!",
          'ta': "வணக்கம்! நான் விள்கேக்ஸ், உங்களின் AI சுகாதார உதவியாளர். கேர் வித்தவுட் வோர்டர்ஸுக்கு வரவேற்கிறோம். மருத்துவர் சந்திப்பு பதிவு செய்ய, மருந்து கண்டுபிடிக்க, உங்கள் மருத்துவ பதிவுகளைக் காணக்ககூடிய எனக்கு உதவ முடியும். நீங்கள் என்ன வேண்டுமென்று சொல்லுங்கள்!"
        };

        const greeting = greetings[this.selectedLanguage] || greetings['en'];
        audio.speak(greeting, {
          lang: this.getLanguageCode(this.selectedLanguage)
        });

        // Initialize VILGAX after greeting starts
        setTimeout(() => {
          if (window.vilgaxUI) {
            console.log('✓ VILGAX UI already initialized');
          } else {
            console.log('🤖 Initializing VILGAX UI components...');
            // VILGAX UI should auto-initialize when script loads
          }
        }, 1000);
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkAudio), 5000);
  }

  /**
   * Convert language code to speech synthesis language
   */
  getLanguageCode(lang) {
    const langMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ta': 'ta-IN'
    };
    return langMap[lang] || 'en-US';
  }
}

// Add CSS animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const languagePopup = new VilgaxLanguagePopup();
  languagePopup.showOnFirstVisit();
  window.vilgaxLanguagePopup = languagePopup; // For debugging
});
