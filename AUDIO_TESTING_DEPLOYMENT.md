# Audio System - Testing & Deployment Guide

Complete testing procedures and deployment checklist for the audio system.

---

## Pre-Deployment Verification

### Browser Compatibility Check

```javascript
// Add this to console to verify browser support
function checkAudioSupport() {
  console.log('=== Audio System Browser Support ===');
  console.log('Speech Synthesis:', !!window.speechSynthesis ? '✅' : '❌');
  console.log('Speech Recognition:', !!(window.SpeechRecognition || window.webkitSpeechRecognition) ? '✅' : '❌');
  console.log('Web Audio API:', !!window.AudioContext ? '✅' : '❌');
  console.log('localStorage:', !!window.localStorage ? '✅' : '❌');
  
  // Further details
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Available TTS Voices:', voices.length);
      console.log('Languages:', voices.map(v => v.lang).join(', '));
    };
  }
}

checkAudioSupport();
```

---

## Test 1: Text-to-Speech (TTS) - All Languages

### Test Case 1.1: English TTS

**Setup:**
1. Open patient.html in Chrome/Firefox
2. Open Developer Console (F12)

**Test Steps:**
```javascript
// 1. Basic English speech
audio.speak('Hello, welcome to the Care Without Borders application');

// Expected: Clear English voice speaking the text

// 2. With custom settings
audio.speak('Testing speech rate', { rate: 1.5 });
// Expected: Faster speaking

audio.speak('Testing speech volume', { volume: 0.5 });
// Expected: Lower volume

// 3. Stop speaking mid-sentence
audio.speak('This is a long sentence that will be stopped in the middle of speaking');
setTimeout(() => audio.stop(), 1000);
// Expected: Speech stops after 1 second
```

**Results:**
- [ ] Voice is clear and understandable
- [ ] Rate adjustment (1.5x faster) works
- [ ] Volume adjustment (0.5 volume) works
- [ ] Stop function halts speech immediately

### Test Case 1.2: Tamil TTS

**Setup:**
1. Ensure audio system initialized
2. Set language to Tamil (if implemented)

**Test Steps:**
```javascript
// 1. Speak in Tamil
i18n.setLanguage('ta');
audio.speak('வணக்கம், Care Without Borders லிருக்கிறது');

// 2. Use translation
audio.speakTranslation('pages.patient.welcome');
// Expected: Tamil voice speaks "patient welcome" in Tamil

// 3. Verify voice changed to Tamil
console.log(audio.config.lang); // Should show 'ta-IN'
```

**Results:**
- [ ] Tamil text spoken in Tamil voice
- [ ] Accent appropriate to Indian Tamil
- [ ] speakTranslation() uses correct language
- [ ] Voice changes when language changes

### Test Case 1.3: Hindi TTS

**Setup:**
1. Set language to Hindi

**Test Steps:**
```javascript
// 1. Speak in Hindi
i18n.setLanguage('hi');
audio.speak('स्वागत है Care Without Borders में');

// 2. Use translation
audio.speakTranslation('pages.patient.welcome');

// 3. Verify voice changed
console.log(audio.config.lang); // Should show 'hi-IN'
```

**Results:**
- [ ] Hindi text spoken in Hindi voice
- [ ] Accent appropriate to Indian Hindi
- [ ] Voice switches when language changes
- [ ] Speech quality consistent

---

## Test 2: Speech-to-Text (STT) - All Languages

### Test Case 2.1: English Speech Recognition

**Setup:**
1. Ensure microphone permissions granted
2. Open console

**Test Steps:**
```javascript
// 1. Start listening
audio.listen('en');

// Speak: "book appointment"
// Expected: Text appears in real-time

// Check interim results
window.addEventListener('audioInterimResult', (e) => {
  console.log('Interim:', e.detail.transcript);
});

// Check final results
window.addEventListener('audioFinalResult', (e) => {
  console.log('Final:', e.detail.transcript);
});
```

