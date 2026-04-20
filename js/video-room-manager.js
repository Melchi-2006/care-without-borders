/**
 * Video Room Manager - Jitsi Meet Integration
 * 
 * Handles video consultation setup:
 * 1. Unique room ID generation from appointmentId
 * 2. Pre-join countdown timer (5 minutes)
 * 3. Jitsi Meet API initialization
 * 4. Participant tracking (patient/doctor)
 * 5. Chat integration during call
 * 6. Call recording and end handling
 * 7. Video quality settings
 */

import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class VideoRoomManager {
  constructor() {
    this.appointmentId = null;
    this.roomId = null;
    this.jitsiApi = null;
    this.isJoined = false;
    this.countdownTimer = null;
    this.currentUser = null;
    this.userRole = null; // 'patient' or 'doctor'
    this.otherParticipant = null;
  }

  /**
   * Initialize video room from appointment ID
   */
  async init(appointmentId) {
    console.log('[Video Room Manager] Initializing with appointment:', appointmentId);

    this.appointmentId = appointmentId;
    this.roomId = this.generateRoomId(appointmentId);

    // Wait for Firebase auth
    if (!window.auth) {
      setTimeout(() => this.init(appointmentId), 100);
      return;
    }

    // Get current user
    window.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
        this.getUserRole();
      }
    });
  }

  /**
   * Generate unique room ID from appointmentId
   * Format: cwb-appointment-{last8chars}
   */
  generateRoomId(appointmentId) {
    // Use last 8 characters of appointment ID for room name
    const roomName = 'cwb-' + appointmentId.slice(-8).toLowerCase();
    console.log('[Video Room Manager] Generated room ID:', roomName);
    return roomName;
  }

  /**
   * Determine if current user is patient or doctor
   */
  async getUserRole() {
    try {
      const userDoc = await getDoc(doc(window.db, 'users', this.currentUser.uid));
      
      if (userDoc.exists()) {
        this.userRole = userDoc.data().role || 'patient';
        console.log('[Video Room Manager] User role:', this.userRole);
        this.displayAppointmentDetails();
        this.startCountdown();
      }
    } catch (error) {
      console.error('[Video Room Manager] Error getting user role:', error);
    }
  }

  /**
   * Display appointment details before joining
   */
  async displayAppointmentDetails() {
    try {
      const appointmentDoc = await getDoc(doc(window.db, 'appointments', this.appointmentId));
      
      if (!appointmentDoc.exists()) {
        console.error('[Video Room Manager] Appointment not found');
        return;
      }

      const appointment = appointmentDoc.data();
      const detailsContainer = document.getElementById('appointment-details-container');

      if (!detailsContainer) return;

      const patientInfo = this.userRole === 'doctor' 
        ? appointment.patientName
        : 'Dr. ' + (appointment.acceptedByName || 'Healthcare Provider');

      const specialization = this.userRole === 'doctor'
        ? appointment.specialization
        : appointment.specialization;

      detailsContainer.innerHTML = `
        <div class="appointment-info">
          <div class="info-header">
            <h2 data-i18n="pages.videoConsultation.videoConsultation">Video Consultation</h2>
            <span class="appointment-status">
              <span class="status-dot active"></span>
              <span data-i18n="appointment.status.confirmed">Confirmed</span>
            </span>
          </div>

          <div class="participant-section">
            <div class="participant">
              <div class="participant-role">${this.userRole === 'doctor' ? 'Patient' : 'Doctor'}</div>
              <div class="participant-name">${patientInfo}</div>
              <div class="participant-spec">${specialization || 'General Practice'}</div>
            </div>
          </div>

          <div class="appointment-details-grid">
            <div class="detail">
              <span class="label" data-i18n="appointment.date">Date</span>
              <span class="value">${appointment.date || 'Today'}</span>
            </div>
            <div class="detail">
              <span class="label" data-i18n="appointment.time">Time</span>
              <span class="value">${appointment.time || 'Now'}</span>
            </div>
            <div class="detail">
              <span class="label" data-i18n="appointment.duration">Duration</span>
              <span class="value">15 minutes</span>
            </div>
            <div class="detail">
              <span class="label" data-i18n="pages.videoConsultation.consultationFee">Fee</span>
              <span class="value">₹500</span>
            </div>
          </div>

          ${appointment.symptoms ? `
            <div class="symptoms-section">
              <strong data-i18n="patientAssistant.greeting">Symptoms</strong>
              <div class="symptoms-list">
                ${appointment.symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      this.otherParticipant = patientInfo;
    } catch (error) {
      console.error('[Video Room Manager] Error displaying appointment:', error);
    }
  }

  /**
   * Start pre-join countdown timer (5 minutes)
   */
  startCountdown() {
    const timerContainer = document.getElementById('countdown-timer-container');
    if (!timerContainer) {
      console.log('[Video Room Manager] Timer container not found');
      return;
    }

    let remainingSeconds = 300; // 5 minutes

    const updateDisplay = () => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      timerContainer.innerHTML = `
        <div class="countdown">
          <div class="countdown-display">
            <div class="countdown-number">
              ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
            </div>
            <div class="countdown-label" data-i18n="appointment.preparingVideo">Preparing video call...</div>
          </div>
          <div class="countdown-info">
            <p data-i18n="appointment.waitingForDoctor">
              ${this.userRole === 'doctor' 
                ? 'Waiting for patient to join...' 
                : 'Waiting for doctor to join...'}
            </p>
          </div>
          <button class="btn-join-now" onclick="window.videoRoomManager.joinRoom()">
            Join Now
          </button>
        </div>
      `;
    };

    updateDisplay();

    this.countdownTimer = setInterval(() => {
      remainingSeconds--;

      if (remainingSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.joinRoom();
      } else {
        updateDisplay();
      }
    }, 1000);
  }

  /**
   * Join the Jitsi Meet video room
   */
  async joinRoom() {
    console.log('[Video Room Manager] Joining room:', this.roomId);

    if (this.isJoined) {
      console.log('[Video Room Manager] Already joined');
      return;
    }

    try {
      // Clear countdown
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
      }

      // Hide pre-join UI
      const preJoinContainer = document.getElementById('countdown-timer-container');
      if (preJoinContainer) {
        preJoinContainer.style.display = 'none';
      }

      // Show video frame
      const videoFrame = document.getElementById('jitsi-meet-container');
      if (!videoFrame) {
        console.error('[Video Room Manager] Video frame container not found');
        return;
      }

      videoFrame.style.display = 'block';

      // Initialize Jitsi Meet API
      await this.initJitsiAPI(videoFrame);

      // Mark as joined
      this.isJoined = true;

      // Update appointment status
      await this.updateAppointmentStatus('active');

      // Show call duration timer
      this.startCallTimer();
    } catch (error) {
      console.error('[Video Room Manager] Error joining room:', error);
      alert('Error starting video call. Please refresh and try again.');
    }
  }

  /**
   * Initialize Jitsi Meet API
   */
  async initJitsiAPI(container) {
    console.log('[Video Room Manager] Initializing Jitsi Meet API');

    return new Promise((resolve, reject) => {
      // Wait for Jitsi Meet API to be available
      if (!window.JitsiMeetExternalAPI) {
        setTimeout(() => this.initJitsiAPI(container).then(resolve).catch(reject), 500);
        return;
      }

      try {
        const options = {
          roomName: this.roomId,
          width: '100%',
          height: '100%',
          parentNode: container,
          interfaceConfigOverrides: {
            DISABLE_AUDIO_LEVELS: false,
            DISABLE_PRESENCE_STATUS: false,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
            SHOW_JITSI_WATERMARK: true,
            DEFAULT_BACKGROUND: '#000',
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 
              'fullscreen', 'fodeviceselection', 'hangup', 'chat',
              'settings', 'raisehand', 'videoquality', 'filmstrip'
            ]
          },
          configOverrides: {
            startAudioMuted: 0,
            startVideoMuted: false,
            defaultLanguage: document.documentElement.lang || 'en',
            enableTcc: true,
            enableLipSync: true,
            p2p: {
              enabled: true,
              stunServers: [
                { urls: ['stun:stun.l.google.com:19302'] },
                { urls: ['stun:stun1.l.google.com:19302'] }
              ]
            }
          },
          userInfo: {
            displayName: this.currentUser.displayName || this.currentUser.email,
            email: this.currentUser.email
          }
        };

        // Create Jitsi Meet API instance
        this.jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', options);

        // Handle API events
        this.setupJitsiEventHandlers();

        resolve();
      } catch (error) {
        console.error('[Video Room Manager] Error initializing Jitsi:', error);
        reject(error);
      }
    });
  }

  /**
   * Setup event handlers for Jitsi Meet API
   */
  setupJitsiEventHandlers() {
    if (!this.jitsiApi) return;

    // Ready event
    this.jitsiApi.addEventListeners({
      onReadyToClose: () => this.handleCallEnd(),
      participantJoined: (event) => this.handleParticipantJoined(event),
      participantLeft: (event) => this.handleParticipantLeft(event),
      videoConferenceJoined: (event) => this.handleConferenceJoined(event),
      videoConferenceLeft: (event) => this.handleConferenceLeft(event),
      chatUpdated: (event) => this.handleChatMessage(event),
      dominantSpeakerChanged: (event) => this.handleDominantSpeaker(event),
      screenShareToggled: (event) => this.handleScreenShare(event)
    });

    console.log('[Video Room Manager] Jitsi event handlers configured');
  }

  /**
   * Start call duration timer
   */
  startCallTimer() {
    let callDuration = 0;
    const maxDuration = 900; // 15 minutes

    const timerElement = document.getElementById('call-duration-timer');
    if (!timerElement) return;

    const updateTimer = () => {
      const minutes = Math.floor(callDuration / 60);
      const seconds = callDuration % 60;
      
      timerElement.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (callDuration >= maxDuration) {
        // Auto-end call after 15 minutes
        console.log('[Video Room Manager] Call time limit reached');
        this.endCall();
      }
    };

    const timerInterval = setInterval(() => {
      callDuration++;
      updateTimer();
    }, 1000);

    // Store interval for cleanup
    this.callTimerInterval = timerInterval;
  }

  /**
   * Handle participant joined event
   */
  handleParticipantJoined(event) {
    console.log('[Video Room Manager] Participant joined:', event.id);

    const participantList = document.getElementById('participant-list');
    if (participantList) {
      const currentCount = participantList.querySelectorAll('.participant-item').length;
      
      if (currentCount === 0) {
        // First participant (other user) joined
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.innerHTML = `
          <span class="participant-status">🟢</span>
          <span class="participant-name">${this.otherParticipant || 'Participant'}</span>
          <span class="participant-video-indicator">📹</span>
        `;
        participantList.appendChild(item);
      }
    }
  }

  /**
   * Handle participant left event
   */
  handleParticipantLeft(event) {
    console.log('[Video Room Manager] Participant left:', event.id);

    const participantList = document.getElementById('participant-list');
    if (participantList) {
      const items = participantList.querySelectorAll('.participant-item');
      if (items.length > 0) {
        items[0].remove();
      }
    }
  }

  /**
   * Handle video conference joined
   */
  handleConferenceJoined(event) {
    console.log('[Video Room Manager] Conference joined');

    const statusElement = document.getElementById('call-status');
    if (statusElement) {
      statusElement.className = 'call-status active';
      statusElement.innerHTML = '<span class="status-dot"></span> In Call';
    }
  }

  /**
   * Handle video conference left (call ended)
   */
  handleConferenceLeft(event) {
    console.log('[Video Room Manager] Conference left');
    this.handleCallEnd();
  }

  /**
   * Handle chat message
   */
  handleChatMessage(event) {
    console.log('[Video Room Manager] Chat message:', event);

    if (event.message) {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
          <strong>${event.from || 'Other'}</strong>: ${event.message}
        `;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }
  }

  /**
   * Handle dominant speaker changed
   */
  handleDominantSpeaker(event) {
    console.log('[Video Room Manager] Dominant speaker:', event.id);
  }

  /**
   * Handle screen share toggle
   */
  handleScreenShare(event) {
    console.log('[Video Room Manager] Screen share toggled:', event.sharing);
  }

  /**
   * End the video call
   */
  async endCall() {
    console.log('[Video Room Manager] Ending call');

    try {
      // Stop call timer
      if (this.callTimerInterval) {
        clearInterval(this.callTimerInterval);
      }

      // Dispose Jitsi API
      if (this.jitsiApi) {
        this.jitsiApi.dispose();
        this.jitsiApi = null;
      }

      // Update appointment status
      await this.updateAppointmentStatus('completed');

      // Show end call screen
      this.showCallEndScreen();
    } catch (error) {
      console.error('[Video Room Manager] Error ending call:', error);
    }
  }

  /**
   * Show call end summary screen
   */
  showCallEndScreen() {
    const container = document.getElementById('jitsi-meet-container');
    if (!container) return;

    container.innerHTML = `
      <div class="call-end-screen">
        <h2>✓ Call Ended</h2>
        <p>Thank you for using Care Without Borders</p>
        
        <div class="call-summary">
          <div class="summary-item">
            <span class="label">Duration:</span>
            <span class="value" id="final-duration">15:00</span>
          </div>
          <div class="summary-item">
            <span class="label">Consultation Fee:</span>
            <span class="value">₹500</span>
          </div>
          <div class="summary-item">
            <span class="label">Status:</span>
            <span class="value">Completed</span>
          </div>
        </div>

        <div class="call-end-actions">
          <button class="btn-primary" onclick="window.location.href='patient.html'">
            Back to Dashboard
          </button>
          <button class="btn-secondary" onclick="window.location.href='video-consultation-component.html'">
            View Recording
          </button>
        </div>

        <div class="call-feedback">
          <p>How was your experience?</p>
          <div class="rating-stars">
            <span onclick="window.videoRoomManager.submitRating(1)">⭐</span>
            <span onclick="window.videoRoomManager.submitRating(2)">⭐</span>
            <span onclick="window.videoRoomManager.submitRating(3)">⭐</span>
            <span onclick="window.videoRoomManager.submitRating(4)">⭐</span>
            <span onclick="window.videoRoomManager.submitRating(5)">⭐</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle call end event
   */
  async handleCallEnd() {
    console.log('[Video Room Manager] Call ended');
    await this.endCall();
  }

  /**
   * Update appointment status in Firestore
   */
  async updateAppointmentStatus(status) {
    try {
      await updateDoc(doc(window.db, 'appointments', this.appointmentId), {
        status: status,
        updatedAt: new Date()
      });

      console.log('[Video Room Manager] Appointment status updated:', status);
    } catch (error) {
      console.error('[Video Room Manager] Error updating appointment:', error);
    }
  }

  /**
   * Submit call rating
   */
  async submitRating(rating) {
    try {
      await updateDoc(doc(window.db, 'appointments', this.appointmentId), {
        rating: rating,
        ratedAt: new Date()
      });

      console.log('[Video Room Manager] Rating submitted:', rating);
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('[Video Room Manager] Error submitting rating:', error);
    }
  }
}

// Initialize and export
const videoRoomManager = new VideoRoomManager();
window.videoRoomManager = videoRoomManager;

// Export for module usage
export default VideoRoomManager;
export async function initVideoRoomManager(appointmentId) {
  await videoRoomManager.init(appointmentId);
  return videoRoomManager;
}
