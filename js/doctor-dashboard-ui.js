/**
 * Doctor Dashboard UI - Real-time Appointment Request Manager
 * 
 * Manages incoming appointment requests from patients:
 * 1. Real-time notification popups
 * 2. Accept/Decline workflow
 * 3. List of pending requests
 * 4. Request details display
 * 5. Doctor availability status
 */

class DoctorDashboardUI {
  constructor() {
    this.doctorId = null;
    this.pendingRequests = new Map(); // appointmentId -> request data
    this.notificationPopups = new Map(); // appointmentId -> popup element
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    console.log('[Doctor Dashboard UI] Setting up...');

    // Wait for Firebase auth
    if (!window.auth) {
      setTimeout(() => this.setup(), 100);
      return;
    }

    // Get current doctor
    window.auth.onAuthStateChanged((user) => {
      if (user) {
        this.doctorId = user.uid;
        this.startListeningForRequests();
      }
    });
  }

  startListeningForRequests() {
    console.log('[Doctor Dashboard UI] Starting listener for doctor:', this.doctorId);

    if (!window.appointmentManager) {
      console.log('[Doctor Dashboard UI] Waiting for appointment manager...');
      setTimeout(() => this.startListeningForRequests(), 500);
      return;
    }

    // Initialize appointment manager for this doctor
    window.appointmentManager.init(this.doctorId);

    console.log('[Doctor Dashboard UI] Appointment manager initialized');
  }

  /**
   * Add incoming request to pending list
   */
  addPendingRequest(appointmentId, requestData) {
    console.log('[Doctor Dashboard UI] Adding pending request:', appointmentId);

    this.pendingRequests.set(appointmentId, requestData);

    // Update UI list
    this.updatePendingRequestsList();

    // Show notification popup
    this.showNotificationPopup(appointmentId, requestData);
  }

