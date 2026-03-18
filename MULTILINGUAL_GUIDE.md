# Multilingual Support Guide

## Overview
This application now supports **3 languages**:
- 🇬🇧 **English** (en)
- 🇮🇳 **Tamil** (ta)
- 🇮🇳 **Hindi** (hi)

---

## File Structure

```
care-without-borders/
├── translations/
│   ├── en.json          # English translations
│   ├── ta.json          # Tamil translations
│   └── hi.json          # Hindi translations
└── js/
    └── i18n.js          # Multilingual utility
```

---

## Setup Instructions

### 1. Include i18n.js in HTML Files

Add this script tag **BEFORE** your other scripts (in the `<head>` or before closing `</body>`):

```html
<script src="js/i18n.js"></script>
```

**Position matters**: The i18n script should load first so translations are available when other scripts run.

---

## Usage in HTML

### Option 1: Using data-i18n Attribute (Recommended)

For text content:

```html
<!-- Simple text translation -->
<h1 data-i18n="sections.hero.title">Welcome to Care Without Borders</h1>
<button data-i18n="buttons.login">Login</button>

<!-- With placeholder attribute -->
<input type="text" data-i18n-attr="placeholder:chatbot.messageInput" />

<!-- With title attribute -->
<div data-i18n-attr="title:sections.hero.subtitle">...</div>

<!-- Multiple attributes -->
<input 
  data-i18n-attr="placeholder:auth.email; title:auth.email" 
  type="email"
/>
```

### Option 2: Using data-i18n-html Attribute

For HTML content (with tags):

```html
<p data-i18n-html="messages.success">Operation successful</p>
```

---

## Usage in JavaScript

### 1. Basic Translation

```javascript
// Get translated string
const loginText = i18n.t('buttons.login');
console.log(loginText);  // "Login" or "உள்நுழைக" or "लॉगिन"

// With dynamic content
const message = i18n.t('messages.success');
alert(message);
```

### 2. Language Management

```javascript
// Get current language
const currentLang = i18n.getLanguage();  // 'en', 'ta', or 'hi'

// Get current language name
const langName = i18n.getLanguageName();  // 'English', 'Tamil (தமிழ்)', etc.

// Change language
i18n.setLanguage('ta');  // Switch to Tamil
i18n.setLanguage('hi');  // Switch to Hindi
i18n.setLanguage('en');  // Switch to English

// Get all supported languages
const languages = i18n.getSupportedLanguages();  // ['en', 'ta', 'hi']

// Get language names for UI
const langNames = i18n.getLanguageNames();
// { 'en': 'English', 'ta': 'Tamil (தமிழ்)', 'hi': 'Hindi (हिन्दी)' }
```

### 3. Check if Key Exists

```javascript
if (i18n.hasKey('buttons.login')) {
  console.log('Key exists');
}
```

### 4. Get All Translations

```javascript
const allTranslations = i18n.getAllTranslations();
console.log(allTranslations);
```

### 5. Listen to Language Changes

```javascript
// When language changes
window.addEventListener('languageChanged', (event) => {
  console.log('Language changed to:', event.detail.language);
  // Update UI or fetch language-specific data
});

// When i18n is initialized
window.addEventListener('i18nReady', (event) => {
  console.log('i18n initialized with:', event.detail.language);
});
```

---

## Practical Examples

### Example 1: Update Button Text on Language Change

```html
<button id="submitBtn" data-i18n="buttons.submit">Submit</button>

<script src="js/i18n.js"></script>
<script>
  window.addEventListener('languageChanged', () => {
    const button = document.getElementById('submitBtn');
    button.textContent = i18n.t('buttons.submit');
  });
</script>
```

### Example 2: Form Input with Placeholder Translation

```html
<input 
  type="email" 
  id="emailInput"
  data-i18n-attr="placeholder:auth.email"
/>
```

Automatically updates when language changes!

### Example 3: Dynamic Messaging in JavaScript

```javascript
import('/js/i18n.js').then(() => {
  // Async operations
  try {
    await someAsyncOperation();
    alert(i18n.t('messages.success'));
  } catch (error) {
    alert(i18n.t('messages.error'));
  }
});
```

### Example 4: Patient Dashboard with Translations

```html
<h1 data-i18n="patient.dashboard">Patient Dashboard</h1>
<h2 data-i18n="patient.upcomingAppointments">Upcoming Appointments</h2>

<div id="appointmentsList"></div>

<script src="js/i18n.js"></script>
<script>
  function loadAppointments() {
    const appointments = getAppointmentsFromDB();
    
    if (appointments.length === 0) {
      document.getElementById('appointmentsList').innerHTML = 
        `<p>${i18n.t('patient.noAppointments')}</p>`;
    } else {
      // Display appointments
    }
  }

  // Reload appointments when language changes
  window.addEventListener('languageChanged', loadAppointments);
</script>
```

