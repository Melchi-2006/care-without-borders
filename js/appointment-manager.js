/**
 * APPOINTMENT MANAGER
 * 
 * Real-time appointment status management for doctor dashboard
 * 
 * Handles:
 * 1. Real-time notification of incoming appointment requests
 * 2. Doctor acceptance/decline workflow
 * 3. Patient status tracking
 * 4. Notification UI and sound alerts
 * 5. Video room setup after acceptance
 */

import { auth, db } from "./firebase.js";

class AppointmentManager {
  constructor() {
    this.currentDoctorId = null;
    this.listeners = new Map();
    this.activeNotifications = new Map();
    this.notificationAudio = null;
  }

  async init(doctorId) {
    this.currentDoctorId = doctorId;
    console.log('[Appointment Manager] Initialized for doctor:', doctorId);

    // Start listening to incoming appointment requests
    if (window.appointmentBookingEngine) {
      window.appointmentBookingEngine.listenToIncomingRequests(
        doctorId,
        (requests) => this.handleIncomingRequests(requests)
      );
    }
  }

  /**
   * Handle incoming appointment requests
   * Show notification popup for each new request
   * 
   * @param {array} requests - Array of pending appointment requests
   */
  handleIncomingRequests(requests) {
    console.log('[Appointment Manager] Incoming requests:', requests.length);

    requests.forEach(request => {
      // Check if already showing notification for this request
      if (!this.activeNotifications.has(request.appointmentId)) {
        this.showNotificationPopup(request);
        this.playNotificationSound();

        // Also add to doctor dashboard UI if available
        if (window.doctorDashboardUI) {
          window.doctorDashboardUI.addPendingRequest(request.appointmentId, {
            patientName: request.patientName,
            age: request.patientAge || request.age || 'N/A',
            gender: request.gender || 'N/A',
            symptoms: request.symptoms || [],
            appointmentTime: `${request.date} at ${request.time}`,
            createdAt: request.createdAt || new Date(),
            severity: request.severity || 'normal'
          });
        }
      }
    });
  }

