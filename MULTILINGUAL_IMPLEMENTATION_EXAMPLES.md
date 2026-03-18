# Multilingual Implementation - Quick Integration Examples

## 1. HTML File Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Care Without Borders</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- NAVIGATION -->
<nav class="navbar">
  <div class="logo">❤️ <span data-i18n="brand.name">Care Without Borders</span></div>
  <div class="nav-buttons">
    <!-- Language switcher will be auto-added here -->
    <button class="btn-outline" data-i18n="navigation.login" onclick="goLogin()">Login</button>
    <button class="btn-solid" data-i18n="navigation.register" onclick="goRegister()">Register</button>
  </div>
</nav>

<!-- HERO SECTION -->
<section class="hero">
  <div class="hero-left">
    <h1 data-i18n="sections.hero.title">Welcome to Care Without Borders</h1>
    <p data-i18n="sections.hero.subtitle">Accessible Healthcare for Everyone, Everywhere</p>
    <button class="btn-solid" data-i18n="buttons.getStarted" onclick="goRegister()">Get Started →</button>
  </div>
</section>

<!-- IMPORTANT: Load i18n FIRST, before other scripts -->
<script src="js/i18n.js"></script>

<!-- Then load your other scripts -->
<script src="script.js"></script>

</body>
</html>
```

---

## 2. JavaScript Usage in script.js

```javascript
/**
 * Your existing script.js with multilingual support added
 */

// Wait for i18n to be ready
window.addEventListener('i18nReady', () => {
  console.log('✓ Translations loaded');
});

// Update UI when language changes
window.addEventListener('languageChanged', (event) => {
  console.log(`Language changed to: ${event.detail.language}`);
  // Reload any language-dependent content here
  loadCounters();
});

// Function with translated strings
function showSuccessMessage() {
  const message = i18n.t('messages.success');
  const alertDiv = document.getElementById('alerts');
  alertDiv.textContent = message;
}

function showErrorMessage(errorKey = 'messages.error') {
  const message = i18n.t(errorKey);
  const alertDiv = document.getElementById('alerts');
  alertDiv.textContent = message;
}

// Authentication with translations
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      showErrorMessage('messages.invalidCredentials');
      return;
    }
    
    showSuccessMessage();
    // Redirect to dashboard
  } catch (error) {
    showErrorMessage();
  }
}

// Form validation with translations
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert(i18n.t('validation.invalidEmail'));
    return false;
  }
  return true;
}

function validatePassword(password) {
  if (password.length < 6) {
    alert(i18n.t('validation.passwordTooShort'));
    return false;
  }
  return true;
}
```

---

## 3. Patient Dashboard with Translations

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title data-i18n="patient.dashboard">Patient Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- Navigation with auto language switcher -->
<nav class="navbar">
  <div class="logo">❤️ <span data-i18n="brand.name">Care Without Borders</span></div>
  <div class="nav-buttons">
    <button class="btn-outline" data-i18n="navigation.logout" onclick="logout()">Logout</button>
  </div>
</nav>

<!-- Patient Dashboard -->
<div class="container">
  <h1 data-i18n="patient.dashboard">Patient Dashboard</h1>
  
  <section>
    <h2 data-i18n="patient.upcomingAppointments">Upcoming Appointments</h2>
    <button class="btn-solid" data-i18n="patient.bookNewAppointment">Book New Appointment</button>
    <div id="appointmentsList"></div>
  </section>

  <section>
    <h2 data-i18n="patient.medicalHistory">Medical History</h2>
    <div id="medicalHistory"></div>
  </section>

  <section>
    <h2 data-i18n="patient.prescriptions">Prescriptions</h2>
    <div id="prescriptionsList"></div>
  </section>
</div>

<script src="js/i18n.js"></script>
<script>
  // Load appointments with translated UI
  function loadAppointments() {
    const list = document.getElementById('appointmentsList');
    
    if (appointments.length === 0) {
      list.innerHTML = `<p>${i18n.t('patient.noAppointments')}</p>`;
      return;
    }
    
    let html = '<table>';
    appointments.forEach(apt => {
      html += `
        <tr>
          <td>${apt.doctor}</td>
          <td>${apt.date}</td>
          <td>${apt.time}</td>
          <td><button>${i18n.t('buttons.edit')}</button></td>
        </tr>
      `;
    });
    html += '</table>';
    list.innerHTML = html;
  }

  // Reload appointments when language changes
  window.addEventListener('languageChanged', loadAppointments);
  window.addEventListener('i18nReady', loadAppointments);
</script>

</body>
</html>
```

---

## 4. Chatbot Integration

