/**
 * VIDEO ROOM MANAGER
 * 
 * Manages video consultation room setup and Jitsi Meet integration
 * 
 * Handles:
 * 1. Appointment data retrieval
 * 2. Jitsi room creation with unique IDs
 * 3. Pre-join countdown timer
 * 4. Video quality settings and optimization
 * 5. Participant tracking (patient/doctor)
 * 6. Call duration monitoring
 * 7. End call and cleanup
 * 8. Network quality monitoring
 */

import { auth, db } from "./firebase.js";

class VideoRoomManager {
  constructor() {
    this.appointmentId = null;
    this.appointment = null;
    this.jitsiApi = null;
    this.roomName = null;
    this.participantRole = null; // 'patient' or 'doctor'
    this.isLocalAudioEnabled = true;
    this.isLocalVideoEnabled = true;
    this.countdownInterval = null;
    this.durationInterval = null;
    this.callStartTime = null;
    this.networkQuality = 'good';
  }

  /**
   * Initialize video room from URL params or appointment ID
   */
  async init() {
    console.log('[Video Room Manager] Initializing...');

    // Get appointment ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.appointmentId = urlParams.get('appointmentId');

    if (!this.appointmentId) {
      console.error('[Video Room Manager] No appointment ID provided');
      this.showError('No appointment found. Please book an appointment first.');
      return false;
    }

    try {
      // Fetch appointment details
      await this.loadAppointmentDetails();

      // Determine role (patient or doctor)
      this.determineParticipantRole();

      // Generate room name
      this.generateRoomName();

      // Setup Jitsi Meet
      this.setupJitsiMeet();

      // Start countdown
      this.startCountdown();

      console.log('[Video Room Manager] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Video Room Manager] Initialization error:', error);
      this.showError('Failed to initialize video room: ' + error.message);
      return false;
    }
  }

  /**
   * Load appointment details from Firestore
   */
  async loadAppointmentDetails() {
    console.log('[Video Room Manager] Loading appointment:', this.appointmentId);

    try {
      if (!window.appointmentBookingEngine) {
        throw new Error('Appointment Booking Engine not available');
      }

      const appointment = await window.appointmentBookingEngine.getAppointment(this.appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      this.appointment = appointment;
      console.log('[Video Room Manager] Appointment loaded:', appointment);

      // Update UI with appointment details
      this.displayAppointmentDetails(appointment);
    } catch (error) {
      console.error('[Video Room Manager] Error loading appointment:', error);
      throw error;
    }
  }

  /**
   * Display appointment details on the page
   */
  displayAppointmentDetails(appointment) {
    // Patient name
    const patientNameEl = document.getElementById('video-patient-name');
    if (patientNameEl) {
      patientNameEl.textContent = appointment.patientName || 'Patient';
    }

    // Doctor name
    const doctorNameEl = document.getElementById('video-doctor-name');
    if (doctorNameEl) {
      doctorNameEl.textContent = appointment.acceptedBy || 'Dr. Healthcare Provider';
    }

    // Appointment time
    const appointmentTimeEl = document.getElementById('video-appointment-time');
    if (appointmentTimeEl) {
      appointmentTimeEl.textContent = `${appointment.date} at ${appointment.time}`;
    }

    // Symptoms
    const symptomsEl = document.getElementById('video-symptoms');
    if (symptomsEl && appointment.symptoms && appointment.symptoms.length > 0) {
      symptomsEl.innerHTML = appointment.symptoms
        .map(s => `<span class="symptom-badge">${s}</span>`)
        .join('');
    }

    // Consultation fee
    const feeEl = document.getElementById('video-consultation-fee');
    if (feeEl) {
      feeEl.textContent = `₹${CONFIG.APPOINTMENT.CONSULTATION_FEE}`;
    }
  }

  /**
   * Determine if current user is patient or doctor
   */
  determineParticipantRole() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if user is patient or doctor
    // Patient: appointment.patientId === currentUser.uid
    // Doctor: appointment.acceptedBy === currentUser.uid
    if (this.appointment.patientId === currentUser.uid) {
      this.participantRole = 'patient';
    } else if (this.appointment.acceptedBy === currentUser.uid) {
      this.participantRole = 'doctor';
    } else {
      throw new Error('User is not part of this appointment');
    }

    console.log('[Video Room Manager] Participant role:', this.participantRole);

    // Set display name
    const displayNameEl = document.getElementById('participant-role');
    if (displayNameEl) {
      displayNameEl.textContent = this.participantRole === 'patient' ? 'Patient' : 'Doctor';
    }
  }

  /**
   * Generate unique room name from appointment ID
   */
  generateRoomName() {
    // Use appointment ID as basis for room name
    // Format: appt-{appointmentId}
    // Must be URL-safe, lowercase
    this.roomName = `appt-${this.appointmentId.toLowerCase().replace(/[^a-z0-9-]/g, '')}`;

    console.log('[Video Room Manager] Room name:', this.roomName);
  }

