/**
 * Doctor Management System
 * Complete doctor dashboard with consultations, prescriptions, scheduling, and earnings
 */

class DoctorManagementSystem {
  constructor(doctorId = 'DR_001', name = 'Dr. Rajesh Kumar', specialty = 'General Physician') {
    this.doctorId = doctorId;
    this.name = name;
    this.specialty = specialty;
    this.patients = [];
    this.prescriptions = [];
    this.schedule = [];
    this.earnings = { totalEarnings: 0, consultations: 0, prescriptions: 0 };
    this.consultationRequests = [];
    this.rating = 4.9;
    this.loadData();
  }

  // ==================== DATA MANAGEMENT ====================
  loadData() {
    // Load ALL consultation requests - pending ones visible to all doctors, accepted/completed for this doctor
    const allConsultations = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    this.consultationRequests = allConsultations.filter(r => 
      r.status === 'pending' || 
      r.acceptedBy === this.doctorId || 
      r.status === 'accepted' || 
      r.status === 'completed'
    );
    this.prescriptions = JSON.parse(localStorage.getItem(`prescriptions_${this.doctorId}`) || '[]');
    this.patients = JSON.parse(localStorage.getItem(`patients_${this.doctorId}`) || this.getMockPatients());
    this.earnings = JSON.parse(localStorage.getItem(`earnings_${this.doctorId}`) || JSON.stringify(this.getMockEarnings()));
    console.log('💊 Doctor System: Loaded data for', this.name);
  }

  saveData() {
    localStorage.setItem(`prescriptions_${this.doctorId}`, JSON.stringify(this.prescriptions));
    localStorage.setItem(`patients_${this.doctorId}`, JSON.stringify(this.patients));
    localStorage.setItem(`earnings_${this.doctorId}`, JSON.stringify(this.earnings));
  }

  getMockPatients() {
    return [
      { 
        id: 'P001', 
        name: 'Rajesh Kumar', 
        age: 45, 
        gender: 'M', 
        lastVisit: '2026-04-25', 
        status: 'healthy', 
        conditions: ['Hypertension'], 
        phone: '+91-9876543210',
        email: 'rajesh.kumar@email.com',
        bloodGroup: 'O+',
        consultations: 12,
        prescriptions: 8
      },
      { 
        id: 'P002', 
        name: 'Priya Singh', 
        age: 38, 
        gender: 'F', 
        lastVisit: '2026-04-20', 
        status: 'monitoring', 
        conditions: ['Diabetes'], 
        phone: '+91-9876543211',
        email: 'priya.singh@email.com',
        bloodGroup: 'A+',
        consultations: 8,
        prescriptions: 15
      },
      { 
        id: 'P003', 
        name: 'Amit Patel', 
        age: 52, 
        gender: 'M', 
        lastVisit: '2026-04-15', 
        status: 'healthy', 
        conditions: [], 
        phone: '+91-9876543212',
        email: 'amit.patel@email.com',
        bloodGroup: 'B+',
        consultations: 5,
        prescriptions: 6
      },
      { 
        id: 'P004', 
        name: 'Neha Sharma', 
        age: 29, 
        gender: 'F', 
        lastVisit: '2026-04-23', 
        status: 'healthy', 
        conditions: ['Allergies'], 
        phone: '+91-9876543213',
        email: 'neha.sharma@email.com',
        bloodGroup: 'AB+',
        consultations: 6,
        prescriptions: 9
      },
      { 
        id: 'P005', 
        name: 'Vikram Singh', 
        age: 55, 
        gender: 'M', 
        lastVisit: '2026-04-18', 
        status: 'monitoring', 
        conditions: ['Cholesterol', 'Hypertension'], 
        phone: '+91-9876543214',
        email: 'vikram.singh@email.com',
        bloodGroup: 'O-',
        consultations: 14,
        prescriptions: 18
      }
    ];
  }