**Results:**
- [ ] Microphone captures voice clearly
- [ ] Interim results update in real-time
- [ ] Final result shows complete speech
- [ ] Accuracy > 90% for clear English

### Test Case 2.2: Tamil Speech Recognition

**Setup:**
1. Set language to Tamil

**Test Steps:**
```javascript
// Start listening in Tamil
audio.listen('ta');

// Speak Tamil: "நிரோग மருந்து தேட" (find medicine)
// Verify recognition
```

**Results:**
- [ ] Tamil speech recognized
- [ ] Accuracy acceptable for Tamil
- [ ] Note: May require system Tamil language pack

### Test Case 2.3: Hindi Speech Recognition

**Setup:**
1. Set language to Hindi

**Test Steps:**
```javascript
// Start listening in Hindi
audio.listen('hi');

// Speak Hindi: "अपॉइंटमेंट बुक करें" (book appointment)
// Verify recognition
```

**Results:**
- [ ] Hindi speech recognized
- [ ] Accuracy acceptable for Hindi
- [ ] Note: May require system Hindi language pack

---

## Test 3: Voice Commands

### Test Case 3.1: Default Voice Commands

**Setup:**
1. Open patient.html
2. Ensure audio initialized

**Test Steps:**
```javascript
// Test each default command

// 1. "book appointment"
audio.listen('en');
// Speak: "book appointment"
// Expected: Navigate to appointment booking

// 2. "open chatbot"
// Speak: "open chatbot"
// Expected: Open VILGAX AI

// 3. "find medicine"
// Speak: "find medicine"
// Expected: Open medicine finder

// 4. "my prescriptions"
// Speak: "my prescriptions"
// Expected: Load prescriptions page

// 5. "medical records"
// Speak: "medical records"
// Expected: Load medical records

// 6. "doctor list"
// Speak: "doctor list"
// Expected: Show doctor list

// 7. "stop"
// Speak: "stop"
// Expected: Stop all audio

// 8. "mute"
// Speak: "mute"
// Expected: Mute audio output
```

**Results:**
- [ ] All 8 commands recognized
- [ ] Each command executes correct action
- [ ] Navigation works for all commands
- [ ] Partial matching works (e.g., "book" triggers "book appointment")

### Test Case 3.2: Custom Commands

**Setup:**
1. Register custom commands

**Test Steps:**
```javascript
// Register custom command
audio.registerCommand('check blood pressure', () => {
  audio.speak('Opening blood pressure log');
  // Navigate to BP page
});

// Test command
audio.listen('en');
// Speak: "check blood pressure"
// Expected: Custom action executes
```

**Results:**
- [ ] Custom commands register successfully
- [ ] Custom commands execute on voice input
- [ ] Multiple custom commands don't conflict

---

## Test 4: Audio Notifications

### Test Case 4.1: All Sound Types

**Setup:**
1. Open console

**Test Steps:**
```javascript
// Test each notification type

// 1. Success sound
audio.playSound('success');
// Expected: Pleasant beep tone

// 2. Error sound
audio.playSound('error');
// Expected: Low warning tone

// 3. Warning sound
audio.playSound('warning');
// Expected: Caution tone

// 4. Notification sound
audio.playSound('notification');
// Expected: Bell-like tone

// 5. Appointment sound
audio.playSound('appointment');
// Expected: Distinctive appointment reminder tone

// 6. Message sound
audio.playSound('message');
// Expected: Message arrival tone
```

**Results:**
- [ ] All 6 sound types play clearly
- [ ] Sounds are distinguishable from each other
- [ ] Volume levels appropriate
- [ ] No audio glitches
- [ ] Sounds work across languages

---

## Test 5: Audio Guidance

### Test Case 5.1: Page Guidance

**Setup:**
1. Load different pages

**Test Steps:**
```javascript
// Test guidance for different pages

// Patient dashboard
audio.audioGuidance('patient.html');
// Expected: Guidance about patient features

// Chatbot page
audio.audioGuidance('chatbot.html');
// Expected: Guidance about VILGAX AI

// Medicine finder
audio.audioGuidance('medicine-finder.html');
// Expected: Guidance about medicine search

// Check guidance content
console.log('Guidance provided'); // Verify guidance audio plays
```