### Example 5: Chatbot Integration

```javascript
// In your chatbot message handler
function handleUserMessage(message) {
  const lang = i18n.getLanguage();
  
  // Send language context to API
  fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: message,
      language: lang  // Send language to backend
    })
  });
}
```

---

## Adding New Translations

### Step 1: Add to English (en.json)

```json
{
  "newSection": {
    "newKey": "My new text"
  }
}
```

### Step 2: Add to Tamil (ta.json)

```json
{
  "newSection": {
    "newKey": "என் புதிய உரை"
  }
}
```

### Step 3: Add to Hindi (hi.json)

```json
{
  "newSection": {
    "newKey": "मेरा नया पाठ"
  }
}
```

### Step 4: Use in HTML or JavaScript

```html
<p data-i18n="newSection.newKey">My new text</p>
```

or

```javascript
console.log(i18n.t('newSection.newKey'));
```

---

## Automatic Language Switcher

The system **automatically creates** a language dropdown in the navbar. You don't need to add it manually!

**Features:**
- ✅ Appears in top navigation
- ✅ Remembers user's choice (localStorage)
- ✅ Updates entire page when changed
- ✅ Shows language names in their own script (Tamil: தமிழ், Hindi: हिन्दी)

---

## Language Persistence

User's language preference is saved in `localStorage` as `language`. It persists across:
- ✅ Page refreshes
- ✅ Browser sessions
- ✅ Different pages within the app

To clear: `localStorage.removeItem('language')`

---

## Backend Integration

### Sending Language to API

```javascript
const language = i18n.getLanguage();

fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: message,
    language: language  // 'en', 'ta', or 'hi'
  })
});
```

### API Response Example

```json
{
  "message": "Success",
  "messageTa": "வெற்றி",
  "messageHi": "सफलता"
}
```

---

## Translation Keys Reference

### Common Keys Used in App:

```
navigation.login
navigation.register
buttons.submit
buttons.login
auth.email
auth.password
patient.dashboard
doctor.dashboard
chatbot.title
medicine.searchMedicines
messages.success
messages.error
validation.required
```

See `translations/en.json` for complete key reference.

---

## Troubleshooting

### Issue: Translations not loading

**Solution 1:** Make sure `js/i18n.js` is included before your other scripts

**Solution 2:** Verify translation files are in `translations/` folder at the correct path

**Solution 3:** Check browser console for errors (DevTools → Console)

### Issue: Language not persisting

**Solution:** Check if localStorage is enabled in browser settings

### Issue: Text shows key instead of translation

**Causes:**
- Missing translation key in the JSON file
- Typo in the key name
- Wrong data-i18n attribute syntax

**Fix:** Verify key names in translation JSON files

---

## Browser Support

✅ All modern browsers that support:
- Fetch API
- localStorage
- CustomEvent
- ES6 JavaScript

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

---

## Performance Notes

- ✅ Translations loaded once on page load
- ✅ Language switching is instant (no page reload)
- ✅ Minimal memory footprint
- ✅ No external dependencies required

---

## API Reference

### i18n.t(key, params)
Get translated string

```javascript
i18n.t('navigation.login')  // Returns "Login"
i18n.t('messages.error')    // Returns "An error occurred"
```

### i18n.setLanguage(code)
Change current language

```javascript
i18n.setLanguage('ta')  // Switch to Tamil
```

### i18n.getLanguage()
Get current language code

```javascript
i18n.getLanguage()  // Returns 'en', 'ta', or 'hi'
```

### i18n.getSupportedLanguages()
Get array of supported languages

```javascript
i18n.getSupportedLanguages()  // ['en', 'ta', 'hi']
```

### i18n.getLanguageName()
Get current language display name

```javascript
i18n.getLanguageName()  // 'English' or 'Tamil (தமிழ்)' etc.
```

### i18n.updatePageTranslations()
Manually update all DOM translations

```javascript
i18n.updatePageTranslations()
```

---

## Next Steps

1. ✅ Include `<script src="js/i18n.js"></script>` in all HTML files
2. ✅ Add `data-i18n` attributes to static text elements
3. ✅ Use `i18n.t()` in JavaScript for dynamic content
4. ✅ Test language switching in the navigation dropdown
5. ✅ Verify localStorage persistence works
6. ✅ Add more translations as needed

---

**Questions?** Check `translations/` folder for all available keys!
