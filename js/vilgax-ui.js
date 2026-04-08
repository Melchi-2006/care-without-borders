/**
 * VILGAX UI Component - Advanced Voice Interface
 * Provides interactive UI for VILGAX voice commands
 */

class VilgaxUI {
  constructor() {
    this.isOpen = false;
    this.commander = window.vilgaxCommander;
    
    if (!this.commander) {
      console.error('VILGAX Commander not initialized!');
      return;
    }

    this.createUI();
    this.setupEventListeners();
    this.setupCommanderListeners();
  }

  /**
   * Create VILGAX UI Elements
   */
  createUI() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'vilgax-ui-container';
    
    // Create HTML
    this.container.innerHTML = `
      <!-- VILGAX Avatar Button -->
      <div class="vilgax-avatar-btn" id="vilgax-avatar" title="Click to open VILGAX AI">
        <div class="vilgax-avatar-icon">🤖</div>
        <div class="vilgax-status-dot"></div>
      </div>

      <!-- VILGAX Panel -->
      <div class="vilgax-panel" id="vilgax-panel">
        <!-- Header -->
        <div class="vilgax-panel-header">
          <div class="vilgax-panel-title">
            <span class="vilgax-icon">🤖</span>
            <div class="vilgax-title-text">
              <h3>VILGAX AI</h3>
              <span class="vilgax-subtitle">Your Health Assistant</span>
            </div>
          </div>
          <button class="vilgax-close-btn" id="vilgax-close">✕</button>
        </div>

        <!-- Language Selector -->
        <div class="vilgax-language-selector">
          <button class="lang-btn active" data-lang="en">🇬🇧 English</button>
          <button class="lang-btn" data-lang="hi">🇮🇳 हिंदी</button>
          <button class="lang-btn" data-lang="ta">🇮🇳 தமிழ்</button>
        </div>

        <!-- Transcript Display -->
        <div class="vilgax-transcript-area">
          <div class="transcript-label">Your Command:</div>
          <div class="transcript-display" id="vilgax-transcript">
            <span class="placeholder-text">Listening will appear here...</span>
          </div>
        </div>

        <!-- Voice Response Display -->
        <div class="vilgax-response-area">
          <div class="response-label">VILGAX Response:</div>
          <div class="response-display" id="vilgax-response">
            <span class="placeholder-text">VILGAX will respond here...</span>
          </div>
        </div>

        <!-- Microphone Button -->
        <button class="vilgax-mic-btn" id="vilgax-mic-btn">
          <span class="mic-icon">🎤</span>
          <span class="mic-text">Start Listening</span>
        </button>

        <!-- Command Buttons Grid -->
        <div class="vilgax-quick-commands">
          <button class="quick-cmd-btn" data-command="appointment">
            <span class="cmd-icon">📅</span>
            <span class="cmd-text">Book Appointment</span>
          </button>
          <button class="quick-cmd-btn" data-command="medicines">
            <span class="cmd-icon">💊</span>
            <span class="cmd-text">Find Medicine</span>
          </button>
          <button class="quick-cmd-btn" data-command="medical_records">
            <span class="cmd-icon">📋</span>
            <span class="cmd-text">My Records</span>
          </button>
          <button class="quick-cmd-btn" data-command="video_consultation">
            <span class="cmd-icon">📞</span>
            <span class="cmd-text">Video Call</span>
          </button>
          <button class="quick-cmd-btn" data-command="prescriptions">
            <span class="cmd-icon">📝</span>
            <span class="cmd-text">Prescriptions</span>
          </button>
          <button class="quick-cmd-btn" data-command="help">
            <span class="cmd-icon">❓</span>
            <span class="cmd-text">Help</span>
          </button>
        </div>

        <!-- Status Bar -->
        <div class="vilgax-status-bar">
          <div class="status-indicator" id="vilgax-status-indicator">
            <span class="status-light"></span>
            <span class="status-text" id="vilgax-status-text">Ready</span>
          </div>
          <div class="command-count">
            Commands: <span id="vilgax-cmd-count">0</span>
          </div>
        </div>

        <!-- Help Text -->
        <div class="vilgax-help-text">
          <p>💡 Say any command or click the buttons above. VILGAX supports English, Tamil, and Hindi!</p>
        </div>
      </div>

      <!-- Styles -->
      <style>
        #vilgax-ui-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        /* Avatar Button */
        .vilgax-avatar-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          z-index: 9998;
          animation: vilgax-float 3s ease-in-out infinite;
        }

        .vilgax-avatar-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
        }

        .vilgax-avatar-btn.listening {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          animation: vilgax-pulse-listening 0.6s ease-in-out infinite;
        }

        @keyframes vilgax-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes vilgax-pulse-listening {
          0%, 100% { box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4); }
          50% { box-shadow: 0 6px 30px rgba(245, 87, 108, 0.7); }
        }

        .vilgax-avatar-icon {
          font-size: 40px;
          animation: vilgax-icon-float 2s ease-in-out infinite;
        }

        @keyframes vilgax-icon-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .vilgax-status-dot {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 12px;
          height: 12px;
          background: #4ade80;
          border-radius: 50%;
          border: 2px solid white;
          animation: vilgax-dot-pulse 2s ease-in-out infinite;
        }

        @keyframes vilgax-dot-pulse {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(74, 222, 128, 0.6);
          }
          50% { 
            box-shadow: 0 0 10px rgba(74, 222, 128, 1);
          }
        }

        /* Panel */
        .vilgax-panel {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 420px;
          max-width: 90vw;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(102, 126, 234, 0.3);
          padding: 20px;
          display: none;
          z-index: 9999;
          max-height: 85vh;
          overflow-y: auto;
          animation: vilgax-slide-up 0.4s ease;
          color: #e2e8f0;
        }

        .vilgax-panel.open {
          display: block;
        }

        @keyframes vilgax-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .vilgax-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(102, 126, 234, 0.3);
        }

        .vilgax-panel-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vilgax-icon {
          font-size: 32px;
        }

        .vilgax-title-text h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .vilgax-subtitle {
          font-size: 12px;
          color: #94a3b8;
        }

        .vilgax-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          transition: color 0.2s ease;
        }

        .vilgax-close-btn:hover {
          color: #e2e8f0;
        }

        /* Language Selector */
        .vilgax-language-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
          justify-content: center;
        }

        .lang-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: #94a3b8;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .lang-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          color: #e2e8f0;
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        /* Transcript Display */
        .vilgax-transcript-area,
        .vilgax-response-area {
          margin-bottom: 15px;
        }

        .transcript-label,
        .response-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .transcript-display,
        .response-display {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          padding: 12px;
          min-height: 50px;
          font-size: 13px;
          line-height: 1.6;
          word-wrap: break-word;
          color: #e2e8f0;
        }

        .placeholder-text {
          color: #64748b;
          font-style: italic;
        }

        .interim-text {
          color: #94a3b8;
          font-style: italic;
        }

        .final-text {
          color: #667eea;
          font-weight: 500;
        }

        .response-text {
          color: #4ade80;
          font-weight: 500;
        }

        /* Microphone Button */
        .vilgax-mic-btn {
          width: 100%;
          background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
          border: 2px solid #14b8a6;
          color: white;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-bottom: 15px;
        }

        .vilgax-mic-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(20, 184, 166, 0.3);
        }

        .vilgax-mic-btn.active {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: #ef4444;
          animation: vilgax-pulse-btn 0.6s ease-in-out infinite;
        }

        @keyframes vilgax-pulse-btn {
          0%, 100% { 
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
          }
          50% { 
            box-shadow: 0 8px 30px rgba(239, 68, 68, 0.7);
          }
        }

        .mic-icon {
          font-size: 18px;
        }

        /* Quick Commands */
        .vilgax-quick-commands {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 15px;
        }

        .quick-cmd-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          color: #e2e8f0;
          padding: 10px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .quick-cmd-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        .cmd-icon {
          font-size: 20px;
        }

        .cmd-text {
          font-weight: 500;
        }

        /* Status Bar */
        .vilgax-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.1);
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 10px;
          color: #94a3b8;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-light {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: vilgax-status-pulse 1.5s ease-in-out infinite;
        }

        @keyframes vilgax-status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          font-weight: 600;
        }

        /* Help Text */
        .vilgax-help-text {
          background: rgba(79, 172, 254, 0.05);
          border-left: 3px solid #4facfe;
          border-radius: 6px;
          padding: 10px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .vilgax-help-text p {
          margin: 0;
        }

        /* Scrollbar styling */
        .vilgax-panel::-webkit-scrollbar {
          width: 6px;
        }

        .vilgax-panel::-webkit-scrollbar-track {
          background: rgba(102, 126, 234, 0.1);
          border-radius: 3px;
        }

        .vilgax-panel::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 3px;
        }

        .vilgax-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.5);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .vilgax-panel {
            width: 95vw;
            bottom: 90px;
            right: 2.5vw;
          }

          .vilgax-quick-commands {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;

    document.body.appendChild(this.container);

    // Cache elements
    this.avatar = document.getElementById('vilgax-avatar');
    this.panel = document.getElementById('vilgax-panel');
    this.closeBtn = document.getElementById('vilgax-close');
    this.micBtn = document.getElementById('vilgax-mic-btn');
    this.transcriptDisplay = document.getElementById('vilgax-transcript');
    this.responseDisplay = document.getElementById('vilgax-response');
    this.statusText = document.getElementById('vilgax-status-text');
    this.cmdCount = document.getElementById('vilgax-cmd-count');
  }

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    // Avatar click
    this.avatar.addEventListener('click', () => this.togglePanel());

    // Close button
    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePanel();
    });

    // Microphone button
    this.micBtn.addEventListener('click', () => this.toggleListening());

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const lang = e.target.dataset.lang;
        localStorage.setItem('language', lang);
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        this.commander.currentLanguage = lang;
      });
    });

    // Quick command buttons
    document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.simulateCommand(btn.dataset.command);
      });
    });
  }

  /**
   * Setup Commander Listeners
   */
  setupCommanderListeners() {
    window.addEventListener('vilgax-listening-start', () => {
      this.avatar.classList.add('listening');
      this.micBtn.classList.add('active');
      this.statusText.textContent = 'Listening...';
      this.transcriptDisplay.innerHTML = '<span class="placeholder-text">Listening for your command...</span>';
    });

    window.addEventListener('vilgax-interim-result', (e) => {
      this.transcriptDisplay.innerHTML = `<span class="interim-text">${e.detail.transcript}</span>`;
    });

    window.addEventListener('vilgax-final-result', (e) => {
      this.transcriptDisplay.innerHTML = `<span class="final-text">${e.detail.transcript}</span>`;
    });

    window.addEventListener('vilgax-listening-end', () => {
      this.avatar.classList.remove('listening');
      this.micBtn.classList.remove('active');
      this.statusText.textContent = 'Ready';
    });

    window.addEventListener('vilgax-command-executing', (e) => {
      this.updateCommandCount();
    });

    window.addEventListener('audioSpeakStart', (e) => {
      this.responseDisplay.innerHTML = `<span class="response-text">${e.detail.text}</span>`;
    });

    window.addEventListener('vilgax-close-panel', () => {
      this.togglePanel();
    });
  }

  /**
   * Toggle Panel
   */
  togglePanel() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.panel.classList.add('open');
    } else {
      this.panel.classList.remove('open');
      this.commander.stopListening();
    }
  }

  /**
   * Toggle Listening
   */
  toggleListening() {
    if (this.commander.isListening) {
      this.commander.stopListening();
    } else {
      this.commander.startListening();
    }
  }

  /**
   * Simulate Quick Command
   */
  simulateCommand(commandKey) {
    const commands = this.commander.commands[this.commander.currentLanguage];
    if (commands[commandKey]) {
      this.commander.executeCommand({
        key: commandKey,
        ...commands[commandKey]
      });
      
      this.transcriptDisplay.innerHTML = `<span class="final-text">${commands[commandKey].keywords[0]}</span>`;
    }
  }

  /**
   * Update Command Count
   */
  updateCommandCount() {
    const history = this.commander.getHistory();
    this.cmdCount.textContent = history.length;
  }
}

// Initialize VILGAX UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.vilgaxCommander) {
      window.vilgaxUI = new VilgaxUI();
    }
  });
} else {
  if (window.vilgaxCommander) {
    window.vilgaxUI = new VilgaxUI();
  }
}