  /**
   * Update the list of pending requests in the dashboard
   */
  updatePendingRequestsList() {
    const listContainer = document.getElementById('incoming-requests-list');
    if (!listContainer) return;

    if (this.pendingRequests.size === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <p>No incoming appointment requests</p>
        </div>
      `;
      return;
    }

    let html = '<div class="requests-grid">';

    for (const [appointmentId, request] of this.pendingRequests) {
      const urgencyClass = this.getUrgencyClass(request.severity);

      html += `
        <div class="request-card ${urgencyClass}" data-appointment-id="${appointmentId}">
          <div class="request-header">
            <div class="request-title">
              <h3>${request.patientName}</h3>
              <div class="request-time">${this.formatRequestTime(request.createdAt)}</div>
            </div>
            <div class="urgency-badge ${urgencyClass}">
              ${this.getUrgencyBadge(request.severity)}
            </div>
          </div>

          <div class="request-details">
            <div class="detail">
              <span class="label">Age:</span>
              <span class="value">${request.age}</span>
            </div>
            <div class="detail">
              <span class="label">Gender:</span>
              <span class="value">${request.gender}</span>
            </div>
            <div class="detail">
              <span class="label">Requested Time:</span>
              <span class="value">${request.appointmentTime}</span>
            </div>
          </div>

          <div class="symptoms-section">
            <strong>Symptoms:</strong>
            <div class="symptoms-list">
              ${request.symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join('')}
            </div>
          </div>

          ${request.duration ? `
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${request.duration}</span>
            </div>
          ` : ''}

          <div class="request-actions">
            <button class="btn-accept" onclick="window.doctorDashboardUI.acceptRequest('${appointmentId}')">
              ✓ Accept
            </button>
            <button class="btn-decline" onclick="window.doctorDashboardUI.declineRequest('${appointmentId}')">
              ✗ Decline
            </button>
          </div>
        </div>
      `;
    }

    html += '</div>';
    listContainer.innerHTML = html;
  }

  /**
   * Show notification popup for incoming request
   */
  showNotificationPopup(appointmentId, requestData) {
    console.log('[Doctor Dashboard UI] Showing notification for:', appointmentId);

    // Check if notification already exists
    if (this.notificationPopups.has(appointmentId)) {
      return;
    }

    const urgencyClass = this.getUrgencyClass(requestData.severity);
    const timeoutMs = this.getTimeoutMs(requestData.severity);

    const popupHTML = `
      <div class="appointment-notification" data-appointment-id="${appointmentId}">
        <div class="notification-top-bar ${urgencyClass}"></div>
        
        <div class="notification-content">
          <button class="notification-close" onclick="window.doctorDashboardUI.dismissNotification('${appointmentId}')">×</button>

          <div class="notification-header">
            <h3>📋 New Appointment Request</h3>
            <span class="notification-time">${this.formatRequestTime(requestData.createdAt)}</span>
          </div>

          <div class="notification-patient-info">
            <div class="patient-name">${requestData.patientName}</div>
            <div class="patient-details">
              ${requestData.age} • ${requestData.gender}
            </div>
          </div>

          <div class="notification-symptoms">
            <strong>Symptoms:</strong>
            <div class="symptoms-list">
              ${requestData.symptoms.slice(0, 3).map(s => `<span class="symptom-tag">${s}</span>`).join('')}
              ${requestData.symptoms.length > 3 ? `<span class="symptom-tag">+${requestData.symptoms.length - 3}</span>` : ''}
            </div>
          </div>

          <div class="notification-time-info">
            <strong>Requested:</strong> ${requestData.appointmentTime}
          </div>

          <div class="notification-actions">
            <button class="btn-accept" onclick="window.doctorDashboardUI.acceptRequest('${appointmentId}')">
              Accept
            </button>
            <button class="btn-decline" onclick="window.doctorDashboardUI.declineRequest('${appointmentId}')">
              Decline
            </button>
          </div>

          <div class="notification-timer">
            <span id="timer-${appointmentId}"></span>
          </div>
        </div>
      </div>
    `;

    // Create popup container if needed
    let popupContainer = document.getElementById('notifications-container');
    if (!popupContainer) {
      popupContainer = document.createElement('div');
      popupContainer.id = 'notifications-container';
      popupContainer.className = 'notifications-container';
      document.body.appendChild(popupContainer);
    }

    // Add popup to container
    const popupElement = document.createElement('div');
    popupElement.innerHTML = popupHTML;
    const notificationElement = popupElement.firstElementChild;
    popupContainer.appendChild(notificationElement);

    // Store reference
    this.notificationPopups.set(appointmentId, notificationElement);

    // Play notification sound
    this.playNotificationSound();

    // Start timer for auto-dismiss
    let remainingTime = timeoutMs / 1000;
    const timerInterval = setInterval(() => {
      remainingTime--;
      const timerElement = document.getElementById(`timer-${appointmentId}`);
      if (timerElement) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerElement.textContent = `Auto-dismiss in ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        this.dismissNotification(appointmentId);
      }
    }, 1000);

    // Auto-dismiss after timeout
    setTimeout(() => {
      if (this.notificationPopups.has(appointmentId)) {
        this.dismissNotification(appointmentId);
      }
    }, timeoutMs);
  }

  /**
   * Dismiss notification popup
   */
  dismissNotification(appointmentId) {
    const notification = this.notificationPopups.get(appointmentId);
    if (notification) {
      notification.classList.add('dismiss');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
        this.notificationPopups.delete(appointmentId);
      }, 300);
    }
  }

  /**
   * Accept appointment request
   */
  async acceptRequest(appointmentId) {
    console.log('[Doctor Dashboard UI] Accepting request:', appointmentId);

    try {
      if (!window.appointmentBookingEngine) {
        throw new Error('Appointment Booking Engine not available');
      }

      // Call appointment engine to accept
      const result = await window.appointmentBookingEngine.acceptAppointment(
        appointmentId,
        this.doctorId
      );

      if (result.success) {
        // Show confirmation message
        this.showConfirmationMessage(appointmentId, 'accepted');

        // Remove from pending
        this.pendingRequests.delete(appointmentId);

        // Dismiss notification
        this.dismissNotification(appointmentId);

        // Update list
        this.updatePendingRequestsList();

        // Redirect to video room after 2 seconds
        setTimeout(() => {
          window.location.href = `video-room.html?appointmentId=${appointmentId}`;
        }, 2000);
      } else {
        alert('Failed to accept appointment. Please try again.');
      }
    } catch (error) {
      console.error('[Doctor Dashboard UI] Error accepting request:', error);
      alert('Error: ' + error.message);
    }
  }

  /**
   * Decline appointment request
   */
  async declineRequest(appointmentId) {
    console.log('[Doctor Dashboard UI] Declining request:', appointmentId);

    try {
      if (!window.appointmentBookingEngine) {
        throw new Error('Appointment Booking Engine not available');
      }

      // Call appointment engine to decline
      const result = await window.appointmentBookingEngine.declineAppointment(
        appointmentId,
        this.doctorId
      );

      if (result.success) {
        // Show confirmation message
        this.showConfirmationMessage(appointmentId, 'declined');

        // Remove from pending
        this.pendingRequests.delete(appointmentId);

        // Dismiss notification
        this.dismissNotification(appointmentId);

        // Update list
        this.updatePendingRequestsList();
      } else {
        alert('Failed to decline appointment. Please try again.');
      }
    } catch (error) {
      console.error('[Doctor Dashboard UI] Error declining request:', error);
      alert('Error: ' + error.message);
    }
  }

  /**
   * Show confirmation message
   */
  showConfirmationMessage(appointmentId, action) {
    let messageText = '';
    let className = '';

    if (action === 'accepted') {
      messageText = '✓ Appointment accepted! Preparing video call...';
      className = 'success';
    } else if (action === 'declined') {
      messageText = '✗ Appointment declined.';
      className = 'declined';
    }

    // Create toast message
    const toast = document.createElement('div');
    toast.className = `confirmation-toast ${className}`;
    toast.textContent = messageText;
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    if (!CONFIG.NOTIFICATIONS.SOUND_ENABLED) {
      return;
    }

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
      console.log('[Doctor Dashboard UI] Could not play sound:', error);
    }
  }

  /**
   * Update doctor availability status
   */
  updateAvailabilityStatus(status) {
    const statusElement = document.getElementById('doctor-availability-status');
    if (!statusElement) return;

    const statusClass = status === 'available' ? 'available' : 'away';
    statusElement.className = `availability-status ${statusClass}`;
    statusElement.textContent = status === 'available' ? '🟢 Available' : '🔴 Away';
  }

  /**
   * Helper: Get urgency badge text
   */
  getUrgencyBadge(severity) {
    const badges = {
      'emergency': '⚠️ EMERGENCY',
      'urgent': '⚡ URGENT',
      'normal': 'Normal'
    };
    return badges[severity] || 'Normal';
  }

  /**
   * Helper: Get urgency CSS class
   */
  getUrgencyClass(severity) {
    const classes = {
      'emergency': 'severity-emergency',
      'urgent': 'severity-urgent',
      'normal': 'severity-normal'
    };
    return classes[severity] || 'severity-normal';
  }

  /**
   * Helper: Get timeout in milliseconds
   */
  getTimeoutMs(severity) {
    return CONFIG.APPOINTMENT.SEVERITY_TIMEOUTS[severity] || CONFIG.APPOINTMENT.DEFAULT_TIMEOUT_MS;
  }

  /**
   * Helper: Format request creation time
   */
  formatRequestTime(timestamp) {
    if (!timestamp) return 'Just now';

    const now = new Date();
    const requestTime = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const diffMs = now - requestTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  /**
   * Helper: Format appointment time for display
   */
  formatAppointmentTime(date, time) {
    return `${date} at ${time}`;
  }
}

// Initialize when page loads
let doctorDashboardUI;

function initDoctorDashboardUI() {
  doctorDashboardUI = new DoctorDashboardUI();
  window.doctorDashboardUI = doctorDashboardUI;
  console.log('✓ Doctor Dashboard UI initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDoctorDashboardUI);
} else {
  initDoctorDashboardUI();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DoctorDashboardUI;
}
