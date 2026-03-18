# Audio System Implementation Guide

## Overview

Comprehensive audio system for Care Without Borders supporting:
- ✅ **Text-to-Speech** (TTS) - Medical information narration
- ✅ **Speech-to-Text** - Voice queries for chatbot
- ✅ **Voice Commands** - Navigation via voice
- ✅ **Audio Notifications** - Sound alerts
- ✅ **Audio Guidance** - Hands-free navigation help

**Technology**: Web Speech API (Browser Native) + HTML5 Audio API  
**Dependencies**: Zero external libraries  
**Languages**: English, Tamil, Hindi  

---

## Installation

### Step 1: Add Audio.js to HTML
Add before other scripts in all pages:

```html
<!-- Multilingual Support - Load First! -->
<script src="js/i18n.js"></script>

<!-- Audio System -->
<script src="js/audio.js"></script>

<!-- Other scripts -->
<script src="js/firebase.js"></script>
```

**Recommended order:**
1. i18n.js (language support)
2. audio.js (audio system)
3. Other application scripts

### Step 2: Verify in Browser Console
```javascript
// Check audio system status
console.log(audio.getStatus());

// Output: { isSpeaking: false, isListening: false, ... }
```

---

## Feature 1: Text-to-Speech (TTS)

### Basic Usage

```javascript
// Simple text-to-speech
audio.speak("Hello, welcome to Care Without Borders");

// With custom voice settings
audio.speak("What is a fever?", {
  rate: 1.2,     // Speed: 0.5 - 2.0
  pitch: 1.0,    // Pitch: 0.5 - 2.0
  volume: 0.8,   // Volume: 0 - 1.0
  lang: 'en-US'  // Language
});

// Stop speaking
audio.stop();
```

### Integration with i18n (Multilingual)

```javascript
// Speak translated text automatically
audio.speakTranslation('pages.login.welcomeBack');
// Output: "Welcome Back" (English) or "மீண்டும் வரவேற்கிறோம்" (Tamil)

// Change language, TTS updates automatically
i18n.setLanguage('ta'); // Switch to Tamil
audio.speakTranslation('pages.login.emailAddress');
// Output: "மின்னஞ்சல் முகவரி" (Tamil)
```

### Real-World Examples

#### Example 1: Read Medical Information Aloud
```javascript
// In patient dashboard
function displayMedicalInfo(info) {
  const content = `
    Patient Name: ${info.name}
    Date of Birth: ${info.dob}
    Blood Type: ${info.bloodType}
    Allergies: ${info.allergies}
  `;
  
  // Display and narrate
  document.getElementById('medicalInfo').textContent = content;
  audio.speak(content);
}
```

#### Example 2: Read Form Labels on Focus
```javascript
// Make forms more accessible
document.getElementById('email').addEventListener('focus', () => {
  audio.speakTranslation('pages.login.emailAddress');
});

document.getElementById('password').addEventListener('focus', () => {
  audio.speakTranslation('pages.login.password');
});
```

#### Example 3: Read Chatbot Responses
```javascript
// VILGAX AI provides audio feedback
function displayChatbotResponse(response) {
  // Add to chat UI
  const messageEl = document.createElement('div');
  messageEl.textContent = response;
  document.getElementById('chatMessages').appendChild(messageEl);
  
  // Also speak the response
  audio.speak(response, { rate: 0.9 }); // Slower for clarity
}
```

#### Example 4: Appointment Confirmation Narration
```javascript
function confirmAppointment(appointment) {
  const message = `
    Your appointment has been confirmed.
    Date: ${appointment.date}
    Time: ${appointment.time}
    Doctor: ${appointment.doctor}
    Please arrive 10 minutes early.
  `;
  
  audio.speak(message, { rate: 0.95 });
}
```

---

## Feature 2: Speech-to-Text (Voice Input)

### Basic Usage

```javascript
// Start listening
audio.listen('en'); // English

// Listen in other languages
audio.listen('ta'); // Tamil
audio.listen('hi'); // Hindi

// Stop listening
audio.stopListening();
```

### Events (Listen for Voice Input)

```javascript
// Interim results (updating in real-time)
window.addEventListener('audioInterimResult', (e) => {
  console.log('Interim:', e.detail.transcript);
  document.getElementById('interim').textContent = e.detail.transcript;
});

// Final results (when user stops speaking)
window.addEventListener('audioFinalResult', (e) => {
  console.log('Final:', e.detail.transcript);
  document.getElementById('final').textContent = e.detail.transcript;
  
  // Process the voice input
  processVoiceQuery(e.detail.transcript);
});

// Listening events
window.addEventListener('audioListeningStart', () => {
  document.getElementById('micButton').style.background = 'red';
});

window.addEventListener('audioListeningEnd', () => {
  document.getElementById('micButton').style.background = 'gray';
});
```

### Real-World Examples

#### Example 1: Voice Input for Chatbot
```html
<div class="chatbot-input">
  <input type="text" id="chatInput" placeholder="Type or click mic to speak">
  <button id="micButton" title="Press to speak">🎤</button>
</div>
```