```javascript
// In your chatbot.js or openai-chatbot.js

class ChatbotWithTranslations {
  constructor() {
    this.language = i18n.getLanguage();
    this.setupLanguageListener();
  }

  setupLanguageListener() {
    window.addEventListener('languageChanged', (event) => {
      this.language = event.detail.language;
      this.updateUITexts();
    });
  }

  updateUITexts() {
    const titleElement = document.querySelector('[data-i18n="chatbot.title"]');
    if (titleElement) {
      titleElement.textContent = i18n.t('chatbot.title');
    }
  }

  async sendMessage(userMessage) {
    // Send language context to API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        language: this.language
      })
    });

    const data = await response.json();
    return data.response;
  }

  displayPlaceholder() {
    return i18n.t('chatbot.messageInput');
  }

  getTitle() {
    return i18n.t('chatbot.title');
  }
}

// Usage
const chatbot = new ChatbotWithTranslations();
```

---

## 5. Form with Multilingual Validation

```html
<form id="loginForm">
  <div class="form-group">
    <label data-i18n="auth.email">Email</label>
    <input 
      type="email" 
      id="email"
      data-i18n-attr="placeholder:auth.email"
      required
    />
  </div>

  <div class="form-group">
    <label data-i18n="auth.password">Password</label>
    <input 
      type="password" 
      id="password"
      data-i18n-attr="placeholder:auth.password"
      required
    />
  </div>

  <button type="submit" data-i18n="buttons.login">Login</button>
</form>

<div id="errorMessages" class="error-container"></div>

<script src="js/i18n.js"></script>
<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessages');

    // Validation
    if (!email) {
      errorDiv.textContent = i18n.t('validation.required');
      return;
    }

    if (!email.includes('@')) {
      errorDiv.textContent = i18n.t('validation.invalidEmail');
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = i18n.t('validation.passwordTooShort');
      return;
    }

    // Submit form
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, language: i18n.getLanguage() })
      });

      if (response.ok) {
        errorDiv.textContent = i18n.t('messages.success');
        // Redirect to dashboard
      } else {
        errorDiv.textContent = i18n.t('messages.invalidCredentials');
      }
    } catch (error) {
      errorDiv.textContent = i18n.t('messages.error');
    }
  });
</script>
```

---

## 6. API Service with Language Support

```javascript
// In api/services or api/api-wrapper.js

class APIClient {
  constructor() {
    this.baseURL = '/api';
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept-Language': i18n.getLanguage()
    };
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        },
        body: options.body ? JSON.stringify({
          ...JSON.parse(options.body),
          language: i18n.getLanguage()
        }) : undefined
      });

      if (!response.ok) {
        const errorKey = `messages.error`;
        throw new Error(i18n.t(errorKey));
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new APIClient();
```

---

## 7. Notification/Alert System

```javascript
// Generic alert function with translations
function alert(key, type = 'info', duration = 3000) {
  const message = i18n.t(key);
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, duration);
}

// Usage
alert('messages.success', 'success');
alert('messages.error', 'error');
alert('validation.required', 'warning');

// Language-aware notification
function notifyUser(translationKey, options = {}) {
  const message = i18n.t(translationKey);
  console.log(`[${i18n.getLanguageName()}] ${message}`);
  
  if (options.showUI !== false) {
    alert(translationKey, options.type || 'info', options.duration || 3000);
  }
}

// Usage
notifyUser('messages.success');
notifyUser('messages.error', { type: 'error', duration: 5000 });
```

---

## 8. Firebase Service with Translations

```javascript
// In api/firebase-service.js

class FirebaseService {
  async createUser(email, password, language = 'en') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user with language preference
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        language: language,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return userCredential.user;
    } catch (error) {
      const errorKey = this.mapFirebaseErrorToTranslationKey(error.code);
      throw new Error(i18n.t(errorKey));
    }
  }

  mapFirebaseErrorToTranslationKey(errorCode) {
    const errorMap = {
      'auth/email-already-in-use': 'messages.emailAlreadyUsed',
      'auth/invalid-email': 'validation.invalidEmail',
      'auth/weak-password': 'validation.passwordTooShort',
      'auth/user-not-found': 'messages.userNotFound'
    };
    return errorMap[errorCode] || 'messages.error';
  }
}
```

---

## Testing Checklist

- [ ] Add `<script src="js/i18n.js"></script>` to all HTML files
- [ ] Verify language dropdown appears in navigation
- [ ] Test switching between English, Tamil, and Hindi
- [ ] Confirm translations update on language change
- [ ] Check localStorage persistence across page reloads
- [ ] Verify dynamic content uses `i18n.t()` correctly
- [ ] Test form validations show translated messages
- [ ] Test API calls include language parameter
- [ ] Check browser console for any i18n errors

---

## Deployment Notes

1. **File Structure**: Ensure `translations/` folder is in the root directory
2. **Paths**: Use relative paths like `translations/en.json` (not absolute)
3. **Permissions**: Make sure translation files are readable by the web server
4. **Caching**: Consider cache-busting for translation files if needed
5. **CDN**: If using CDN, ensure proper CORS headers for translation file loading

---

For more details, see **MULTILINGUAL_GUIDE.md**