**Results:**
- [ ] All pages have guidance available
- [ ] Guidance is informative and clear
- [ ] Guidance duration < 30 seconds
- [ ] Guidance updates with language changes

---

## Test 6: Accessibility Mode

### Test Case 6.1: Accessibility Features

**Setup:**
1. Enable accessibility mode

**Test Steps:**
```javascript
// Enable accessibility mode
audio.enableAccessibilityMode();

// Focus on button
document.getElementById('sampleButton').focus();
// Expected: Button text read aloud

// Focus on link
document.getElementById('sampleLink').focus();
// Expected: Link text read aloud

// Test with keyboard navigation
// Tab through page elements
// Expected: Each focused element is read aloud
```

**Results:**
- [ ] Focused buttons are read aloud
- [ ] Focused links are read aloud
- [ ] Keyboard navigation has audio feedback
- [ ] Works with Tab and arrow keys

### Test Case 6.2: Read Element Function

**Setup:**
1. Accessibility mode enabled

**Test Steps:**
```javascript
// Read specific element
audio.readElement('#medicalInfo');
// Expected: Medical info text spoken

audio.readElement('.error-message');
// Expected: Error message text spoken

audio.readElement('button');
// Expected: First button text spoken
```

**Results:**
- [ ] readElement works with ID selectors
- [ ] readElement works with class selectors
- [ ] readElement works with tag selectors
- [ ] Content is read clearly

---

## Test 7: Multilingual Integration

### Test Case 7.1: Language Switching

**Setup:**
1. Implement language switcher (if not done)

**Test Steps:**
```javascript
// 1. Start in English
i18n.setLanguage('en');
audio.speak('Welcome');
// Expected: English voice speaks "Welcome"

// 2. Switch to Tamil
i18n.setLanguage('ta');
// Check language changed
console.log(i18n.getLanguage()); // Should be 'ta'

// 3. Speak in Tamil
audio.speak('வணக்கம்');
// Expected: Tamil voice speaks

// 4. Switch back to English
i18n.setLanguage('en');
audio.speak('Thank you');
// Expected: English voice again

// 5. Test speakTranslation across languages
for (let lang of ['en', 'ta', 'hi']) {
  i18n.setLanguage(lang);
  audio.speakTranslation('pages.patient.welcome');
  // Expected: Same key, different languages
}
```

**Results:**
- [ ] Language switching works seamlessly
- [ ] TTS voice changes with language
- [ ] Translation keys work across all languages
- [ ] No audio glitches on language change
- [ ] All 3 languages supported

---

## Test 8: Event System

### Test Case 8.1: All Audio Events

**Setup:**
1. Attach event listeners

**Test Steps:**
```javascript
// Test each event

// 1. audioSpeakStart
window.addEventListener('audioSpeakStart', () => {
  console.log('✅ Speaking started');
});

// 2. audioSpeakEnd
window.addEventListener('audioSpeakEnd', () => {
  console.log('✅ Speaking ended');
});

// 3. audioListeningStart
window.addEventListener('audioListeningStart', () => {
  console.log('✅ Listening started');
});

// 4. audioListeningEnd
window.addEventListener('audioListeningEnd', () => {
  console.log('✅ Listening ended');
});

// 5. audioInterimResult
window.addEventListener('audioInterimResult', (e) => {
  console.log('✅ Interim result:', e.detail.transcript);
});

// 6. audioFinalResult
window.addEventListener('audioFinalResult', (e) => {
  console.log('✅ Final result:', e.detail.transcript);
});

// 7. audioError
window.addEventListener('audioError', (e) => {
  console.log('✅ Audio error:', e.detail);
});

// Trigger events
audio.speak('Test speech');
setTimeout(() => {
  audio.listen('en');
  setTimeout(() => audio.stopListening(), 3000);
}, 2000);
```

