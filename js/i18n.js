/**
 * Multilingual (i18n) Utility
 * Handles language loading, translation retrieval, and language switching
 * Supports: English (en), Tamil (ta), Hindi (hi)
 */

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translations = {};
    this.defaultLanguage = 'en';
    this.supportedLanguages = ['en', 'ta', 'hi'];
    
    // Language metadata
    this.languageNames = {
      'en': 'English',
      'ta': 'Tamil (தமிழ்)',
      'hi': 'Hindi (हिन्दी)'
    };
  }

  /**
   * Initialize i18n by loading translation files
   * @async
   */
  async init() {
    try {
      // Load all supported languages
      for (const lang of this.supportedLanguages) {
        await this.loadLanguage(lang);
      }
      
      // Set the current language
      this.setLanguage(this.currentLanguage);
      
      // Update HTML lang attribute
      document.documentElement.lang = this.currentLanguage;
      
      // Add language switcher if it doesn't exist
      this.addLanguageSwitcher();
      
      // Trigger custom event for language initialization
      window.dispatchEvent(new CustomEvent('i18nReady', { 
        detail: { language: this.currentLanguage } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error initializing i18n:', error);
      return false;
    }
  }

  /**
   * Load translation file for a specific language
   * @async
   * @param {string} language - Language code (en, ta, hi)
   */
  async loadLanguage(language) {
    try {
      const response = await fetch(`translations/${language}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${language}.json: ${response.statusText}`);
      }
      
      this.translations[language] = await response.json();
      console.log(`✓ Loaded ${language} translations`);
    } catch (error) {
      console.error(`Error loading ${language} translation:`, error);
      // Fallback to English
      if (language !== 'en') {
        console.warn(`Falling back to English for ${language}`);
      }
    }
  }

  /**
   * Get translated string using dot notation path
   * @param {string} key - Translation key (e.g., 'navigation.login')
   * @param {object} params - Optional parameters for variable substitution
   * @returns {string} Translated string
   * 
   * @example
   * i18n.t('navigation.login')  // Returns "Login" or "உள்நுழைக"
   * i18n.t('messages.error')    // Returns "An error occurred"
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if not found
        value = this.getFallbackTranslation(key);
        break;
      }
    }

    // If still not found, return the key itself
    if (!value) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Replace parameters if provided
    if (params && Object.keys(params).length > 0) {
      for (const [param, paramValue] of Object.entries(params)) {
        const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
        value = value.replace(regex, paramValue);
      }
    }

    return value;
  }

  /**
   * Get fallback translation from English if current language doesn't have it
   * @private
   */
  getFallbackTranslation(key) {
    const keys = key.split('.');
    let value = this.translations['en'];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key as last resort
      }
    }

    return value || key;
  }

  /**
   * Set current language and update DOM
   * @param {string} language - Language code (en, ta, hi)
   */
  setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Language ${language} not supported. Using English.`);
      language = this.defaultLanguage;
    }

    this.currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.lang = language;

    // Update all elements with data-i18n attribute
    this.updatePageTranslations();

    // Dispatch event for reactive updates
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: this.currentLanguage } 
    }));

    console.log(`✓ Language changed to: ${this.languageNames[language]}`);
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get current language name
   * @returns {string} Current language display name
   */
  getLanguageName() {
    return this.languageNames[this.currentLanguage] || this.currentLanguage;
  }

  /**
   * Get all supported languages
   * @returns {array} Array of language codes
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Get language names for UI display
   * @returns {object} Object with language codes as keys and display names as values
   */
  getLanguageNames() {
    return this.languageNames;
  }

  /**
   * Update all DOM elements with data-i18n attribute
   * Elements can have data-i18n="key" for text content or data-i18n-attr="attr:key" for attributes
   */
  updatePageTranslations() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // Update HTML content
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      element.innerHTML = this.t(key);
    });

    // Update attributes (e.g., placeholder, title, alt)
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const attrs = element.getAttribute('data-i18n-attr');
      attrs.split(';').forEach(attr => {
        const [attrName, key] = attr.trim().split(':');
        if (attrName && key) {
          element.setAttribute(attrName, this.t(key));
        }
      });
    });
  }

  /**
   * Add a language switcher to the page
   * Creates a modern pill-style button group for language selection
   */
  addLanguageSwitcher() {
    // Check if switcher already exists
    if (document.getElementById('language-switcher')) {
      return;
    }

    // Try to find navbar or header
    const navbar = document.querySelector('.navbar') || document.querySelector('nav') || document.body;

    // Create switcher container with modern styling
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.className = 'language-switcher';
    
    // Language flags and metadata
    const langFlags = {
      'en': { flag: '🇬🇧', label: 'EN' },
      'ta': { flag: '🇮🇳', label: 'தமிழ்' },
      'hi': { flag: '🇮🇳', label: 'हिंदी' }
    };

    let buttonsHTML = `
      <style>
        .language-switcher {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-left: auto;
          padding: 0 1rem;
        }

        .language-switcher-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .language-buttons {
          display: flex;
          gap: 0.3rem;
          background: #f3f4f6;
          padding: 0.35rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .language-btn {
          padding: 0.4rem 0.75rem;
          border: 2px solid transparent;
          background: transparent;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
        }

        .language-btn:hover {
          color: #0f766e;
          background: rgba(15, 118, 110, 0.08);
          transform: scale(1.05);
        }

        .language-btn.active {
          background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
          border-color: #14b8a6;
        }

        .language-btn.active:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
        }

        .language-flag {
          font-size: 1rem;
          display: inline-block;
        }

        @media (max-width: 640px) {
          .language-switcher {
            margin-left: 0;
            margin-bottom: 0.5rem;
          }
          
          .language-switcher-label {
            display: none;
          }

          .language-btn {
            padding: 0.35rem 0.5rem;
            font-size: 0.7rem;
          }
        }
      </style>
      <span class="language-switcher-label">🌍 Language:</span>
      <div class="language-buttons">
    `;

    for (const [code, metadata] of Object.entries(langFlags)) {
      const isActive = code === this.currentLanguage ? 'active' : '';
      buttonsHTML += `
        <button class="language-btn ${isActive}" data-lang="${code}" title="${this.languageNames[code]}">
          <span class="language-flag">${metadata.flag}</span>
          <span>${metadata.label}</span>
        </button>
      `;
    }

    buttonsHTML += `</div>`;
    switcher.innerHTML = buttonsHTML;

    // Add to navbar
    if (navbar.classList.contains('navbar-content')) {
      navbar.appendChild(switcher);
    } else if (navbar.querySelector('.navbar-menu')) {
      navbar.querySelector('.navbar-menu').parentElement.appendChild(switcher);
    } else if (navbar.querySelector('.nav-buttons')) {
      navbar.querySelector('.nav-buttons').appendChild(switcher);
    } else {
      navbar.appendChild(switcher);
    }

    // Add event listeners to language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        this.setLanguage(lang);
        
        // Update active state
        document.querySelectorAll('.language-btn').forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
      });
    });

    console.log('✓ Modern language switcher added');
  }

  /**
   * Check if a translation key exists
   * @param {string} key - Translation key
   * @returns {boolean} True if key exists
   */
  hasKey(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Get entire translation object for current language
   * @returns {object} Translation object
   */
  getAllTranslations() {
    return this.translations[this.currentLanguage] || {};
  }
}

// Create global i18n instance
const i18n = new I18n();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
