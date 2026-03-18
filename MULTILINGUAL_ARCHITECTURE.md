# Multilingual System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Browser                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HTML File (e.g., patient.html)                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ <head>                                                      │  │
│  │   <script src="js/i18n.js"></script>  ←── LOAD FIRST!     │  │
│  │ </head>                                                     │  │
│  │ <body>                                                      │  │
│  │   <h1 data-i18n="sections.hero.title">...</h1>            │  │
│  │   <button data-i18n="buttons.login">...</button>          │  │
│  │   <input data-i18n-attr="placeholder:auth.email" />       │  │
│  │                                                             │  │
│  │   <script src="script.js"></script>                        │  │
│  │ </body>                                                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  i18n.js Initialization                                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 1. Create i18n instance                                    │  │
│  │ 2. Load translation files (en.json, ta.json, hi.json)     │  │
│  │ 3. Parse JSON and store in memory                         │  │
│  │ 4. Detect saved language (localStorage)                   │  │
│  │ 5. Create language switcher in navbar                     │  │
│  │ 6. Update DOM elements (data-i18n attributes)            │  │
│  │ 7. Dispatch i18nReady event                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  DOM Updates                                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ [English]  → <h1>Welcome to Care Without Borders</h1>      │  │
│  │ [Tamil]    → <h1>Care Without Borders இல் வரவேற்கிறோம்</h1>│  │
│  │ [Hindi]    → <h1>Care Without Borders में आपका स्वागत है</h1>│  │
│  │                                                             │  │
│  │ Language Switcher Added (auto-created)                    │  │
│  │ ┌──────────────────────────────────┐                      │  │
│  │ │ ▼ Select Language                │                      │  │
│  │ │ □ English                        │                      │  │
│  │ │ □ Tamil (தமிழ்)                 │                      │  │
│  │ │ □ Hindi (हिन्दी)                │                      │  │
│  │ └──────────────────────────────────┘                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  User Interaction                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 1. User selects language from dropdown                     │  │
│  │ 2. i18n.setLanguage(language) called                       │  │
│  │ 3. localStorage updated with language preference          │  │
│  │ 4. DOM updated with new translations                      │  │
│  │ 5. languageChanged event dispatched                       │  │
│  │ 6. App-specific listeners handle updates                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  JavaScript Usage                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ window.addEventListener('i18nReady', () => {              │  │
│  │   loadAppData();                                           │  │
│  │ });                                                         │  │
│  │                                                             │  │
│  │ window.addEventListener('languageChanged', (e) => {       │  │
│  │   console.log('Language:', e.detail.language);            │  │
│  │   reloadPageContent();                                     │  │
│  │ });                                                         │  │
│  │                                                             │  │
│  │ // Get translation                                         │  │
│  │ const text = i18n.t('messages.success');                  │  │
│  │                                                             │  │
│  │ // Change language                                         │  │
│  │ i18n.setLanguage('ta');                                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  Server Communication                                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ POST /api/chat                                             │  │
│  │ {                                                           │  │
│  │   "message": "What is the cure for fever?",               │  │
│  │   "language": "ta"  ← Send current language              │  │
│  │ }                                                           │  │
│  │                                                             │  │
│  │ Response:                                                   │  │
│  │ {                                                           │  │
│  │   "response": "Drink water and rest...",                  │  │
│  │   "translation": "நீ குடி மற்றும் ஓய்வறவும்..."           │  │
│  │ }                                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Language Change Event

```
User selects language from dropdown
        ↓
    <select> change event
        ↓
i18n.setLanguage('ta')
        ↓
┌───────────────────────────────┐
│ 1. Update currentLanguage     │
│ 2. Save to localStorage       │
│ 3. Update HTML[lang] attr     │
│ 4. Run updatePageTranslations()│
│ 5. Dispatch 'languageChanged' │
└───────────────────────────────┘
        ↓
    Browser re-renders
        ↓
┌───────────────────────────────┐
│ Find all [data-i18n] elements │
│ Set textContent to translated │
│ Find all [data-i18n-attr]     │
│ Update specified attributes   │
│ Page visible in new language  │
└───────────────────────────────┘
        ↓
   Event listeners fire
        ↓
window event: 'languageChanged'
        ↓
App-specific handlers update
UI, fetch new content, etc.
```