**Results:**
- [ ] All 7 events fire correctly
- [ ] Events fire in expected order
- [ ] Event details contain correct information
- [ ] Multiple listeners work simultaneously

---

## Test 9: Settings & Controls

### Test Case 9.1: Voice Rate

**Setup:**
1. Prepare test text

**Test Steps:**
```javascript
const testText = 'Testing voice rate adjustment';

// 1. Slow (0.5x)
audio.setRate(0.5);
audio.speak(testText);
// Expected: Very slow speech

// 2. Normal (1.0x)
audio.setRate(1.0);
audio.speak(testText);
// Expected: Normal speed

// 3. Fast (2.0x)
audio.setRate(2.0);
audio.speak(testText);
// Expected: Very fast speech

// 4. Verify setting
console.log('Current rate:', audio.config.rate);
```

**Results:**
- [ ] Rate 0.5x is noticeably slower
- [ ] Rate 1.0x is normal
- [ ] Rate 2.0x is noticeably faster
- [ ] Setting persists across calls

### Test Case 9.2: Voice Pitch

**Setup:**
1. Prepare test text

**Test Steps:**
```javascript
const testText = 'Testing voice pitch';

// 1. Low pitch (0.5)
audio.setPitch(0.5);
audio.speak(testText);
// Expected: Lower voice

// 2. Normal pitch (1.0)
audio.setPitch(1.0);
audio.speak(testText);
// Expected: Normal pitch

// 3. High pitch (2.0)
audio.setPitch(2.0);
audio.speak(testText);
// Expected: Higher voice

console.log('Current pitch:', audio.config.pitch);
```

**Results:**
- [ ] Pitch 0.5 is noticeably lower
- [ ] Pitch 1.0 is normal
- [ ] Pitch 2.0 is noticeably higher
- [ ] Setting persists

### Test Case 9.3: Volume Control

**Setup:**
1. Prepare test speech

**Test Steps:**
```javascript
const testText = 'Testing volume control';

// 1. Quiet (0.3)
audio.setVolume(0.3);
audio.speak(testText);
// Expected: Quiet

// 2. Normal (1.0)
audio.setVolume(1.0);
audio.speak(testText);
// Expected: Normal volume

// 3. Max (1.0 is max, but test speakers)
audio.playSound('appointment'); // Test with sound
console.log('Current volume:', audio.config.volume);
```

**Results:**
- [ ] Volume 0.3 is noticeably quieter
- [ ] Volume 1.0 is normal
- [ ] Volume adjustment doesn't cause distortion
- [ ] Setting persists

---

## Test 10: Mobile Testing

### iOS Testing

**Devices:** iPhone, iPad
**Minimum iOS**: 14.5

**Test Steps:**
1. Open patient.html on Safari
2. Click "🎤 Mic" button
3. Speak: "book appointment"
4. Verify voice recognition works
5. Test TTS by clicking "📖 Read"

**Results:**
- [ ] Microphone working on iOS
- [ ] Voice recognition accurate
- [ ] TTS clear on iOS speakers
- [ ] No console errors

### Android Testing

**Devices:** Android phones/tablets
**Minimum Android**: 7.0

**Test Steps:**
1. Open patient.html on Chrome/Firefox
2. Click "🎤 Mic" button
3. Speak: "book appointment"
4. Verify voice recognition works
5. Test TTS by clicking "📖 Read"

**Results:**
- [ ] Microphone working on Android
- [ ] Voice recognition accurate
- [ ] TTS clear on Android speakers
- [ ] No console errors

---

## Performance Testing

### Test 11.1: Memory Usage

**Setup:**
1. Open DevTools Memory tab

**Test Steps:**
```javascript
// 1. Record baseline memory
console.memory; // Check initial heap

// 2. Perform intensive audio operations
for (let i = 0; i < 10; i++) {
  audio.speak('Test speech ' + i);
}

// 3. Check memory after
console.memory; // Check heap after

// 4. Stop all and check
audio.stop();
audio.stopListening();

// 5. Run garbage collection
console.log('Take heap snapshot and compare');
```