```javascript
document.getElementById('micButton').addEventListener('click', () => {
  if (audio.isListening) {
    audio.stopListening();
  } else {
    audio.listen(i18n.getLanguage()); // Use current language
  }
});

// Process voice input
window.addEventListener('audioFinalResult', (e) => {
  const query = e.detail.transcript;
  
  // Send to chatbot
  sendChatMessage(query);
  
  // Show in input field too
  document.getElementById('chatInput').value = query;
});
```

#### Example 2: Voice Symptom Reporting
```javascript
function openSymptomReporter() {
  const message = "Please describe your symptoms. I'm listening...";
  audio.speak(message);
  
  audio.listen('en');
  
  window.addEventListener('audioFinalResult', (e) => {
    const symptoms = e.detail.transcript;
    
    // Save symptoms
    document.getElementById('symptomsInput').value = symptoms;
    
    // Narrate confirmation
    audio.speak(`I understood: ${symptoms}. Is this correct?`);
  }, { once: true });
}
```

#### Example 3: Accessibility - Read Page Content
```javascript
document.getElementById('readPageButton').addEventListener('click', () => {
  const mainContent = document.querySelector('main').textContent;
  audio.speak(mainContent, { rate: 0.8 });
});
```

---

## Feature 3: Voice Commands

### Register Custom Commands

```javascript
// Add appointment booking command
audio.registerCommand('book appointment with cardiology', () => {
  window.location.href = 'patient.html#appointment';
  audio.speak('Opening appointment booking for cardiology');
});

// Add prescription command
audio.registerCommand('show my prescriptions', () => {
  window.location.href = 'prescription.html';
  audio.speak('Loading your prescriptions');
});

// Add medicine search command
audio.registerCommand('find aspirin', () => {
  window.location.href = 'medicine-finder.html?search=aspirin';
  audio.speak('Searching for aspirin');
});
```

### Default Voice Commands (Pre-Registered)

```javascript
// These work out-of-the-box:
"book appointment"      // Navigate to appointments
"open chatbot"          // Open AI assistant
"find medicine"         // Open medicine search
"my prescriptions"      // View prescriptions
"medical records"       // View medical records
"doctor list"           // View doctors
"help"                  // Get help message
"stop"                  // Stop speaking
"mute"                  // Mute audio output
"unmute"                // Unmute audio output
```

### Implementation

```html
<!-- Add voice command button -->
<button id="voiceCommandBtn" title="Voice Commands">🎤 Say a command</button>
```

```javascript
document.getElementById('voiceCommandBtn').addEventListener('click', () => {
  audio.speak('What command would you like? Try: book appointment, open chatbot, find medicine, my prescriptions');
  
  setTimeout(() => {
    audio.listen(i18n.getLanguage());
    // Voice commands are automatically processed by audio.js
  }, 2000);
});
```

---

## Feature 4: Audio Notifications

### Play Sound Alerts

```javascript
// Success notification
audio.playSound('success');
// Output: Pleasant beep tone

// Error notification
audio.playSound('error');
// Output: Low warning tone

// Other types
audio.playSound('warning');        // Caution tone
audio.playSound('notification');   // Bell tone
audio.playSound('appointment');    // Appointment reminder tone
audio.playSound('message');        // Message arrival tone
```

### Real-World Examples

#### Example 1: Notification on Appointment Confirmed
```javascript
function confirmAppointment(appointment) {
  // Save appointment
  saveToDatabase(appointment);
  
  // Play sound
  audio.playSound('appointment');
  audio.speak(`Your appointment with ${appointment.doctor} is confirmed on ${appointment.date}`);
  
  // Show notification
  showNotification('✅ Appointment Confirmed');
}
```

#### Example 2: Form Validation Feedback
```javascript
function validateEmail(email) {
  const isValid = email.includes('@');
  
  if (isValid) {
    audio.playSound('success');
    audio.speak('Email is valid');
  } else {
    audio.playSound('error');
    audio.speak('Please enter a valid email address');
  }
  
  return isValid;
}
```

#### Example 3: Login Success
```javascript
async function handleLogin(email, password) {
  try {
    const user = await login(email, password);
    
    audio.playSound('success');
    audio.speak('Login successful. Welcome back!');
    
    // Redirect
    setTimeout(() => {
      window.location.href = 'patient.html';
    }, 1500);
  } catch (error) {
    audio.playSound('error');
    audio.speak('Login failed. Please check your credentials.');
  }
}
```

---

## Feature 5: Audio Guidance

### Provide Navigation Help

```javascript
// Guide user when navigating
audio.audioGuidance('patient.html');
// Output: "Welcome to your patient dashboard..."

audio.audioGuidance('chatbot.html');
// Output: "Open VILGAX AI health assistant..."

audio.audioGuidance('medicine-finder.html');
// Output: "Search for medicines by name or composition..."
```

### Accessibility Mode

```javascript
// Enable reading labels on focus
audio.enableAccessibilityMode();

// Now when users focus on buttons/links, they're read aloud
// This helps:
// - Visually impaired users
// - Users learning the language
// - Quick navigation without reading
```

---

## Settings & Controls

### Adjust Voice Settings