  getMockEarnings() {
    return {
      totalEarnings: 12500,
      monthlyEarnings: 5200,
      consultations: 98,
      prescriptions: 156,
      completedThisMonth: 24,
      pendingPayouts: 3500,
      earningHistory: [
        { date: '2026-04-20', type: 'consultation', amount: 500, patient: 'Rajesh Kumar' },
        { date: '2026-04-18', type: 'prescription', amount: 200, patient: 'Priya Singh' },
        { date: '2026-04-15', type: 'consultation', amount: 500, patient: 'Amit Patel' }
      ]
    };
  }

  // ==================== CONSULTATION MANAGEMENT ====================
  getPendingConsultations() {
    return this.consultationRequests.filter(r => r.status === 'pending');
  }

  getAcceptedConsultations() {
    return this.consultationRequests.filter(r => r.status === 'accepted');
  }

  acceptConsultation(requestId) {
    const request = this.consultationRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'accepted';
      request.acceptedBy = this.doctorId;
      request.acceptedAt = new Date().toISOString();
      request.videoCallLink = `https://call.carewitoutborders.com/${this.doctorId}/${requestId}`;
      
      // Update in localStorage
      const allRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      const index = allRequests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        allRequests[index] = request;
        localStorage.setItem('consultationRequests', JSON.stringify(allRequests));
      }
      
      // Add patient if new
      if (!this.patients.find(p => p.id === request.patientId)) {
        this.patients.push({
          id: request.patientId || 'P_' + requestId.substring(0, 6),
          name: request.patientName,
          age: request.age,
          gender: request.gender,
          lastVisit: new Date().toISOString().split('T')[0],
          status: 'active',
          conditions: [request.symptoms.split(',')[0]],
          phone: 'Not provided'
        });
      }