  /**
   * Show notification popup for appointment request
   * @param {object} request - Request details
   */
  showNotificationPopup(request) {
    const existingPopup = document.getElementById(`notification-${request.appointmentId}`);
    if (existingPopup) {
      existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.id = `notification-${request.appointmentId}`;
    popup.className = 'appointment-notification-popup';

    const severityClass = request.severity || 'normal';
    popup.innerHTML = `
      <div class="notification-content severity-${severityClass}">
        <div class="notification-header">
          <h3>📥 New Appointment Request</h3>
          <button class="notification-close" onclick="this.closest('.appointment-notification-popup').remove()">✕</button>
        </div>

        <div class="notification-patient-info">
          <div class="patient-detail">
            <span class="label">Patient:</span>
            <span class="value">${request.patientName}</span>
          </div>
          <div class="patient-detail">
            <span class="label">Age:</span>
            <span class="value">${request.patientAge || 'N/A'}</span>
          </div>
          <div class="patient-detail">
            <span class="label">Symptoms:</span>
            <span class="value">${(request.symptoms || []).join(', ') || 'General consultation'}</span>
          </div>
          <div class="patient-detail">
            <span class="label">Requested Time:</span>
            <span class="value">${request.date} at ${request.time}</span>
          </div>
        </div>

        <div class="notification-actions">
          <button class="btn-accept" onclick="window.appointmentManager.acceptRequest('${request.appointmentId}')">
            ✓ Accept
          </button>
          <button class="btn-decline" onclick="window.appointmentManager.declineRequest('${request.appointmentId}')">
            ✕ Decline
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    this.activeNotifications.set(request.appointmentId, popup);

    // Auto-remove after timeout (doctor's choice in severity)
    const timeout = request.expiresAt 
      ? new Date(request.expiresAt).getTime() - Date.now()
      : 180000; // 3 minutes default

    setTimeout(() => {
      if (popup && popup.parentNode) {
        popup.remove();
      }
      this.activeNotifications.delete(request.appointmentId);
    }, timeout);
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    if (typeof window.vilgaxAudio !== 'undefined' && window.vilgaxAudio.playNotificationSound) {
      window.vilgaxAudio.playNotificationSound();
    } else {
      // Fallback: simple beep using Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('[Appointment Manager] Could not play sound');
      }
    }
  }

  /**
   * Doctor accepts appointment request
   * @param {string} appointmentId - Appointment ID
   */
  async acceptRequest(appointmentId) {
    console.log('[Appointment Manager] Accepting appointment:', appointmentId);

    try {
      // Call appointment engine to accept
      if (window.appointmentBookingEngine) {
        await window.appointmentBookingEngine.acceptAppointment(
          appointmentId,
          this.currentDoctorId
        );
      }

      // Remove notification popup
      const popup = this.activeNotifications.get(appointmentId);
      if (popup && popup.parentNode) {
        popup.remove();
      }
      this.activeNotifications.delete(appointmentId);

      // Remove from dashboard UI
      if (window.doctorDashboardUI) {
        window.doctorDashboardUI.pendingRequests.delete(appointmentId);
        window.doctorDashboardUI.updatePendingRequestsList();
      }

      // Show confirmation message
      this.showConfirmationMessage(appointmentId, 'accepted');

      // Navigate to appointment details / video room
      setTimeout(() => {
        window.location.href = `video-room.html?appointmentId=${appointmentId}`;
      }, 2000);

    } catch (error) {
      console.error('[Appointment Manager] Error accepting request:', error);
      alert('Error accepting appointment. Please try again.');
    }
  }

  /**
   * Doctor declines appointment request
   * @param {string} appointmentId - Appointment ID
   */
  async declineRequest(appointmentId) {
    console.log('[Appointment Manager] Declining appointment:', appointmentId);

    try {
      // Call appointment engine to decline
      if (window.appointmentBookingEngine) {
        await window.appointmentBookingEngine.declineAppointment(
          appointmentId,
          this.currentDoctorId
        );
      }

      // Remove notification popup
      const popup = this.activeNotifications.get(appointmentId);
      if (popup && popup.parentNode) {
        popup.remove();
      }
      this.activeNotifications.delete(appointmentId);

      // Remove from dashboard UI
      if (window.doctorDashboardUI) {
        window.doctorDashboardUI.pendingRequests.delete(appointmentId);
        window.doctorDashboardUI.updatePendingRequestsList();
      }

      // Show message
      this.showConfirmationMessage(appointmentId, 'declined');

    } catch (error) {
      console.error('[Appointment Manager] Error declining request:', error);
    }
  }

  /**
   * Show confirmation message to doctor
   * @param {string} appointmentId - Appointment ID
   * @param {string} action - 'accepted' or 'declined'
   */
  showConfirmationMessage(appointmentId, action) {
    const message = document.createElement('div');
    message.className = `confirmation-message ${action}`;
    message.textContent = action === 'accepted' 
      ? '✓ Appointment accepted! Preparing video call...'
      : '✕ Appointment declined.';

    document.body.appendChild(message);

    setTimeout(() => {
      message.classList.add('show');
    }, 100);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  /**
   * Get appointment details
   * @param {string} appointmentId - Appointment ID
   */
  async getAppointmentDetails(appointmentId) {
    if (window.appointmentBookingEngine) {
      return await window.appointmentBookingEngine.getAppointment(appointmentId);
    }
    return null;
  }

  /**
   * Cleanup on page unload
   */
  cleanup() {
    if (window.appointmentBookingEngine) {
      window.appointmentBookingEngine.stopListeningToRequests(this.currentDoctorId);
    }
  }
}

// Initialize when script loads in doctor pages
let appointmentManager;

function initAppointmentManager() {
  if (typeof db !== 'undefined' && typeof appointmentBookingEngine !== 'undefined') {
    appointmentManager = new AppointmentManager();
    window.appointmentManager = appointmentManager;
    
    // Auto-init if doctor is logged in
    if (typeof auth !== 'undefined' && auth.currentUser) {
      // Check if user is a doctor
      setTimeout(() => {
        appointmentManager.init(auth.currentUser.uid);
      }, 500);
    }

    console.log('✓ Appointment Manager initialized');
    return appointmentManager;
  } else {
    return new Promise((resolve) => {
      setTimeout(() => initAppointmentManager().then(resolve), 500);
    });
  }
}

// Auto-initialize when imported as module or loaded as script
if (typeof db !== 'undefined') {
  initAppointmentManager();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (appointmentManager) {
    appointmentManager.cleanup();
  }
});

export default AppointmentManager;
export { initAppointmentManager };