```javascript
// Set speech speed
audio.setRate(0.8);  // Slower (0.5 - normal - 2.0)
audio.setRate(1.2);  // Faster

// Set pitch
audio.setPitch(0.9);  // Lower voice
audio.setPitch(1.1);  // Higher voice

// Set volume
audio.setVolume(0.5);  // 50% volume
audio.setVolume(1.0);  // 100% volume

// Get available system voices
const voices = audio.getVoices();
console.log(voices); // Array of available voices

// Select specific voice
audio.setVoice(0); // First available voice
```

### Create Settings Panel

```html
<!-- Audio Settings Control -->
<div class="audio-settings">
  <h3>Audio Settings</h3>
  
  <label>Speech Rate
    <input type="range" id="rateSlider" min="0.5" max="2.0" step="0.1" value="1.0">
    <span id="rateValue">1.0x</span>
  </label>
  
  <label>Volume
    <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="1.0">
    <span id="volumeValue">100%</span>
  </label>
  
  <label>Accessibility Mode
    <input type="checkbox" id="accessibilityToggle">
  </label>
</div>
```

```javascript
// Rate slider
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

// Accessibility toggle
document.getElementById('accessibilityToggle').addEventListener('change', (e) => {
  if (e.target.checked) {
    audio.enableAccessibilityMode();
  }
});
```

---

## Integration Checklist

### Phase 1: Basic Setup (30 min)
- [ ] Add audio.js to all HTML pages
- [ ] Load after i18n.js
- [ ] Test in browser console

### Phase 2: Text-to-Speech (1 hour)
- [ ] Add read-aloud buttons to key sections
- [ ] Integrate with medical information pages
- [ ] Test with all 3 languages

### Phase 3: Voice Input (1.5 hours)
- [ ] Add mic button to chatbot
- [ ] Implement voice query processing
- [ ] Add interim/final transcription display

### Phase 4: Voice Commands (1 hour)
- [ ] Register page-specific commands
- [ ] Add command help interface
- [ ] Test command recognition

### Phase 5: Audio Notifications (30 min)
- [ ] Add sound alerts to key actions
- [ ] Integrate with form validation
- [ ] Add success/error feedback

### Phase 6: Accessibility (1 hour)
- [ ] Enable accessibility mode
- [ ] Test with screen reader
- [ ] Add audio guidance to navigation

---

## Troubleshooting

### Issue: Speech Synthesis Not Working
```javascript
// Check if supported
if (!window.speechSynthesis) {
  console.error('Speech Synthesis not supported in this browser');
}

// Check voices loaded
window.speechSynthesis.onvoiceschanged = () => {
  console.log('Voices loaded:', audio.getVoices());
};
```

### Issue: Speech Recognition Not Working
```javascript
// Check if supported
if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
  console.error('Speech Recognition not supported');
}

// Check language support
// Tamil/Hindi might need OS language pack installed
```

### Issue: Audio Context Issues
```javascript
// Browsers require user gesture to play audio
// Make sure audio is triggered from click/touch event
button.addEventListener('click', () => {
  audio.speak('Hello');  // Works
});

// vs

setTimeout(() => {
  audio.speak('Hello');  // Might be blocked
}, 1000);
```

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ✅ | ✅ | ✅ |
| Audio Context | ✅ | ✅ | ✅ | ✅ |
| Tamil/Hindi | ✅ | ✅ | ⚠️ | ✅ |

**Note:** Tamil and Hindi support depends on OS language packs. All modern browsers support English.

---

## Mobile Considerations

```javascript
// iOS requires user gesture
document.addEventListener('touchend', (e) => {
  if (e.target.id === 'playButton') {
    audio.speak('Hello'); // Works on iOS
  }
});

// Android less restrictive
// Test heavily on both platforms

// Microphone requires HTTPS on mobile
// http://localhost works for testing
// Production requires HTTPS
```

---

## Security & Privacy

```javascript
// Speech data handling:
// - Audio input is sent to browser's speech recognition service
// - Not stored in application
// - User can check Privacy in browser settings
// - For HIPAA compliance:
//   - Use on HTTPS only
//   - Consider on-device TTS alternatives
//   - Document in privacy policy
```

---

## Performance Tips

```javascript
// Cache frequently spoken phrases
const cache = {};

function cachedSpeak(key) {
  if (cache[key]) {
    // Reuse if recently spoken
    audio.speak(cache[key]);
  } else {
    const text = i18n.t(key);
    cache[key] = text;
    audio.speak(text);
  }
}

// Limit concurrent audio
if (!audio.isSpeaking && !audio.isListening) {
  // Safe to play sound
  audio.playSound('notification');
}
```

---

## Next Steps

1. **Add to all pages**: Include `<script src="js/audio.js"></script>` in all 14 HTML files
2. **Integrate with chatbot**: Add voice input to VILGAX AI
3. **Create audio UI**: Add buttons for speak/listen/commands
4. **Test languages**: Verify Tamil and Hindi TTS/STT work
5. **Accessibility audit**: Test with screen readers
6. **Mobile testing**: Test on iOS and Android

---

**Last Updated**: March 18, 2026  
**Status**: Production Ready