---

## File Dependencies

```
HTML Files
│
├─→ index.html
│   ├─→ <script src="js/i18n.js"></script>
│   ├─→ translations/en.json
│   ├─→ translations/ta.json
│   └─→ translations/hi.json
│
├─→ patient.html
│   └─→ js/i18n.js
│
├─→ doctor.html
│   └─→ js/i18n.js
│
├─→ login.html
│   └─→ js/i18n.js
│
└─→ chatbot.html
    └─→ js/i18n.js

JavaScript Files
│
├─→ script.js
│   └─→ Uses i18n.t() for dynamic content
│
├─→ js/patient.js
│   └─→ Listens to languageChanged events
│
├─→ js/chatbot-utils.js
│   └─→ Gets language from i18n.getLanguage()
│
└─→ api/openai-chatbot.js
    └─→ Sends language to backend
```

---

## Component Architecture

```
┌────────────────────────────────────────────────────┐
│                  i18n System                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  i18n Class                                  │ │
│  ├──────────────────────────────────────────────┤ │
│  │  Properties:                                 │ │
│  │  - currentLanguage: String                   │ │
│  │  - translations: Object {en, ta, hi}         │ │
│  │  - supportedLanguages: ['en', 'ta', 'hi']   │ │
│  │                                              │ │
│  │  Methods:                                    │ │
│  │  - init(): Initialize and load files        │ │
│  │  - t(key): Get translated string            │ │
│  │  - setLanguage(code): Change language       │ │
│  │  - getLanguage(): Get current language      │ │
│  │  - updatePageTranslations(): Update DOM     │ │
│  │  - addLanguageSwitcher(): Add dropdown      │ │
│  │  - hasKey(key): Check if key exists         │ │
│  └──────────────────────────────────────────────┘ │
│                      ↓                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  Translation Files                           │ │
│  ├──────────────────────────────────────────────┤ │
│  │  en.json    (200+ keys)                      │ │
│  │  ├─ brand                                    │ │
│  │  ├─ navigation                               │ │
│  │  ├─ buttons                                  │ │
│  │  ├─ auth                                     │ │
│  │  ├─ patient                                  │ │
│  │  ├─ doctor                                   │ │
│  │  ├─ chatbot                                  │ │
│  │  ├─ medicine                                 │ │
│  │  ├─ messages                                 │ │
│  │  └─ validation                               │ │
│  │                                              │ │
│  │  ta.json    (Tamil translations)             │ │
│  │  hi.json    (Hindi translations)             │ │
│  └──────────────────────────────────────────────┘ │
│                      ↓                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  DOM Integration                             │ │
│  ├──────────────────────────────────────────────┤ │
│  │  <h1 data-i18n="key">Text</h1>              │ │
│  │  <input data-i18n-attr="attr:key" />        │ │
│  │  <div data-i18n-html="key">HTML</div>       │ │
│  │                                              │ │
│  │  Auto-created Language Switcher:             │ │
│  │  <select id="language-select">               │ │
│  │    <option value="en">English</option>       │ │
│  │    <option value="ta">Tamil</option>         │ │
│  │    <option value="hi">Hindi</option>         │ │
│  │  </select>                                   │ │
│  └──────────────────────────────────────────────┘ │
│                      ↓                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  Storage (localStorage)                      │ │
│  ├──────────────────────────────────────────────┤ │
│  │  Key: 'language'                             │ │
│  │  Value: 'en' | 'ta' | 'hi'                  │ │
│  │  Persists across sessions                    │ │
│  └──────────────────────────────────────────────┘ │
│                      ↓                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  Events                                      │ │
│  ├──────────────────────────────────────────────┤ │
│  │  i18nReady: Fired when initialized           │ │
│  │  languageChanged: Fired on language switch   │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Translation Key Hierarchy

```
translations/en.json
│
├── brand
│   ├── name: "Care Without Borders"
│   ├── tagline: "Accessible Healthcare..."
│   └── icon: "❤️"
│
├── navigation
│   ├── admin, doctor, login, register
│   ├── logout, home, profile
│   └── appointments, prescriptions, ...
│
├── buttons
│   ├── common: getStarted, login, register, submit, cancel
│   ├── actions: save, delete, edit, search, apply
│   └── specialized: bookAppointment, scheduleConsultation
│
├── sections
│   ├── stats: patients, doctors, clinics
│   ├── hero: title, subtitle
│   └── features: telemedicine, aiChatbot, ...
│
├── auth
│   ├── fields: email, password, fullName, phoneNumber
│   ├── options: male, female, other
│   └── actions: signIn, signUp, forgotPassword
│
├── patient
│   ├── dashboard, upcomingAppointments, appointmentHistory
│   ├── medicalHistory, symptoms, medicalRecords
│   └── noAppointments
│
├── doctor
│   ├── dashboard, myPatients, upcomingConsultations
│   ├── prescriptionPanel, createPrescription
│   └── specialization, availability, consultationFee
│
├── chatbot
│   ├── title: "VILGAX AI Assistant"
│   ├── messageInput, send, startChat
│   └── askMeAnything, symptoms, medicines, diseases
│
├── medicine
│   ├── searchMedicines, medicineName, composition
│   ├── manufacturer, price, dosage
│   └── sideEffects, useFor, precautions
│
├── messages
│   ├── basic: success, error, loading, confirm
│   ├── auth: loginRequired, sessionExpired, invalidCredentials
│   ├── validation: userNotFound, emailAlreadyUsed, passwordMismatch
│   └── deleteConfirm
│
├── validation
│   ├── required, invalidEmail, passwordTooShort, invalidPhone
│   └── [Form validation messages]
│
└── settings
    ├── language, theme, notifications
    ├── privacy, aboutUs, contactUs
    └── helpSupport