      this.saveData();
      console.log('✅ Consultation accepted:', requestId);
      return request;
    }
    return null;
  }

  rejectConsultation(requestId, reason = 'Not available') {
    const request = this.consultationRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      request.rejectedBy = this.doctorId;
      request.rejectionReason = reason;
      request.rejectedAt = new Date().toISOString();

      const allRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      const index = allRequests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        allRequests[index] = request;
        localStorage.setItem('consultationRequests', JSON.stringify(allRequests));
      }

      this.loadData();
      console.log('❌ Consultation rejected:', requestId);
      return true;
    }
    return false;
  }

  sendDiagnosis(requestId, diagnosisText, medicines = []) {
    const request = this.consultationRequests.find(r => r.id === requestId);
    if (request) {
      request.diagnosis = diagnosisText;
      request.medicines = medicines;
      request.diagnosisDate = new Date().toISOString();
      request.status = 'diagnosed';

      const allRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      const index = allRequests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        allRequests[index] = request;
        localStorage.setItem('consultationRequests', JSON.stringify(allRequests));
      }

      this.earnings.totalEarnings += 500;
      this.earnings.consultations += 1;
      this.earnings.completedThisMonth = (this.earnings.completedThisMonth || 0) + 1;
      this.earnings.earningHistory.push({
        date: new Date().toISOString().split('T')[0],
        type: 'consultation',
        amount: 500,
        patient: request.patientName
      });
      this.saveData();
      console.log('📋 Diagnosis sent for:', requestId);
      return true;
    }
    return false;
  }

  completeConsultation(requestId) {
    const request = this.consultationRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'completed';
      request.completedAt = new Date().toISOString();

      const allRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      const index = allRequests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        allRequests[index] = request;
        localStorage.setItem('consultationRequests', JSON.stringify(allRequests));
      }

      this.loadData();
      console.log('✅ Consultation completed:', requestId);
      return true;
    }
    return false;
  }

  // ==================== PRESCRIPTION MANAGEMENT ====================
  issuePrescription(patientId, medicines) {
    const prescription = {
      id: 'RX_' + Date.now(),
      patientId,
      patientName: this.patients.find(p => p.id === patientId)?.name || 'Unknown',
      doctorId: this.doctorId,
      medicines,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };

    this.prescriptions.push(prescription);
    this.earnings.prescriptions += 1;
    this.earnings.totalEarnings += 200;
    this.earnings.earningHistory.push({
      date: new Date().toISOString().split('T')[0],
      type: 'prescription',
      amount: 200,
      patient: prescription.patientName
    });

    this.saveData();
    console.log('💊 Prescription issued:', prescription.id);
    return prescription;
  }

  getPrescriptionsByPatient(patientId) {
    return this.prescriptions.filter(p => p.patientId === patientId && p.status === 'active');
  }

  getAllPrescriptions() {
    return this.prescriptions.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  }

  revokePrescription(prescriptionId) {
    const prescription = this.prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      prescription.status = 'revoked';
      prescription.revokedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  // ==================== PATIENT MANAGEMENT ====================
  getPatients() {
    return this.patients;
  }

  getPatientDetails(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      return {
        ...patient,
        consultations: this.consultationRequests.filter(r => r.patientId === patientId).length,
        prescriptions: this.prescriptions.filter(p => p.patientId === patientId).length,
        medicalHistory: this.getMedicalHistory(patientId)
      };
    }
    return null;
  }

  getMedicalHistory(patientId) {
    return {
      consultations: this.consultationRequests
        .filter(r => r.patientId === patientId && r.status === 'completed')
        .map(r => ({
          date: r.completedAt,
          symptoms: r.symptoms,
          diagnosis: r.diagnosis
        })),
      prescriptions: this.prescriptions.filter(p => p.patientId === patientId)
    };
  }

  updatePatientInfo(patientId, updates) {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      Object.assign(patient, updates);
      this.saveData();
      return patient;
    }
    return null;
  }

  // ==================== SCHEDULE MANAGEMENT ====================
  setAvailability(dayOfWeek, startTime, endTime) {
    const slot = {
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true
    };

    this.schedule = this.schedule.filter(s => s.dayOfWeek !== dayOfWeek);
    this.schedule.push(slot);
    localStorage.setItem(`schedule_${this.doctorId}`, JSON.stringify(this.schedule));
    console.log('📅 Availability set:', dayOfWeek, startTime, endTime);
    return slot;
  }

  getSchedule() {
    return this.schedule;
  }

  // ==================== EARNINGS & ANALYTICS ====================
  getEarnings() {
    return {
      ...this.earnings,
      monthlyRevenue: this.earnings.monthlyEarnings || 0,
      totalConsultations: this.earnings.consultations,
      averagePerConsultation: (this.earnings.totalEarnings / (this.earnings.consultations || 1)).toFixed(2),
      totalPrescriptions: this.earnings.prescriptions,
      averagePerPrescription: (200).toFixed(2)
    };
  }

  getMonthlyStats() {
    return {
      consultationsThisMonth: this.earnings.completedThisMonth || 0,
      earningsThisMonth: this.earnings.monthlyEarnings || 0,
      patientsSeen: this.patients.length,
      averageRating: this.rating,
      prescriptionsIssued: this.earnings.prescriptions || 0
    };
  }

  getEarningHistory(limit = 10) {
    return (this.earnings.earningHistory || []).slice(-limit).reverse();
  }

  // ==================== STATISTICS ====================
  getStats() {
    return {
      totalPatients: this.patients.length,
      activePatients: this.patients.filter(p => p.status === 'active').length,
      healthyPatients: this.patients.filter(p => p.status === 'healthy').length,
      monitoringPatients: this.patients.filter(p => p.status === 'monitoring').length,
      totalConsultations: this.consultationRequests.length,
      completedConsultations: this.consultationRequests.filter(r => r.status === 'completed').length,
      pendingConsultations: this.consultationRequests.filter(r => r.status === 'pending').length,
      acceptedConsultations: this.consultationRequests.filter(r => r.status === 'accepted').length,
      totalPrescriptions: this.prescriptions.length,
      activePrescriptions: this.prescriptions.filter(p => p.status === 'active').length,
      rating: this.rating,
      earnings: this.earnings.totalEarnings
    };
  }
}

// Global instance
window.doctorSystem = new DoctorManagementSystem();

// ==================== UI HELPER FUNCTIONS ====================