**Results:**
- [ ] Memory usage increases < 20MB per operation
- [ ] Memory releases properly after operations
- [ ] No memory leaks detected
- [ ] 10 consecutive operations complete without issue

### Test 11.2: CPU Usage

**Setup:**
1. Open DevTools Performance tab

**Test Steps:**
```javascript
// 1. Start performance recording

// 2. Run continuous audio
audio.listen('en');
setTimeout(() => audio.stopListening(), 10000);

// 3. Speak simultaneously
audio.speak('Background speech');

// 4. Stop recording

// 5. Analyze CPU usage
```

**Results:**
- [ ] CPU usage < 25% during listening
- [ ] CPU usage < 20% during speaking
- [ ] No UI blocking/jank
- [ ] Smooth animations maintained

---

## Deployment Checklist

### Pre-Deployment

- [ ] All 10 test suites completed
- [ ] No console errors in any scenario
- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing completed (iOS, Android)
- [ ] All 3 languages verified working
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Code reviewed

### Deployment Steps

1. **Backup Current Code**
   ```bash
   git status  # Verify clean state
   git branch -b backup-audio-deployment
   git push origin backup-audio-deployment
   ```

2. **Add audio.js to All HTML Pages**
   - Add `<script src="js/audio.js"></script>` after i18n.js
   - All 14 pages

3. **Add Audio UI Controls**
   - Copy audio-controls HTML
   - Copy audio-controls CSS
   - Copy audio JavaScript handlers

4. **Deploy Translation Updates**
   - Verify ta.json and hi.json have all keys

5. **Git Commit**
   ```bash
   git add .
   git commit -m "Deploy audio system across all pages

   - Added audio.js integration to all 14 HTML pages
   - Added audio UI controls (READ, MIC, STOP, SETTINGS)
   - Integrated with i18n for multilingual TTS/STT
   - Added voice commands for navigation
   - Added audio feedback for forms
   - Full accessibility support
   
   Tested: Chrome, Firefox, Safari, Edge, iOS, Android
   Languages: English, Tamil, Hindi"
   
   git push origin main
   ```

6. **Verify on Production**
   - Test all audio features in production
   - Monitor for errors
   - Gather user feedback

### Post-Deployment

- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Fix any reported issues
- [ ] Optimize based on usage data

---

## Troubleshooting Guide

### Issue: No Audio Output

**Check List:**
1. Is audio.js loaded? `console.log(window.audio)`
2. Is volume > 0? `audio.setVolume(1.0)`
3. Are speakers working? Test with `audio.playSound('notification')`
4. Is browser muted? Check browser settings
5. Is user gesture required? Ensure click triggered audio

### Issue: Speech Recognition Not Working

**Check List:**
1. Is microphone permission granted?
2. Is browser supporting SpeechRecognition? Check console
3. Is internet connection active? (required for some browsers)
4. Did you call `audio.listen()`?
5. Is Firefox ESR? (requires setup)

### Issue: Voice Not Speaking in Correct Language

**Check List:**
1. Is language set correctly? `i18n.getLanguage()`
2. Are voices loaded? Check `audio.getVoices()`
3. Is OS supporting language? Check system settings
4. Did you switch language? `i18n.setLanguage('ta')`

---

## Success Criteria

**Audio System Deployment is Successful When:**

- ✅ All tests pass on Chrome, Firefox, Safari, Edge
- ✅ TTS works in English, Tamil, and Hindi
- ✅ STT recognizes voice in all 3 languages
- ✅ Voice commands navigate correctly
- ✅ Audio notifications play clearly
- ✅ Mobile (iOS/Android) fully functional
- ✅ No console errors
- ✅ Memory usage stable
- ✅ CPU usage < 25%
- ✅ All documentation updated
- ✅ User feedback positive

---

**Last Updated**: March 18, 2026  
**Status**: Testing Framework Ready
