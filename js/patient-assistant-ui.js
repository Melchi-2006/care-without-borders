/**
 * Patient Health Assistant UI
 * 
 * Interactive UI for patient health consultations:
 * 1. Voice/text input capture
 * 2. Display extracted health details
 * 3. Show action options (Book Doctor, AI Diagnosis)
 * 4. Real-time appointment status tracking
 * 5. Integration with VILGAX assistant backend
 */

class PatientHealthAssistantUI {
  constructor() {
    this.assistantPanel = null;
    this.currentConsultation = null;
    this.isListening = false;
    this.speechRecognition = null;
    this.init();
  }

  init() {
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Check if patient assistant panel exists
    const panelContainer = document.getElementById('patient-assistant-container');
    if (!panelContainer) {
      console.log('[Patient Assistant UI] No panel container found');
      return;
    }

    // Initialize speech recognition
    this.setupSpeechRecognition();

    // Add event listeners
    this.attachEventListeners();

    console.log('[Patient Assistant UI] Initialized');
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Patient Assistant UI] Speech Recognition not supported');
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.language = document.documentElement.lang || 'en-US';

    this.speechRecognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceButtonUI(true);
      this.showVoiceIndicator('Listening...');
    };

    this.speechRecognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Update input field with recognized text
      const inputField = document.getElementById('assistant-text-input');
      if (inputField) {
        inputField.value = final || interim;
      }

      this.showVoiceIndicator(interim || final);
    };

    this.speechRecognition.onerror = (event) => {
      console.error('[Patient Assistant UI] Speech recognition error:', event.error);
      this.showVoiceIndicator(`Error: ${event.error}`);
      this.updateVoiceButtonUI(false);
    };

    this.speechRecognition.onend = () => {
      this.isListening = false;
      this.updateVoiceButtonUI(false);
      this.showVoiceIndicator('');
    };
  }

  attachEventListeners() {
    // Voice input button
    const voiceBtn = document.getElementById('assistant-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
    }

    // Text input
    const textInput = document.getElementById('assistant-text-input');
    if (textInput) {
      textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitHealthDetails();
        }
      });
    }

    // Submit button
    const submitBtn = document.getElementById('assistant-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitHealthDetails());
    }

    // Action buttons
    const bookDoctorBtn = document.getElementById('action-book-doctor');
    if (bookDoctorBtn) {
      bookDoctorBtn.addEventListener('click', () => this.startAppointmentBooking());
    }

    const diagnosisBtn = document.getElementById('action-get-diagnosis');
    if (diagnosisBtn) {
      diagnosisBtn.addEventListener('click', () => this.getAIDiagnosis());
    }

    const continueBtn = document.getElementById('action-continue-talking');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.continueTalking());
    }
  }

  toggleVoiceInput() {
    if (!this.speechRecognition) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    if (this.isListening) {
      this.speechRecognition.stop();
    } else {
      this.speechRecognition.start();
    }
  }

  updateVoiceButtonUI(isListening) {
    const voiceBtn = document.getElementById('assistant-voice-btn');
    if (voiceBtn) {
      if (isListening) {
        voiceBtn.classList.add('listening');
      } else {
        voiceBtn.classList.remove('listening');
      }
    }
  }

  showVoiceIndicator(text) {
    const indicator = document.getElementById('voice-indicator');
    if (indicator) {
      if (text) {
        indicator.textContent = text;
        indicator.style.display = 'block';
      } else {
        indicator.style.display = 'none';
      }
    }
  }

  async submitHealthDetails() {
    const textInput = document.getElementById('assistant-text-input');
    if (!textInput || !textInput.value.trim()) {
      alert('Please describe your symptoms');
      return;
    }

    const input = textInput.value;
    console.log('[Patient Assistant UI] Submitting health details:', input);

    // Show loading state
    this.showLoading(true);

    try {
      // Call VILGAX patient assistant to extract details
      if (!window.vilgaxPatientAssistant) {
        throw new Error('VILGAX Patient Assistant not loaded');
      }

      const response = await window.vilgaxPatientAssistant.processPatientInput(input);

      // Display extracted details
      this.displayExtractedDetails(response.details);

      // Show options
      this.displayActionOptions(response.options);

      // Store current consultation
      this.currentConsultation = response;

      // Clear input
      textInput.value = '';
    } catch (error) {
      console.error('[Patient Assistant UI] Error:', error);
      alert('Error processing health details. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  displayExtractedDetails(details) {
    const detailsContainer = document.getElementById('extracted-details-container');
    if (!detailsContainer) return;

    const mappings = {
      name: 'Name',
      age: 'Age',
      gender: 'Gender',
      location: 'Location',
      symptoms: 'Symptoms',
      duration: 'Duration'
    };

    let html = '<div class="extracted-details">';

    for (const [key, label] of Object.entries(mappings)) {
      const value = details[key];
      if (value) {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        html += `
          <div class="detail-row">
            <span class="detail-label">${label}:</span>
            <span class="detail-value">${displayValue}</span>
          </div>
        `;
      }
    }

    // Add suggested specialization
    if (details.suggestedSpecialization) {
      html += `
        <div class="detail-row">
          <span class="detail-label">Suggested Specialist:</span>
          <span class="detail-value" style="color: #0f766e; font-weight: bold;">
            ${details.suggestedSpecialization}
          </span>
        </div>
      `;
    }

    html += '</div>';
    detailsContainer.innerHTML = html;
    detailsContainer.style.display = 'block';
  }

  displayActionOptions(options) {
    const optionsContainer = document.getElementById('action-options-container');
    if (!optionsContainer) return;

    let html = '<div class="action-options-group">';

    options.forEach(option => {
      html += `
        <button 
          class="action-btn primary" 
          id="${option.id}"
          onclick="window.patientAssistantUI.handleActionClick('${option.action}')"
        >
          ${option.icon} ${option.label}
        </button>
      `;
    });

    html += '</div>';
    optionsContainer.innerHTML = html;
    optionsContainer.style.display = 'block';

    // Re-attach listeners
    this.attachEventListeners();
  }

  handleActionClick(action) {
    switch (action) {
      case 'BOOK_APPOINTMENT':
        this.startAppointmentBooking();
        break;
      case 'GET_AI_DIAGNOSIS':
        this.getAIDiagnosis();
        break;
      case 'CONTINUE_CONVERSATION':
        this.continueTalking();
        break;
    }
  }

  async startAppointmentBooking() {
    console.log('[Patient Assistant UI] Starting appointment booking');

    if (!this.currentConsultation) {
      alert('No health details available');
      return;
    }

    // Hide options
    const optionsContainer = document.getElementById('action-options-container');
    if (optionsContainer) {
      optionsContainer.style.display = 'none';
    }

    // Show appointment time selection
    const appointmentPanel = document.getElementById('appointment-time-selector');
    if (appointmentPanel) {
      appointmentPanel.style.display = 'block';
      appointmentPanel.innerHTML = `
        <div class="appointment-time-section">
          <h3>When would you like your appointment?</h3>
          <p>Tell us your preferred date and time (e.g., "Tomorrow at 2 PM" or "Next Monday morning")</p>
          <input 
            type="text" 
            id="appointment-time-input" 
            class="assistant-input"
            placeholder="e.g., Tomorrow at 2 PM, Next Monday morning..."
            onkeypress="if(event.key==='Enter') window.patientAssistantUI.confirmAppointmentTime()"
          />
          <button class="action-btn primary" onclick="window.patientAssistantUI.confirmAppointmentTime()">
            Confirm Time
          </button>
        </div>
      `;

      // Auto-focus input
      setTimeout(() => {
        const input = document.getElementById('appointment-time-input');
        if (input) input.focus();
      }, 100);
    }
  }

  async confirmAppointmentTime() {
    const timeInput = document.getElementById('appointment-time-input');
    if (!timeInput || !timeInput.value.trim()) {
      alert('Please provide an appointment time');
      return;
    }

    const appointmentTime = timeInput.value;
    console.log('[Patient Assistant UI] Confirming appointment time:', appointmentTime);

    this.showLoading(true);

    try {
      // Get appointment booking engine and parse datetime
      if (!window.appointmentBookingEngine) {
        throw new Error('Appointment Booking Engine not loaded');
      }

      const parsedDateTime = window.appointmentBookingEngine.parseAppointmentDateTime(appointmentTime);
      console.log('[Patient Assistant UI] Parsed datetime:', parsedDateTime);

      // Call VILGAX patient assistant to confirm booking
      const response = await window.vilgaxPatientAssistant.confirmAppointmentBooking(appointmentTime);

      if (response.type === 'APPOINTMENT_CONFIRMED') {
        // Find available doctors and send booking request
        await this.sendAppointmentToQueue(response.appointmentDetails, parsedDateTime);
      }
    } catch (error) {
      console.error('[Patient Assistant UI] Error confirming appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  async sendAppointmentToQueue(appointmentDetails, parsedDateTime) {
    try {
      const engine = window.appointmentBookingEngine;

      // Find available doctors
      const availableDoctors = await engine.findAvailableDoctors(
        appointmentDetails.specialization,
        parsedDateTime.dateTime
      );

      if (availableDoctors.length === 0) {
        alert('No doctors available for this specialty. Please try another time.');
        return;
      }

      console.log(`[Patient Assistant UI] Found ${availableDoctors.length} available doctors`);

      // Create appointment request
      const appointmentRequest = await engine.createAppointmentRequest({
        ...appointmentDetails,
        date: parsedDateTime.date,
        time: parsedDateTime.time,
        patientEmail: auth.currentUser.email
      });

      if (!appointmentRequest.id) {
        throw new Error('Failed to create appointment request');
      }

      console.log('[Patient Assistant UI] Appointment request created:', appointmentRequest.id);

      // Send to available doctors
      await engine.sendToAvailableDoctors(appointmentRequest.id, availableDoctors);

      // Show status tracking
      this.showAppointmentStatus(appointmentRequest, availableDoctors);
    } catch (error) {
      console.error('[Patient Assistant UI] Error sending to queue:', error);
      alert('Error sending appointment request. Please try again.');
    }
  }

  showAppointmentStatus(appointment, doctors) {
    const statusContainer = document.getElementById('appointment-status-container');
    if (!statusContainer) return;

    const doctorsList = doctors.map(d => `
      <div class="doctor-item">
        <div class="doctor-item-name">${d.name}</div>
        <div class="doctor-item-spec">${d.specialization}</div>
        <div class="doctor-item-rating">⭐ ${d.rating.toFixed(1)}</div>
      </div>
    `).join('');

    statusContainer.innerHTML = `
      <div class="appointment-status">
        <div class="status-header">
          <h3>🔔 Appointment Request Sent</h3>
          <p>Your request has been sent to available specialists</p>
        </div>

        <div class="status-details">
          <div class="status-detail">
            <span class="label">Appointment Date:</span>
            <span class="value">${appointment.date} at ${appointment.time}</span>
          </div>
          <div class="status-detail">
            <span class="label">Specialist:</span>
            <span class="value">${appointment.specialization}</span>
          </div>
          <div class="status-detail">
            <span class="label">Symptoms:</span>
            <span class="value">${appointment.symptoms.join(', ')}</span>
          </div>
        </div>

        <div class="status-message">
          <div class="spinner"></div>
          <p>⏳ Waiting for doctor acceptance...</p>
        </div>

        <div class="doctor-list-title">Available Doctors</div>
        <div class="doctor-list">
          ${doctorsList}
        </div>

        <p class="status-info">First doctor to accept will be assigned. Others will be notified automatically.</p>
      </div>
    `;

    statusContainer.style.display = 'block';

    // Start listening for appointment acceptance
    this.listenForAppointmentAcceptance(appointment.id);
  }

  listenForAppointmentAcceptance(appointmentId) {
    console.log('[Patient Assistant UI] Listening for appointment acceptance:', appointmentId);

    // Check appointment status every 2 seconds
    const checkInterval = setInterval(async () => {
      try {
        const appointment = await window.appointmentBookingEngine.getAppointment(appointmentId);

        if (appointment.status === 'confirmed') {
          clearInterval(checkInterval);
          this.showAppointmentConfirmed(appointment);
        } else if (appointment.status === 'no_acceptance') {
          clearInterval(checkInterval);
          this.showAppointmentTimeout();
        }
      } catch (error) {
        console.error('[Patient Assistant UI] Error checking appointment:', error);
      }
    }, 2000);

    // Auto-stop checking after 10 minutes
    setTimeout(() => clearInterval(checkInterval), 600000);
  }

  showAppointmentConfirmed(appointment) {
    const statusContainer = document.getElementById('appointment-status-container');
    if (!statusContainer) return;

    statusContainer.innerHTML = `
      <div class="appointment-confirmed">
        <div class="confirmation-header success">
          <h3>✅ Appointment Confirmed!</h3>
          <p>${appointment.acceptedBy} has accepted your appointment</p>
        </div>

        <div class="confirmation-details">
          <div class="detail">
            <span class="label">Date & Time:</span>
            <span class="value">${appointment.date} at ${appointment.time}</span>
          </div>
          <div class="detail">
            <span class="label">Doctor:</span>
            <span class="value">${appointment.acceptedBy}</span>
          </div>
          <div class="detail">
            <span class="label">Type:</span>
            <span class="value">Video Consultation (₹500)</span>
          </div>
        </div>

        <p class="confirmation-message">
          🔔 Your video consultation link will be sent 5 minutes before the appointment
        </p>

        <button class="action-btn primary" onclick="window.location.href='video-room.html?appointmentId=${appointment.id}'">
          Go to Video Consultation
        </button>
      </div>
    `;
  }

  showAppointmentTimeout() {
    const statusContainer = document.getElementById('appointment-status-container');
    if (!statusContainer) return;

    statusContainer.innerHTML = `
      <div class="appointment-timeout">
        <div class="timeout-header">
          <h3>⏰ No Doctors Available</h3>
          <p>No doctors accepted within the timeout period</p>
        </div>

        <p class="timeout-message">
          Please try booking again with a different time or nearby hospital.
        </p>

        <button class="action-btn primary" onclick="location.reload()">
          Try Again
        </button>
      </div>
    `;
  }

  async getAIDiagnosis() {
    console.log('[Patient Assistant UI] Getting AI diagnosis');

    if (!this.currentConsultation) {
      alert('No health details available');
      return;
    }

    this.showLoading(true);

    try {
      const diagnosis = await window.vilgaxPatientAssistant.generateAIDiagnosis();

      const diagnosisContainer = document.getElementById('diagnosis-result-container');
      if (diagnosisContainer) {
        diagnosisContainer.innerHTML = `
          <div class="diagnosis-result">
            <div class="diagnosis-header">
              <h3>🏥 AI Preliminary Diagnosis</h3>
              <p>Based on your symptoms</p>
            </div>

            <div class="diagnosis-content">
              <p>${diagnosis}</p>
            </div>

            <div class="diagnosis-warning">
              <p><strong>⚠️ Disclaimer:</strong> This is a preliminary assessment and not a substitute for professional medical advice. Please consult a licensed healthcare provider.</p>
            </div>

            <div class="diagnosis-actions">
              <button class="action-btn primary" onclick="window.patientAssistantUI.startAppointmentBooking()">
                📅 Book Doctor Appointment
              </button>
              <button class="action-btn secondary" onclick="window.patientAssistantUI.continueTalking()">
                💬 Continue Talking
              </button>
            </div>
          </div>
        `;
        diagnosisContainer.style.display = 'block';
      }

      // Hide options
      const optionsContainer = document.getElementById('action-options-container');
      if (optionsContainer) {
        optionsContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('[Patient Assistant UI] Error getting diagnosis:', error);
      alert('Error generating diagnosis. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  continueTalking() {
    console.log('[Patient Assistant UI] Continue talking');

    const textInput = document.getElementById('assistant-text-input');
    if (textInput) {
      textInput.focus();
      textInput.placeholder = 'Tell me more about your symptoms...';
    }

    // Hide options
    const optionsContainer = document.getElementById('action-options-container');
    if (optionsContainer) {
      optionsContainer.style.display = 'none';
    }
  }

  showLoading(show) {
    const loadingDiv = document.getElementById('assistant-loading');
    if (loadingDiv) {
      loadingDiv.style.display = show ? 'flex' : 'none';
    }
  }
}

// Initialize when page loads
let patientAssistantUI;

function initPatientAssistantUI() {
  patientAssistantUI = new PatientHealthAssistantUI();
  window.patientAssistantUI = patientAssistantUI;
  console.log('✓ Patient Health Assistant UI initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPatientAssistantUI);
} else {
  initPatientAssistantUI();
}

// For module export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PatientHealthAssistantUI;
}
