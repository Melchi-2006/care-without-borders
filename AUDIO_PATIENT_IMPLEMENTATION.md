# Audio System - Patient Dashboard Implementation Example

This document shows exactly how to integrate audio features into **patient.html** as a complete working example.

---

## Step 1: Update patient.html Head Section

Add audio.js script after i18n.js:

```html
<head>
  <!-- ... existing meta tags ... -->
  
  <!-- Multilingual Support - Load First! -->
  <script src="js/i18n.js"></script>

  <!-- Audio System -->
  <script src="js/audio.js"></script>

  <!-- ... rest of head ... -->
</head>
```

---

## Step 2: Add Audio Control Button to HTML

Add floating audio control bar (after `<body>`):

```html
<body>
  <!-- Audio Control Panel (Float) -->
  <div id="audioControls" class="audio-controls">
    <button id="readPageBtn" title="Read page content" class="audio-btn">📖 Read</button>
    <button id="micBtn" title="Voice input" class="audio-btn">🎤 Mic</button>
    <button id="stopBtn" title="Stop speaking" class="audio-btn">⏹️ Stop</button>
    <button id="settingsBtn" title="Audio settings" class="audio-btn">⚙️</button>
    
    <!-- Interim transcription display -->
    <div id="transcriptDisplay" class="transcript-display">
      <small id="interimText" style="color: #999;"></small>
      <small id="finalText" style="color: #333;"></small>
    </div>
  </div>

  <!-- Audio Settings Panel (Hidden by default) -->
  <div id="audioSettingsPanel" class="audio-settings-panel" style="display: none;">
    <h4>Audio Settings</h4>
    
    <label>
      Speed:
      <input type="range" id="rateSlider" min="0.5" max="2.0" step="0.1" value="1.0">
      <span id="rateValue">1.0x</span>
    </label>
    
    <label>
      Volume:
      <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="1.0">
      <span id="volumeValue">100%</span>
    </label>
    
    <label>
      <input type="checkbox" id="accessibilityToggle">
      Accessibility Mode (Read all buttons/links)
    </label>
    
    <button id="closeSettingsBtn">Close</button>
  </div>

  <!-- ... rest of body ... -->
</body>
```

---

## Step 3: Add CSS Styling

Add to `css/style.css` or create `css/audio-controls.css`:

```css
/* Audio Controls Float */
.audio-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 2px solid #2196F3;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 300px;
}

.audio-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.audio-btn:hover {
  background: #1976D2;
  transform: scale(1.05);
}

.audio-btn.active {
  background: #4CAF50;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.transcript-display {
  width: 100%;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  max-height: 60px;
  overflow-y: auto;
  line-height: 1.4;
}

/* Audio Settings Panel */
.audio-settings-panel {
  position: fixed;
  bottom: 350px;
  right: 20px;
  background: white;
  border: 2px solid #2196F3;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1001;
  width: 300px;
}

.audio-settings-panel label {
  display: block;
  margin: 15px 0;
  font-size: 14px;
}

.audio-settings-panel input[type="range"] {
  width: 70%;
}

.audio-settings-panel input[type="checkbox"] {
  margin-right: 8px;
}

.audio-settings-panel button {
  width: 100%;
  padding: 10px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}

/* Listening indicator */
.listening {
  animation: listening-pulse 0.5s infinite;
}

@keyframes listening-pulse {
  0% { background: #FF5722; }
  50% { background: #FF9800; }
  100% { background: #FF5722; }
}

/* Speaking indicator */
.speaking {
  animation: speaking-pulse 0.5s infinite;
}

@keyframes speaking-pulse {
  0% { background: #4CAF50; }
  50% { background: #8BC34A; }
  100% { background: #4CAF50; }
}
```

---

## Step 4: Add JavaScript Implementation

Add to end of `patient.html` before closing `</body>`:

