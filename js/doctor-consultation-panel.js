/**
 * Doctor Consultation Panel
 * Allows doctors to view, accept, and manage patient consultation requests
 */

class DoctorConsultationPanel {
  constructor() {
    this.activeRequests = [];
    this.acceptedRequests = [];
    this.loadRequests();
  }

  loadRequests() {
    // Load from local storage (in production, fetch from server)
    const allRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    
    this.activeRequests = allRequests.filter(r => r.status === 'pending');
    this.acceptedRequests = allRequests.filter(r => r.status === 'accepted');

    console.log('📋 Doctor Panel: Loaded requests');
    console.log('- Pending:', this.activeRequests.length);
    console.log('- Accepted:', this.acceptedRequests.length);
  }

  acceptRequest(requestId, doctorId) {
    const request = this.activeRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'accepted';
      request.acceptedBy = doctorId;
      request.videoCallLink = `https://video.carewithoutborders.com/call/${requestId}`;
      
      // Update local storage
      this.saveRequests();
      
      // Move to accepted list
      this.acceptedRequests.push(request);
      this.activeRequests = this.activeRequests.filter(r => r.id !== requestId);

      console.log('✅ Doctor accepted request:', requestId);
      return request;
    }
  }

  saveRequests() {
    const allRequests = [...this.activeRequests, ...this.acceptedRequests];
    localStorage.setItem('consultationRequests', JSON.stringify(allRequests));
  }

  getRequestsBySpecialty(specialty) {
    return this.activeRequests.filter(r => r.specialty === specialty);
  }

  sendDiagnosis(requestId, diagnosisText, medicines) {
    const request = this.acceptedRequests.find(r => r.id === requestId);
    if (request) {
      request.diagnosis = diagnosisText;
      request.medicines = medicines;
      request.sentAt = new Date().toISOString();
      this.saveRequests();
      console.log('📝 Diagnosis sent for request:', requestId);
      return true;
    }
    return false;
  }

  schedulVideoCall(requestId, startTime) {
    const request = this.acceptedRequests.find(r => r.id === requestId);
    if (request) {
      request.videoCallScheduledAt = startTime;
      this.saveRequests();
      console.log('📹 Video call scheduled for request:', requestId);
      return true;
    }
    return false;
  }

  completeRequest(requestId) {
    const request = this.acceptedRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'completed';
      request.completedAt = new Date().toISOString();
      this.saveRequests();
      this.acceptedRequests = this.acceptedRequests.filter(r => r.id !== requestId);
      console.log('✅ Request completed:', requestId);
      return true;
    }
    return false;
  }
}

// Global instance
window.doctorPanel = new DoctorConsultationPanel();

// ==================== DOCTOR UI FUNCTIONS ====================

function showDoctorConsultationRequests(doctorSpecialty = 'General') {
  window.doctorPanel.loadRequests();
  const requests = window.doctorPanel.getRequestsBySpecialty(doctorSpecialty);

  let html = `
    <div style="background: rgba(20,184,166,0.1); padding: 20px; border-radius: 12px; border-left: 4px solid var(--primary-cyan);">
      <h3 style="color: var(--primary-cyan); margin-top: 0;">📋 Pending Consultation Requests</h3>
      <p style="color: var(--text-light);">${requests.length} patient(s) waiting for ${doctorSpecialty} consultation</p>
  `;

  if (requests.length === 0) {
    html += '<p style="color: var(--text-light); font-style: italic;">No pending requests at this time.</p>';
  } else {
    requests.forEach((request, idx) => {
      html += `
        <div style="background: rgba(30,41,59,0.8); padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <p style="color: var(--primary-cyan); font-weight: bold; margin: 0 0 5px 0;">👤 ${request.patientName}</p>
              <p style="color: var(--text-light); font-size: 13px; margin: 0 0 3px 0;">Age: ${request.age}, Gender: ${request.gender}</p>
            </div>
            <div>
              <p style="color: var(--text-light); font-size: 13px; margin: 0 0 3px 0;">⏱️ Duration: ${request.duration}</p>
              <p style="color: var(--text-light); font-size: 13px; margin: 0;">🆔 ID: ${request.id}</p>
            </div>
          </div>
          
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <p style="color: var(--light-cyan); font-weight: bold; margin: 0 0 8px 0;">📋 Symptoms:</p>
            <p style="color: var(--text-light); margin: 0; font-size: 14px;">${request.symptoms}</p>
          </div>

          <div style="display: flex; gap: 10px;">
            <button onclick="acceptConsultationRequest('${request.id}')" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              ✓ Accept Request
            </button>
            <button onclick="rejectConsultationRequest('${request.id}')" style="flex: 1; padding: 10px; background: transparent; border: 1.5px solid #ef4444; color: #ef4444; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              ✕ Reject
            </button>
          </div>
        </div>
      `;
    });
  }

  html += '</div>';
  return html;
}