  /**
   * Setup Jitsi Meet API
   */
  setupJitsiMeet() {
    console.log('[Video Room Manager] Setting up Jitsi Meet');

    // Jitsi configuration
    const options = {
      roomName: this.roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startAudioOnly: false,
        disableModeratorIndicator: true,
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableNoAudioDetectionOnStart: true,
        // Quality settings
        constraints: {
          video: {
            height: { ideal: 720, max: 1080 },
            width: { ideal: 1280, max: 1920 }
          }
        },
        // Network quality monitoring
        enableNetworkQualityIndicator: true,
        // Recording
        fileRecordingsEnabled: false,
        // Screen sharing
        desktopSharingChromeExtId: null,
        // Chat
        disableChatMessageEditing: false
      },
      interfaceConfigOverwrite: {
        DISABLE_FOCUS_INDICATOR: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        MOBILE_APP_PROMO: false,
        AUTHENTICATION_ENABLE: false,
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats'
        ]
      }
    };

    // Create Jitsi API
    try {
      const JitsiMeetExternalAPI = window.JitsiMeetExternalAPI;
      if (!JitsiMeetExternalAPI) {
        throw new Error('Jitsi API not loaded');
      }

      this.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', options);

      // Setup event listeners
      this.setupJitsiEventListeners();

      console.log('[Video Room Manager] Jitsi Meet initialized');
    } catch (error) {
      console.error('[Video Room Manager] Error setting up Jitsi:', error);
      throw error;
    }
  }

  /**
   * Setup Jitsi event listeners
   */
  setupJitsiEventListeners() {
    if (!this.jitsiApi) return;

    // User joined
    this.jitsiApi.addEventListener('participantJoined', (participant) => {
      console.log('[Video Room Manager] Participant joined:', participant);
      this.onParticipantJoined(participant);
    });

    // User left
    this.jitsiApi.addEventListener('participantLeft', (participant) => {
      console.log('[Video Room Manager] Participant left:', participant);
      this.onParticipantLeft(participant);
    });

    // Ready to close
    this.jitsiApi.addEventListener('readyToClose', () => {
      console.log('[Video Room Manager] Ready to close');
      this.onReadyToClose();
    });

    // Display name change
    this.jitsiApi.addEventListener('displayNameChange', (data) => {
      console.log('[Video Room Manager] Display name changed:', data);
    });

    // Audio availability change
    this.jitsiApi.addEventListener('audioAvailabilityChanged', (data) => {
      console.log('[Video Room Manager] Audio availability:', data);
    });

    // Video availability change
    this.jitsiApi.addEventListener('videoAvailabilityChanged', (data) => {
      console.log('[Video Room Manager] Video availability:', data);
    });

    // Video conference joined
    this.jitsiApi.addEventListener('videoConferenceJoined', () => {
      console.log('[Video Room Manager] Video conference joined');
      this.onConferenceJoined();
    });

    // Video conference left
    this.jitsiApi.addEventListener('videoConferenceLeft', () => {
      console.log('[Video Room Manager] Video conference left');
      this.onConferenceLeft();
    });
  }

  /**
   * Start pre-join countdown
   */
  startCountdown() {
    const countdownEl = document.getElementById('pre-join-countdown');
    if (!countdownEl) {
      this.autoJoinRoom();
      return;
    }

    const countdownDuration = 5; // 5 seconds
    let remaining = countdownDuration;

    const updateCountdown = () => {
      if (remaining > 0) {
        countdownEl.textContent = `Joining in ${remaining}s...`;
        remaining--;
      } else {
        clearInterval(this.countdownInterval);
        this.autoJoinRoom();
      }
    };

    updateCountdown(); // Initial display
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  /**
   * Auto-join the video room
   */
  autoJoinRoom() {
    console.log('[Video Room Manager] Auto-joining room');

    // Hide countdown
    const countdownEl = document.getElementById('pre-join-countdown');
    if (countdownEl) {
      countdownEl.style.display = 'none';
    }

    // The Jitsi API will automatically join when initialized
    // Start monitoring call duration
    this.startCallDurationMonitor();
  }

  /**
   * Start call duration monitor
   */
  startCallDurationMonitor() {
    this.callStartTime = new Date();
    const durationEl = document.getElementById('call-duration');

    if (!durationEl) return;

    const updateDuration = () => {
      const elapsed = Math.floor((new Date() - this.callStartTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;

      let display = '';
      if (hours > 0) {
        display = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      durationEl.textContent = display;
    };

    updateDuration(); // Initial display
    this.durationInterval = setInterval(updateDuration, 1000);
  }

  /**
   * Handle participant joined
   */
  onParticipantJoined(participant) {
    const participantListEl = document.getElementById('participant-list');
    if (participantListEl) {
      const participantEl = document.createElement('div');
      participantEl.className = 'participant-item';
      participantEl.id = `participant-${participant.id}`;
      participantEl.innerHTML = `
        <div class="participant-avatar">👤</div>
        <div class="participant-info">
          <div class="participant-name">${participant.displayName || 'Participant'}</div>
          <div class="participant-status">Connected</div>
        </div>
      `;
      participantListEl.appendChild(participantEl);
    }
  }

  /**
   * Handle participant left
   */
  onParticipantLeft(participant) {
    const participantEl = document.getElementById(`participant-${participant.id}`);
    if (participantEl) {
      participantEl.remove();
    }
  }

  /**
   * Handle conference joined
   */
  onConferenceJoined() {
    console.log('[Video Room Manager] Conference joined');

    // Update status
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.className = 'status-connected';
      statusEl.textContent = '🟢 Connected';
    }

    // Hide join button, show controls
    const joinBtn = document.getElementById('join-room-btn');
    if (joinBtn) {
      joinBtn.style.display = 'none';
    }

    const controls = document.getElementById('room-controls');
    if (controls) {
      controls.style.display = 'flex';
    }

    // Store appointment as active
    this.updateAppointmentStatus('active');
  }

  /**
   * Handle conference left
   */
  onConferenceLeft() {
    console.log('[Video Room Manager] Conference left');

    // Clear duration monitor
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }

    // Update status
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.className = 'status-disconnected';
      statusEl.textContent = '🔴 Disconnected';
    }

    // Show end call message
    this.showCallEndedMessage();

    // Update appointment status
    this.updateAppointmentStatus('completed');
  }

  /**
   * Handle ready to close
   */
  onReadyToClose() {
    console.log('[Video Room Manager] Ready to close');
    setTimeout(() => {
      window.location.href = 'patient.html';
    }, 3000);
  }

  /**
   * Toggle local audio
   */
  toggleAudio() {
    if (!this.jitsiApi) return;

    this.isLocalAudioEnabled = !this.isLocalAudioEnabled;
    this.jitsiApi.executeCommand('toggleAudio');

    const audioBtn = document.getElementById('toggle-audio-btn');
    if (audioBtn) {
      audioBtn.classList.toggle('disabled');
      audioBtn.innerHTML = this.isLocalAudioEnabled ? '🎤' : '🔇';
    }
  }

  /**
   * Toggle local video
   */
  toggleVideo() {
    if (!this.jitsiApi) return;

    this.isLocalVideoEnabled = !this.isLocalVideoEnabled;
    this.jitsiApi.executeCommand('toggleVideo');

    const videoBtn = document.getElementById('toggle-video-btn');
    if (videoBtn) {
      videoBtn.classList.toggle('disabled');
      videoBtn.innerHTML = this.isLocalVideoEnabled ? '📹' : '📹';
    }
  }

  /**
   * End the call
   */
  endCall() {
    console.log('[Video Room Manager] Ending call');

    if (this.jitsiApi) {
      this.jitsiApi.dispose();
    }

    this.updateAppointmentStatus('completed');
    window.location.href = 'patient.html';
  }

  /**
   * Update appointment status in Firestore
   */
  async updateAppointmentStatus(status) {
    try {
      if (!window.appointmentBookingEngine) {
        return;
      }

      const updateData = {
        status: status,
        lastUpdated: new Date()
      };

      if (status === 'active') {
        updateData.startedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
        if (this.callStartTime) {
          updateData.duration = Math.floor((new Date() - this.callStartTime) / 1000);
        }
      }

      await window.appointmentBookingEngine.updateAppointmentStatus(
        this.appointmentId,
        status,
        updateData
      );

      console.log('[Video Room Manager] Appointment status updated:', status);
    } catch (error) {
      console.error('[Video Room Manager] Error updating status:', error);
    }
  }

  /**
   * Show call ended message
   */
  showCallEndedMessage() {
    const messageEl = document.getElementById('call-ended-message');
    if (messageEl) {
      messageEl.style.display = 'block';
      messageEl.innerHTML = `
        <div class="call-ended-container">
          <h3>Call Ended</h3>
          <p>Thank you for the consultation</p>
          <p style="font-size: 12px; color: #999;">Redirecting to dashboard...</p>
        </div>
      `;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = message;
    } else {
      alert(message);
    }
  }
}

// Initialize when page loads
let videoRoomManager;

async function initVideoRoomManager() {
  try {
    // Wait for Firebase to be ready
    if (!window.auth) {
      setTimeout(initVideoRoomManager, 100);
      return;
    }

    // Wait for appointment booking engine
    if (!window.appointmentBookingEngine) {
      setTimeout(initVideoRoomManager, 100);
      return;
    }

    videoRoomManager = new VideoRoomManager();
    window.videoRoomManager = videoRoomManager;

    const success = await videoRoomManager.init();
    if (success) {
      console.log('✓ Video Room Manager initialized');
    }
  } catch (error) {
    console.error('[Video Room Manager] Initialization failed:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoRoomManager);
} else {
  initVideoRoomManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoRoomManager;
}