function getDoctorDashboardHTML() {
  const stats = window.doctorSystem.getStats();
  const monthlyStats = window.doctorSystem.getMonthlyStats();

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.totalPatients}</div>
        <div class="stat-label">Total Patients</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.completedConsultations}</div>
        <div class="stat-label">Completed Consultations</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">₹${(stats.earnings / 1000).toFixed(1)}K</div>
        <div class="stat-label">Total Earnings</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.rating} ⭐</div>
        <div class="stat-label">Patient Rating</div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">📊 This Month's Performance</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
        <div style="background: rgba(20,184,166,0.1); padding: 15px; border-radius: 8px;">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 12px;">Consultations</p>
          <p style="color: var(--primary-cyan); font-size: 24px; font-weight: bold; margin: 0;">${monthlyStats.consultationsThisMonth}</p>
        </div>
        <div style="background: rgba(16,185,129,0.1); padding: 15px; border-radius: 8px;">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 12px;">Earnings</p>
          <p style="color: var(--success); font-size: 24px; font-weight: bold; margin: 0;">₹${monthlyStats.earningsThisMonth}</p>
        </div>
        <div style="background: rgba(245,158,11,0.1); padding: 15px; border-radius: 8px;">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 12px;">Patients Seen</p>
          <p style="color: var(--warning); font-size: 24px; font-weight: bold; margin: 0;">${monthlyStats.patientsSeen}</p>
        </div>
        <div style="background: rgba(6,182,212,0.1); padding: 15px; border-radius: 8px;">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 12px;">Prescriptions</p>
          <p style="color: var(--light-cyan); font-size: 24px; font-weight: bold; margin: 0;">${monthlyStats.prescriptionsIssued}</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">👥 Patient Status Overview</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 15px;">
        <div style="padding: 10px; border-left: 4px solid var(--success); background: rgba(16,185,129,0.1); border-radius: 4px;">
          <p style="color: var(--text-light); margin: 0; font-size: 12px;">Healthy</p>
          <p style="color: var(--success); font-weight: bold; font-size: 18px; margin: 5px 0 0 0;">${stats.healthyPatients}</p>
        </div>
        <div style="padding: 10px; border-left: 4px solid var(--warning); background: rgba(245,158,11,0.1); border-radius: 4px;">
          <p style="color: var(--text-light); margin: 0; font-size: 12px;">Monitoring</p>
          <p style="color: var(--warning); font-weight: bold; font-size: 18px; margin: 5px 0 0 0;">${stats.monitoringPatients}</p>
        </div>
        <div style="padding: 10px; border-left: 4px solid var(--primary-cyan); background: rgba(20,184,166,0.1); border-radius: 4px;">
          <p style="color: var(--text-light); margin: 0; font-size: 12px;">Active</p>
          <p style="color: var(--primary-cyan); font-weight: bold; font-size: 18px; margin: 5px 0 0 0;">${stats.activePatients}</p>
        </div>
      </div>
    </div>
  `;
}

function getConsultationsHTML() {
  const pending = window.doctorSystem.getPendingConsultations();
  const accepted = window.doctorSystem.getAcceptedConsultations();

  return `
    <div class="card">
      <h2 style="color: var(--primary-cyan);">⏳ Pending Consultation Requests (${pending.length})</h2>
      ${pending.length === 0 ? '<p style="color: var(--text-light);">No pending requests</p>' : `
        <div style="margin-top: 15px;">
          ${pending.slice(0, 5).map(req => `
            <div style="background: rgba(245,158,11,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid var(--warning);">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <p style="color: var(--primary-cyan); font-weight: bold; margin: 0 0 5px 0;">${req.patientName}</p>
                  <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">🔴 ${req.specialty} | Age: ${req.age}</p>
                  <p style="color: var(--text-light); margin: 0; font-size: 12px;">📋 ${req.symptoms.substring(0, 50)}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="acceptDoctorConsultation('${req.id}')" style="padding: 6px 12px; background: var(--success); color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px;">✓ Accept</button>
                  <button onclick="rejectDoctorConsultation('${req.id}')" style="padding: 6px 12px; background: var(--danger); color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px;">✕ Reject</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">✅ Active Consultations (${accepted.length})</h2>
      ${accepted.length === 0 ? '<p style="color: var(--text-light);">No active consultations</p>' : `
        <div style="margin-top: 15px;">
          ${accepted.slice(0, 5).map(req => `
            <div style="background: rgba(16,185,129,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid var(--success);">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <p style="color: var(--primary-cyan); font-weight: bold; margin: 0 0 5px 0;">${req.patientName}</p>
                  <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">🎥 <a href="${req.videoCallLink}" target="_blank" style="color: var(--light-cyan); text-decoration: none;">Join Video Call</a></p>
                  <p style="color: var(--text-light); margin: 0; font-size: 12px;">⏰ Since: ${new Date(req.acceptedAt).toLocaleDateString()}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="sendDoctorDiagnosis('${req.id}')" style="padding: 6px 12px; background: var(--primary-cyan); color: var(--dark-bg); border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px;">📋 Diagnosis</button>
                  <button onclick="completeDoctorConsultation('${req.id}')" style="padding: 6px 12px; background: var(--success); color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px;">✓ Complete</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function getPrescriptionsHTML() {
  const allRx = window.doctorSystem.getAllPrescriptions();

  return `
    <div class="card">
      <h2 style="color: var(--primary-cyan);">💊 Issue New Prescription</h2>
      <div class="form-group">
        <label>Patient Name</label>
        <select id="prescriptionPatient">
          <option value="">-- Select Patient --</option>
          ${window.doctorSystem.getPatients().map(p => `<option value="${p.id}">${p.name} (${p.age}y)</option>`).join('')}
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="form-group">
          <label>Medicine Name</label>
          <input type="text" id="medicineName" placeholder="e.g., Aspirin">
        </div>
        <div class="form-group">
          <label>Dosage</label>
          <input type="text" id="medicineDosage" placeholder="e.g., 500mg">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="form-group">
          <label>Frequency</label>
          <input type="text" id="medicineFrequency" placeholder="e.g., 2x daily">
        </div>
        <div class="form-group">
          <label>Duration</label>
          <input type="text" id="medicineDuration" placeholder="e.g., 7 days">
        </div>
      </div>
      <button onclick="issuePrescriptionHandler()" style="padding: 10px 20px; background: linear-gradient(135deg, var(--primary-cyan), var(--light-cyan)); color: var(--dark-bg); border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">📝 Issue Prescription</button>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">📋 Recent Prescriptions (${allRx.slice(0, 10).length})</h2>
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Issued Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${allRx.slice(0, 10).map(rx => `
              <tr>
                <td>${rx.patientName}</td>
                <td>${rx.medicines[0]?.name || '-'}</td>
                <td>${rx.medicines[0]?.dosage || '-'}</td>
                <td>${new Date(rx.issuedAt).toLocaleDateString()}</td>
                <td><span style="color: ${rx.status === 'active' ? 'var(--success)' : 'var(--text-light)'}; font-weight: 600; font-size: 12px;">${rx.status.toUpperCase()}</span></td>
                <td><button onclick="viewPrescriptionDetails('${rx.id}')" style="padding: 4px 8px; background: var(--primary-cyan); color: var(--dark-bg); border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">View</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getPatientListHTML() {
  const patients = window.doctorSystem.getPatients();

  // Function to generate avatar color based on name
  function generateAvatarColor(name) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#FF8C42'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Function to get initials from name
  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  return `
    <div class="card">
      <h2 style="color: var(--primary-cyan);">👥 My Patients (${patients.length})</h2>
      <div class="data-table" style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Last Visit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${patients.map(p => {
              const avatarColor = generateAvatarColor(p.name);
              const initials = getInitials(p.name);
              return `
              <tr>
                <td style="text-align: center;">
                  <div style="width: 45px; height: 45px; border-radius: 50%; background: ${avatarColor}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); margin: 0 auto;">
                    ${initials}
                  </div>
                </td>
                <td><strong>${p.name}</strong></td>
                <td>${p.age}</td>
                <td>${p.gender === 'M' ? '👨 Male' : p.gender === 'F' ? '👩 Female' : p.gender}</td>
                <td style="font-size: 12px;">${p.phone || 'Not provided'}</td>
                <td>${new Date(p.lastVisit).toLocaleDateString()}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
                    ${p.status === 'healthy' ? 'background: rgba(16,185,129,0.2); color: var(--success);' : 'background: rgba(245,158,11,0.2); color: var(--warning);'}
                  ">${p.status.toUpperCase()}</span>
                </td>
                <td><button onclick="viewDoctorPatientDetails('${p.id}')" style="padding: 4px 8px; background: var(--primary-cyan); color: var(--dark-bg); border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">View</button></td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getEarningsHTML() {
  const earnings = window.doctorSystem.getEarnings();
  const history = window.doctorSystem.getEarningHistory(5);

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">₹${earnings.totalEarnings}</div>
        <div class="stat-label">Total Earnings</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">₹${earnings.monthlyRevenue}</div>
        <div class="stat-label">Monthly Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">₹${earnings.averagePerConsultation}</div>
        <div class="stat-label">Avg per Consultation</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${earnings.totalConsultations}</div>
        <div class="stat-label">Total Consultations</div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">💰 Recent Earnings</h2>
      <div style="margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(20,184,166,0.1);">
              <th style="padding: 10px; text-align: left; color: var(--primary-cyan); font-weight: 600;">Date</th>
              <th style="padding: 10px; text-align: left; color: var(--primary-cyan); font-weight: 600;">Type</th>
              <th style="padding: 10px; text-align: left; color: var(--primary-cyan); font-weight: 600;">Patient</th>
              <th style="padding: 10px; text-align: right; color: var(--primary-cyan); font-weight: 600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(entry => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px;">${entry.date}</td>
                <td style="padding: 10px;"><span style="background: ${entry.type === 'consultation' ? 'rgba(20,184,166,0.2)' : 'rgba(16,185,129,0.2)'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${entry.type}</span></td>
                <td style="padding: 10px;">${entry.patient}</td>
                <td style="padding: 10px; text-align: right; color: var(--success); font-weight: 600;">+₹${entry.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==================== EVENT HANDLERS ====================

function acceptDoctorConsultation(requestId) {
  const result = window.doctorSystem.acceptConsultation(requestId);
  if (result) {
    alert(`✅ Consultation accepted!\nVideo Link: ${result.videoCallLink}`);
    location.reload();
  }
}

function rejectDoctorConsultation(requestId) {
  const reason = prompt('Enter rejection reason:', 'Not available');
  if (reason !== null && window.doctorSystem.rejectConsultation(requestId, reason)) {
    alert('❌ Consultation rejected');
    location.reload();
  }
}

function sendDoctorDiagnosis(requestId) {
  const diagnosis = prompt('Enter diagnosis:');
  if (diagnosis) {
    window.doctorSystem.sendDiagnosis(requestId, diagnosis, []);
    alert('📋 Diagnosis sent to patient');
    location.reload();
  }
}

function completeDoctorConsultation(requestId) {
  if (window.doctorSystem.completeConsultation(requestId)) {
    alert('✅ Consultation marked as completed');
    location.reload();
  }
}

function issuePrescriptionHandler() {
  const patientId = document.getElementById('prescriptionPatient')?.value;
  const medicineName = document.getElementById('medicineName')?.value;
  const dosage = document.getElementById('medicineDosage')?.value;
  const frequency = document.getElementById('medicineFrequency')?.value;
  const duration = document.getElementById('medicineDuration')?.value;

  if (!patientId || !medicineName || !dosage) {
    alert('Please fill all required fields');
    return;
  }

  const prescription = window.doctorSystem.issuePrescription(patientId, [{
    name: medicineName,
    dosage,
    frequency,
    duration
  }]);

  if (prescription) {
    alert(`✅ Prescription issued!\nRx ID: ${prescription.id}`);
    document.getElementById('prescriptionPatient').value = '';
    document.getElementById('medicineName').value = '';
    document.getElementById('medicineDosage').value = '';
    document.getElementById('medicineFrequency').value = '';
    document.getElementById('medicineDuration').value = '';
  }
}

function viewDoctorPatientDetails(patientId) {
  const patient = window.doctorSystem.getPatientDetails(patientId);
  if (patient) {
    // Generate avatar color
    function generateAvatarColor(name) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    }

    const avatarColor = generateAvatarColor(patient.name);
    const initials = patient.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const profileHTML = `
      <div style="background: linear-gradient(135deg, rgba(20,184,166,0.1), rgba(30,41,59,0.9)); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); max-width: 500px; margin: 0 auto;">
        
        <!-- Header with Avatar -->
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: ${avatarColor}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 44px; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.4); margin: 0 auto 15px;">
            ${initials}
          </div>
          <h2 style="color: var(--primary-cyan); margin: 0 0 5px 0; font-size: 22px;">${patient.name}</h2>
          <p style="color: var(--text-light); margin: 0; font-size: 14px;">Patient ID: ${patientId}</p>
        </div>

        <!-- Personal Information -->
        <div style="background: rgba(30,41,59,0.7); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: var(--primary-cyan); margin: 0 0 12px 0; font-size: 14px;">👤 Personal Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Age</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600;">${patient.age} years</p>
            </div>
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Gender</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600;">${patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : patient.gender}</p>
            </div>
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Blood Group</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600;">${patient.bloodGroup || 'Not provided'}</p>
            </div>
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Status</p>
              <p style="color: ${patient.status === 'healthy' ? 'var(--success)' : 'var(--warning)'}; margin: 0; font-weight: 600;">${patient.status.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div style="background: rgba(30,41,59,0.7); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: var(--primary-cyan); margin: 0 0 12px 0; font-size: 14px;">📞 Contact Information</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Phone</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600; word-break: break-all;">${patient.phone || 'Not provided'}</p>
            </div>
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Email</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600; word-break: break-all;">${patient.email || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <!-- Medical History -->
        <div style="background: rgba(30,41,59,0.7); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: var(--primary-cyan); margin: 0 0 12px 0; font-size: 14px;">📋 Medical History</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Consultations</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600; font-size: 18px;">${patient.consultations || 0}</p>
            </div>
            <div>
              <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Prescriptions</p>
              <p style="color: var(--primary-cyan); margin: 0; font-weight: 600; font-size: 18px;">${patient.prescriptions || 0}</p>
            </div>
          </div>
          <div>
            <p style="color: var(--text-light); margin: 0 0 3px 0; font-size: 12px;">Medical Conditions</p>
            <p style="color: var(--primary-cyan); margin: 0; font-weight: 600;">${patient.conditions && patient.conditions.length > 0 ? patient.conditions.join(', ') : 'None'}</p>
          </div>
        </div>

        <!-- Last Visit -->
        <div style="background: rgba(20,184,166,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--primary-cyan);">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 12px;">Last Visit</p>
          <p style="color: var(--primary-cyan); margin: 0; font-weight: 600; font-size: 16px;">${new Date(patient.lastVisit).toLocaleDateString()}</p>
        </div>
      </div>
    `;

    // Show in a formatted way (using alert as fallback since we don't have a modal system in doctor.html)
    alert(`
👤 ${patient.name} (ID: ${patientId})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Age: ${patient.age} | Gender: ${patient.gender === 'M' ? 'Male' : 'Female'}
💉 Blood Group: ${patient.bloodGroup || 'N/A'}
📞 Phone: ${patient.phone}
📧 Email: ${patient.email || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Consultations: ${patient.consultations || 0}
💊 Prescriptions: ${patient.prescriptions || 0}
🏥 Conditions: ${patient.conditions.join(', ') || 'None'}
✅ Status: ${patient.status.toUpperCase()}
🗓️ Last Visit: ${new Date(patient.lastVisit).toLocaleDateString()}
    `);

    console.log('👁️ Patient Profile:', patient);
  }
}

function viewPrescriptionDetails(prescriptionId) {
  const allRx = window.doctorSystem.getAllPrescriptions();
  const rx = allRx.find(r => r.id === prescriptionId);
  if (rx) {
    alert(`
📝 PRESCRIPTION DETAILS

ID: ${rx.id}
Patient: ${rx.patientName}
Issued: ${new Date(rx.issuedAt).toLocaleDateString()}
Expires: ${new Date(rx.expiresAt).toLocaleDateString()}
Status: ${rx.status.toUpperCase()}

💊 MEDICINES:
${rx.medicines.map(m => `${m.name} - ${m.dosage} (${m.frequency}, ${m.duration})`).join('\n')}
    `);
  }
}