function showDoctorAcceptedRequests() {
  window.doctorPanel.loadRequests();
  const requests = window.doctorPanel.acceptedRequests;

  let html = `
    <div style="background: rgba(20,184,166,0.1); padding: 20px; border-radius: 12px; border-left: 4px solid var(--primary-cyan);">
      <h3 style="color: var(--primary-cyan); margin-top: 0;">✅ Active Consultations</h3>
      <p style="color: var(--text-light);">${requests.length} active consultation(s)</p>
  `;

  if (requests.length === 0) {
    html += '<p style="color: var(--text-light); font-style: italic;">No active consultations.</p>';
  } else {
    requests.forEach((request) => {
      html += `
        <div style="background: rgba(30,41,59,0.8); padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
              <p style="color: var(--primary-cyan); font-weight: bold; margin: 0 0 5px 0;">👤 ${request.patientName}</p>
              <p style="color: var(--text-light); font-size: 13px; margin: 0;">🆔 ID: ${request.id}</p>
            </div>
            <span style="background: rgba(16,185,129,0.3); color: #6ee7b7; padding: 5px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Accepted</span>
          </div>

          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <p style="color: var(--light-cyan); font-weight: bold; margin: 0 0 8px 0;">📋 Symptoms:</p>
            <p style="color: var(--text-light); margin: 0; font-size: 14px;">${request.symptoms}</p>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button onclick="sendDiagnosisForm('${request.id}')" style="flex: 1; padding: 10px; background: linear-gradient(135deg, var(--primary-cyan), var(--light-cyan)); border: none; color: var(--dark-bg); border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              📝 Send Diagnosis
            </button>
            <button onclick="scheduleVideoCall('${request.id}')" style="flex: 1; padding: 10px; background: transparent; border: 1.5px solid var(--primary-cyan); color: var(--primary-cyan); border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              📹 Video Call
            </button>
            <button onclick="completeConsultation('${request.id}')" style="flex: 1; padding: 10px; background: transparent; border: 1.5px solid #10b981; color: #10b981; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              ✓ Complete
            </button>
          </div>
        </div>
      `;
    });
  }

  html += '</div>';
  return html;
}

function acceptConsultationRequest(requestId) {
  const doctorId = localStorage.getItem('doctorId') || 'doctor-' + Date.now();
  window.doctorPanel.acceptRequest(requestId, doctorId);
  
  alert('✅ You have accepted this consultation request. The patient will be notified.');
  console.log('✅ Doctor accepted request:', requestId);
  
  // Refresh the display
  const consultationDiv = document.querySelector('[id*="consultations"]');
  if (consultationDiv) {
    consultationDiv.innerHTML = showDoctorConsultationRequests();
  }
}

function rejectConsultationRequest(requestId) {
  if (confirm('Are you sure you want to reject this request?')) {
    alert('Request rejected. The request will be offered to other doctors.');
    console.log('❌ Doctor rejected request:', requestId);
    // In production, offer to next doctor
  }
}

function sendDiagnosisForm(requestId) {
  const diagnosisText = prompt('Enter your diagnosis and recommendations:');
  if (diagnosisText) {
    const medicinesText = prompt('Recommended medicines (comma-separated):');
    window.doctorPanel.sendDiagnosis(requestId, diagnosisText, medicinesText?.split(',') || []);
    alert('✅ Diagnosis sent to patient');
  }
}

function scheduleVideoCall(requestId) {
  const time = prompt('Enter preferred video call time (e.g., "2:00 PM"):');
  if (time) {
    window.doctorPanel.schedulVideoCall(requestId, time);
    alert(`✅ Video call scheduled for ${time}. Patient will receive the call link.`);
  }
}

function completeConsultation(requestId) {
  if (confirm('Mark this consultation as complete?')) {
    window.doctorPanel.completeRequest(requestId);
    alert('✅ Consultation completed and closed.');
  }
}