```javascript
<script>
// Wait for audio system to initialize
window.addEventListener('audioReady', initializeAudioControls);
document.addEventListener('DOMContentLoaded', initializeAudioControls);

function initializeAudioControls() {
  // Give audio system time to initialize
  if (!window.audio) {
    setTimeout(initializeAudioControls, 100);
    return;
  }

  console.log('Audio system initialized on patient dashboard');

  // ===== Audio Button Events =====

  // Read Page Button
  document.getElementById('readPageBtn').addEventListener('click', () => {
    const mainContent = document.querySelector('main, .patient-content, .dashboard-content');
    if (mainContent) {
      audio.speak(mainContent.textContent, { rate: 0.9 });
    }
  });

  // Microphone Button (Voice Input)
  const micBtn = document.getElementById('micBtn');
  micBtn.addEventListener('click', () => {
    if (audio.isListening) {
      audio.stopListening();
      micBtn.classList.remove('active', 'listening');
    } else {
      const currentLang = i18n.getLanguage ? i18n.getLanguage() : 'en';
      audio.listen(currentLang);
      micBtn.classList.add('active', 'listening');
    }
  });

  // Stop Button
  document.getElementById('stopBtn').addEventListener('click', () => {
    audio.stop();
    audio.stopListening();
    document.getElementById('micBtn').classList.remove('active', 'listening');
  });

  // Settings Button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    const panel = document.getElementById('audioSettingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    document.getElementById('audioSettingsPanel').style.display = 'none';
  });

  // ===== Audio Settings =====

  // Speed slider
  document.getElementById('rateSlider').addEventListener('change', (e) => {
    const rate = parseFloat(e.target.value);
    audio.setRate(rate);
    document.getElementById('rateValue').textContent = rate.toFixed(1) + 'x';
  });

  // Volume slider
  document.getElementById('volumeSlider').addEventListener('change', (e) => {
    const volume = parseFloat(e.target.value);
    audio.setVolume(volume);
    document.getElementById('volumeValue').textContent = Math.round(volume * 100) + '%';
  });

  // Accessibility mode
  document.getElementById('accessibilityToggle').addEventListener('change', (e) => {
    if (e.target.checked) {
      audio.enableAccessibilityMode();
      audio.speak('Accessibility mode enabled. I will read buttons and links on focus.');
    }
  });

  // ===== Audio System Events =====

  // When speaking starts
  window.addEventListener('audioSpeakStart', () => {
    document.getElementById('readPageBtn').classList.add('active', 'speaking');
  });

  // When speaking stops
  window.addEventListener('audioSpeakEnd', () => {
    document.getElementById('readPageBtn').classList.remove('active', 'speaking');
  });

  // When listening starts
  window.addEventListener('audioListeningStart', () => {
    document.getElementById('transcriptDisplay').style.background = '#fff3cd';
    document.getElementById('interimText').textContent = 'Listening...';
  });

  // Interim results while speaking
  window.addEventListener('audioInterimResult', (e) => {
    document.getElementById('interimText').textContent = e.detail.transcript;
  });

  // Final results when done speaking
  window.addEventListener('audioFinalResult', (e) => {
    const transcript = e.detail.transcript;
    document.getElementById('finalText').textContent = transcript;
    
    // Process voice commands
    console.log('Voice input:', transcript);
    
    // Example: Check for specific queries
    if (transcript.toLowerCase().includes('appointment')) {
      audio.speak('Opening appointment booking');
      setTimeout(() => {
        window.location.href = '#appointments';
      }, 1500);
    }
    
    // If not a command, pass to chatbot
    else if (transcript.length > 3) {
      // Send to VILGAX AI chatbot
      if (typeof sendChatbotMessage === 'function') {
        sendChatbotMessage(transcript);
      }
    }
  });

  // Listening ends
  window.addEventListener('audioListeningEnd', () => {
    document.getElementById('transcriptDisplay').style.background = '#f5f5f5';
    document.getElementById('interimText').textContent = '';
    document.getElementById('micBtn').classList.remove('active', 'listening');
  });

  // Error handling
  window.addEventListener('audioError', (e) => {
    console.error('Audio error:', e.detail);
    audio.playSound('error');
    document.getElementById('interimText').textContent = 'Error: ' + e.detail;
  });

  // ===== Voice Commands Registration =====

  // Register patient-specific commands
  audio.registerCommand('my appointments', () => {
    audio.speak('Loading your appointments');
    window.location.href = '#appointments';
  });

  audio.registerCommand('book appointment', () => {
    audio.speak('Opening appointment booking');
    window.location.href = '#book-appointment';
  });

  audio.registerCommand('view prescriptions', () => {
    audio.speak('Loading your prescriptions');
    window.location.href = 'prescription.html';
  });

  audio.registerCommand('medical records', () => {
    audio.speak('Loading your medical records');
    window.location.href = 'medical-records.html';
  });

  audio.registerCommand('find medicine', () => {
    audio.speak('Opening medicine finder');
    window.location.href = 'medicine-finder.html';
  });

  // ===== Page-Specific Audio Features =====

  // Read medical records on load
  const medicalRecordsBtn = document.querySelector('[data-read-medical]');
  if (medicalRecordsBtn) {
    medicalRecordsBtn.addEventListener('click', () => {
      const records = document.querySelector('.medical-records-content');
      if (records) {
        audio.speak('Reading your medical records', { rate: 0.85 });
      }
    });
  }

  // Greet user when page loads
  setTimeout(() => {
    if (i18n && i18n.t) {
      audio.speakTranslation('pages.patient.welcome');
    } else {
      audio.speak('Welcome to your patient dashboard');
    }
  }, 1500);

  // ===== Form Input Accessibility =====

  // Read form labels on focus
  document.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('focus', () => {
      const label = field.previousElementSibling;
      if (label && label.textContent) {
        audio.speak(label.textContent);
      } else if (field.placeholder) {
        audio.speak(field.placeholder);
      }
    });
  });

  // Audio feedback on form submission
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (form.checkValidity()) {
        audio.playSound('success');
        audio.speak('Form submitted successfully');
      } else {
        audio.playSound('error');
        audio.speak('Please check the form for errors');
      }
    });
  });
}

// Handle language changes
if (window.i18n) {
  window.addEventListener('languageChanged', (e) => {
    console.log('Language changed to:', e.detail.language);
    // Audio system auto-updates based on language
  });
}
</script>
```

