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
   * Creates a dropdown menu for language selection
   */
  addLanguageSwitcher() {
    // Check if switcher already exists
    if (document.getElementById('language-switcher')) {
      return;
    }

    // Try to find navbar or header
    const navbar = document.querySelector('.navbar') || document.querySelector('nav') || document.body;

    // Create switcher container
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <style>
        .language-switcher {
          position: relative;
          display: inline-block;
          margin-left: auto;
          padding: 0 1rem;
        }

        .language-switcher select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          color: #1f2937;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .language-switcher select:hover {
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
        }

        .language-switcher select:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
        }
      </style>
      <select id="language-select" title="Select Language">
      </select>
    `;

    // Add to navbar or body
    if (navbar.querySelector('.nav-buttons')) {
      navbar.querySelector('.nav-buttons').appendChild(switcher);
    } else {
      navbar.appendChild(switcher);
    }

    // Populate language options
    const select = document.getElementById('language-select');
    for (const [code, name] of Object.entries(this.languageNames)) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      option.selected = code === this.currentLanguage;
      select.appendChild(option);
    }

    // Add change event listener
    select.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });
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
