/**
 * VILGAX Role Selection Popup
 * 
 * Shows Patient/Administrator/Doctor role selection popup
 * Appears on every page visit until user signs in
 * Redirects user to appropriate page after role selection
 * 
 * Usage: Load in index.html or any landing page
 * - Checks if user is already authenticated (skip popup)
 * - Shows popup on first visit per session
 * - Stores role selection in sessionStorage (temporary)
 */

class VilgaxRolePopup {
  constructor() {
    this.isShown = false;
    this.selectedRole = null;
    
    // Wait for DOM to be ready and Firebase to initialize
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Wait a moment for Firebase auth to initialize
    setTimeout(() => {
      this.checkAndShowPopup();
    }, 1000);
  }

  checkAndShowPopup() {
    // If already shown in this session, don't show again
    if (sessionStorage.getItem('vilgax_role_popup_shown')) {
      return;
    }

    // Check if user is already authenticated
    // (firebase.js should already be loaded)
    if (typeof auth !== 'undefined' && auth.currentUser) {
      // User is signed in, don't show popup
      return;
    }

    // Show the role selection popup
    this.showPopup();
  }

  showPopup() {
    // Remove any existing popup
    const existing = document.getElementById('vilgax-role-popup-container');
    if (existing) existing.remove();

    // Create popup container
    const container = document.createElement('div');
    container.id = 'vilgax-role-popup-container';
    container.className = 'vilgax-role-popup-overlay';

    // Get translations or use defaults
    const t = (key, defaultText) => {
      if (typeof window.i18n !== 'undefined' && window.i18n.t) {
        return window.i18n.t(key);
      }
      return defaultText;
    };

    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'vilgax-role-popup';

    popup.innerHTML = `
      <div class="vilgax-role-popup-content">
        <div class="vilgax-role-popup-header">
          <h2>${t('rolePopup.title', 'Who are you?')}</h2>
          <p>${t('rolePopup.subtitle', 'Select your role to continue')}</p>
        </div>

        <div class="vilgax-role-popup-options">
          <!-- Patient Option -->
          <div class="role-option" data-role="patient" onclick="window.vilgaxRolePopupInstance.selectRole('patient')">
            <div class="role-icon">👤</div>
            <h3>${t('roles.patient', 'Patient')}</h3>
            <p>${t('rolePopup.patientDesc', 'Book appointments & consult doctors')}</p>
          </div>

          <!-- Doctor Option -->
          <div class="role-option" data-role="doctor" onclick="window.vilgaxRolePopupInstance.selectRole('doctor')">
            <div class="role-icon">👨‍⚕️</div>
            <h3>${t('roles.doctor', 'Doctor')}</h3>
            <p>${t('rolePopup.doctorDesc', 'Manage appointments & consultations')}</p>
          </div>

          <!-- Administrator Option -->
          <div class="role-option" data-role="admin" onclick="window.vilgaxRolePopupInstance.selectRole('admin')">
            <div class="role-icon">🔧</div>
            <h3>${t('roles.admin', 'Administrator')}</h3>
            <p>${t('rolePopup.adminDesc', 'Manage platform & users')}</p>
          </div>
        </div>

        <div class="vilgax-role-popup-footer">
          <p>${t('rolePopup.alreadyHaveAccount', 'Already have an account?')} <a href="login.html">${t('buttons.login', 'Login')}</a></p>
        </div>
      </div>
    `;

    container.appendChild(popup);
    document.body.appendChild(container);

    // Add fade-in animation
    setTimeout(() => {
      container.classList.add('show');
    }, 100);

    this.isShown = true;
  }

  selectRole(role) {
    this.selectedRole = role;

    // Mark popup as shown in this session
    sessionStorage.setItem('vilgax_role_popup_shown', 'true');
    sessionStorage.setItem('vilgax_selected_role', role);

    // Get the popup container
    const container = document.getElementById('vilgax-role-popup-container');

    // Add fade-out animation
    if (container) {
      container.classList.remove('show');
      container.classList.add('fade-out');
    }

    // Redirect based on role after animation
    setTimeout(() => {
      this.redirectByRole(role);
    }, 300);
  }

  redirectByRole(role) {
    const redirects = {
      patient: 'patient.html',
      doctor: 'doctor-login.html', // or doctor-register.html
      admin: 'admin.html'
    };

    const targetPage = redirects[role] || 'index.html';
    
    console.log(`[VILGAX Role Popup] Redirecting to: ${targetPage}`);
    window.location.href = targetPage;
  }
}

// Initialize when script loads
const vilgaxRolePopupInstance = new VilgaxRolePopup();
window.vilgaxRolePopupInstance = vilgaxRolePopupInstance;

console.log('✓ VILGAX Role Selection Popup loaded');