---

## Step 5: Integrate with Existing Patient Features

### Example 1: Audio Feedback for Appointments

```javascript
// In your existing appointment booking code
async function bookAppointment(appointmentData) {
  try {
    // Save appointment
    const result = await saveAppointment(appointmentData);
    
    // Audio confirmation
    audio.playSound('appointment');
    const confirmationMsg = `
      Your appointment with ${appointmentData.doctorName} 
      has been confirmed for ${appointmentData.date} at ${appointmentData.time}.
      Please arrive 10 minutes early.
    `;
    audio.speak(confirmationMsg, { rate: 0.95 });
    
    // Show visual confirmation
    showAlertBox('Appointment Confirmed', confirmationMsg);
    
  } catch (error) {
    audio.playSound('error');
    audio.speak('Failed to book appointment. Please try again.');
  }
}
```

### Example 2: Audio for Medical Records Display

```javascript
// Read medical records aloud
function displayMedicalRecords(records) {
  let recordsText = 'Your medical records:\n\n';
  
  records.forEach(record => {
    recordsText += `
      ${record.date}: ${record.type}
      Description: ${record.description}
      Doctor: ${record.doctor}
      
    `;
  });
  
  // Display
  document.getElementById('medicalRecordsContainer').innerHTML = 
    `<pre>${recordsText}</pre>`;
  
  // Play audio
  audio.speak(recordsText, { rate: 0.9, volume: 0.8 });
}
```

### Example 3: Voice-Activated Prescription Lookup

```javascript
// When user says "find aspirin"
function handleVoiceSearch(medicineName) {
  audio.speak(`Searching for ${medicineName}...`);
  
  // Search medicine database
  const results = searchMedicines(medicineName);
  
  if (results.length > 0) {
    audio.speak(`Found ${results.length} ${medicineName} products`);
    
    // Show first result details
    const first = results[0];
    audio.speak(`First result: ${first.name}. Dosage: ${first.dosage}. Composition: ${first.composition}`);
  } else {
    audio.speak(`No products found for ${medicineName}`);
  }
}
```

---

## Step 6: Testing Checklist

Before deploying, test these scenarios:

### English Testing
- [ ] Click "Read Page" - reads page content in English
- [ ] Click "Mic" - starts listening, shows "Listening..."
- [ ] Say "book appointment" - executes command
- [ ] Say "find medicine aspirin" - processes voice input
- [ ] Form field focus - reads label
- [ ] Form submission - plays sound

### Tamil Testing
- [ ] Change language to Tamil (if language switcher implemented)
- [ ] Click "Read Page" - reads in Tamil
- [ ] All voice commands work in Tamil
- [ ] TTS voice changes to Tamil

### Hindi Testing
- [ ] Change language to Hindi
- [ ] Click "Read Page" - reads in Hindi
- [ ] All features work in Hindi
- [ ] TTS voice changes to Hindi

### Accessibility Testing
- [ ] Enable "Accessibility Mode"
- [ ] Focus on buttons - they're read aloud
- [ ] Navigate with keyboard - audio feedback
- [ ] Screen reader test (NVDA/JAWS)

---

## Deployment Steps

1. **Add audio.js to patient.html** (already done in this example)
2. **Add HTML controls** (copy the audio-controls div)
3. **Add CSS styling** (copy audio-controls.css)
4. **Add JavaScript** (copy the script block)
5. **Test all features** (use checklist above)
6. **Commit to Git**: 
   ```bash
   git add patient.html css/audio-controls.css
   git commit -m "Add audio system integration to patient dashboard"
   git push origin main
   ```

---

## Next: Add to Other Pages

Once patient.html works, add same structure to:
- doctor.html
- chatbot.html
- medicine-finder.html
- prescription.html
- medical-records.html
- ... and all other pages

---

**Status**: Ready to implement  
**Time to implement**: 1-2 hours for patient.html + CSS  
**Dependencies**: audio.js and i18n.js must be loaded first