```

---

## Initialization Sequence

```
1. HTML loads
   ↓
2. Parse <script src="js/i18n.js"></script>
   ↓
3. i18n = new I18n()
   ↓
4. if (document.readyState === 'loading')
     → Add DOMContentLoaded listener
   else
     → Call i18n.init() immediately
   ↓
5. i18n.init() process:
   ├─ Load translations/en.json
   ├─ Load translations/ta.json
   ├─ Load translations/hi.json
   ├─ Parse all JSON files
   ├─ Get stored language from localStorage
   ├─ Call setLanguage()
   ├─ Call updatePageTranslations()
   ├─ Call addLanguageSwitcher()
   └─ Dispatch i18nReady event
   ↓
6. Page displays with translations
   ↓
7. Your app scripts load
   ↓
8. window.addEventListener('i18nReady', ...)
   ↓
9. App initialization complete
```

---

## Memory Usage

```
Typical Translation File Size:
- en.json: ~15-20 KB
- ta.json: ~20-25 KB (Unicode)
- hi.json: ~20-25 KB (Unicode)

Total in Memory: ~50-70 KB

Language Switcher HTML: ~2 KB

Total i18n System: ~100 KB max

This is negligible for modern browsers and networks.
```

---

## Supported Attributes

```html
<!-- Text content translation -->
<h1 data-i18n="key.name">Fallback text</h1>

<!-- HTML content translation (be careful with XSS) -->
<div data-i18n-html="key.name">Fallback <b>HTML</b></div>

<!-- Attribute translation (single attribute) -->
<input 
  type="text"
  data-i18n-attr="placeholder:key.name"
/>

<!-- Multiple attribute translation -->
<input 
  type="text"
  data-i18n-attr="placeholder:key.name; title:key.another"
/>

<!-- Image alt text -->
<img 
  src="image.jpg"
  data-i18n-attr="alt:image.alt"
/>

<!-- Button title -->
<button data-i18n-attr="title:buttons.help">?</button>
```

---

## Error Handling Strategy

```
Try to load translation
  ↓
├─ Success → Use translation
├─ Missing key → Fallback to English
├─ Missing language file → Switch to English
├─ Network error → Use cached/previously loaded
└─ Parse error → Log warning, use key name

Result: App always shows something readable
```

---

This architecture ensures:
✅ Scalability - Easy to add more languages
✅ Performance - Translations loaded once
✅ Maintainability - Centralized translation files
✅ Flexibility - Works with any framework
✅ Accessibility - Automatic language switching
✅ Persistence - User preference saved
