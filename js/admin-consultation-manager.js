/**
 * Admin Consultation Manager
 * Manage all system consultations, doctors, patients, and generate reports
 */

class AdminConsultationManager {
  constructor() {
    this.allRequests = [];
    this.loadAllData();
  }

  loadAllData() {
    // Load all consultation requests from system
    this.allRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    console.log('📊 Admin: Loaded', this.allRequests.length, 'consultation records');
  }

  // ==================== STATISTICS ====================
  getSystemStats() {
    this.loadAllData();

    return {
      totalConsultations: this.allRequests.length,
      pendingRequests: this.allRequests.filter(r => r.status === 'pending').length,
      acceptedRequests: this.allRequests.filter(r => r.status === 'accepted').length,
      completedRequests: this.allRequests.filter(r => r.status === 'completed').length,
      cancelledRequests: this.allRequests.filter(r => r.status === 'cancelled').length,
      totalDoctors: 245,
      totalPatients: 5342,
      totalAppointments: 8923,
      monthlyRevenue: 342500,
      avgCompletionTime: '2.5 hours',
      patientSatisfaction: 96
    };
  }

  // ==================== CONSULTATION MANAGEMENT ====================
  getAllConsultations() {
    return this.allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getConsultationsByStatus(status) {
    return this.allRequests.filter(r => r.status === status);
  }

  getConsultationsBySpecialty(specialty) {
    return this.allRequests.filter(r => r.specialty === specialty);
  }

  getConsultationDetails(requestId) {
    return this.allRequests.find(r => r.id === requestId);
  }

  cancelConsultation(requestId, reason = '') {
    const request = this.allRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'cancelled';
      request.cancellationReason = reason;
      request.cancelledAt = new Date().toISOString();
      this.saveData();
      console.log('❌ Consultation cancelled:', requestId);
      return true;
    }
    return false;
  }

  reassignConsultation(requestId, newDoctorId) {
    const request = this.allRequests.find(r => r.id === requestId);
    if (request) {
      request.acceptedBy = newDoctorId;
      request.reassignedAt = new Date().toISOString();
      this.saveData();
      console.log('🔄 Consultation reassigned to doctor:', newDoctorId);
      return true;
    }
    return false;
  }

  // ==================== ANALYTICS ====================
  getSpecialtyAnalytics() {
    const stats = {};

    this.allRequests.forEach(req => {
      if (!stats[req.specialty]) {
        stats[req.specialty] = {
          specialty: req.specialty,
          total: 0,
          completed: 0,
          pending: 0,
          avgTime: 0
        };
      }
      stats[req.specialty].total++;
      if (req.status === 'completed') stats[req.specialty].completed++;
      if (req.status === 'pending') stats[req.specialty].pending++;
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }

  getDoctorPerformance(doctorId) {
    const doctorRequests = this.allRequests.filter(r => r.acceptedBy === doctorId);
    
    if (doctorRequests.length === 0) {
      return {
        doctorId,
        totalConsultations: 0,
        completedConsultations: 0,
        acceptanceRate: 0,
        avgRating: 0
      };
    }

    return {
      doctorId,
      totalConsultations: doctorRequests.length,
      completedConsultations: doctorRequests.filter(r => r.status === 'completed').length,
      acceptanceRate: (doctorRequests.filter(r => r.status !== 'pending').length / doctorRequests.length * 100).toFixed(1),
      avgRating: 4.8 // Mock rating
    };
  }

  getPatientAnalytics() {
    return {
      totalPatients: 5342,
      activePatients: this.allRequests.length,
      newPatientsToday: Math.floor(Math.random() * 50),
      patientRetention: 92,
      avgPatientAge: 42
    };
  }

  getMonthlyRevenue() {
    const completed = this.allRequests.filter(r => r.status === 'completed');
    const consultationFee = 500; // ₹500 per consultation
    return completed.length * consultationFee;
  }

  // ==================== DOCTOR MANAGEMENT ====================
  approveDoctor(doctorId, credentials) {
    console.log('✅ Doctor approved:', doctorId);
    // In production, update doctor status in database
    return {
      doctorId,
      status: 'approved',
      approvedAt: new Date().toISOString()
    };
  }

  suspendDoctor(doctorId, reason) {
    console.log('⛔ Doctor suspended:', doctorId, 'Reason:', reason);
    return {
      doctorId,
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
      reason
    };
  }

  // ==================== DATA PERSISTENCE ====================
  saveData() {
    localStorage.setItem('consultationRequests', JSON.stringify(this.allRequests));
  }

  exportData(format = 'json') {
    if (format === 'csv') {
      return this.convertToCSV(this.allRequests);
    }
    return JSON.stringify(this.allRequests, null, 2);
  }

  convertToCSV(data) {
    const headers = ['ID', 'Patient', 'Age', 'Gender', 'Symptoms', 'Specialty', 'Status', 'Doctor', 'Date'];
    const rows = data.map(r => [
      r.id,
      r.patientName,
      r.age,
      r.gender,
      r.symptoms.substring(0, 30),
      r.specialty,
      r.status,
      r.acceptedBy || 'Pending',
      new Date(r.createdAt).toLocaleDateString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    return csv;
  }
}

// Global instance
window.adminManager = new AdminConsultationManager();

// ==================== ADMIN UI FUNCTIONS ====================

function getAdminDashboardHTML() {
  const stats = window.adminManager.getSystemStats();
  
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.totalConsultations}</div>
        <div class="stat-label">Total Consultations</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.pendingRequests}</div>
        <div class="stat-label">Pending Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.completedRequests}</div>
        <div class="stat-label">Completed Consultations</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">₹${(stats.monthlyRevenue / 100000).toFixed(2)}L</div>
        <div class="stat-label">Monthly Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalDoctors}</div>
        <div class="stat-label">Active Doctors</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalPatients}</div>
        <div class="stat-label">Registered Patients</div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">📊 Consultation Analytics</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
        <div style="background: rgba(16,185,129,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--success);">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 13px;">Completion Rate</p>
          <p style="color: #10b981; font-size: 24px; font-weight: bold; margin: 0;">${((stats.completedRequests / stats.totalConsultations * 100) || 0).toFixed(1)}%</p>
        </div>
        <div style="background: rgba(245,158,11,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--warning);">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 13px;">Avg Response Time</p>
          <p style="color: var(--warning); font-size: 24px; font-weight: bold; margin: 0;">${stats.avgCompletionTime}</p>
        </div>
        <div style="background: rgba(20,184,166,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--primary-cyan);">
          <p style="color: var(--text-light); margin: 0 0 5px 0; font-size: 13px;">Patient Satisfaction</p>
          <p style="color: var(--primary-cyan); font-size: 24px; font-weight: bold; margin: 0;">${stats.patientSatisfaction}%</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h2 style="color: var(--primary-cyan);">🏥 Specialty Distribution</h2>
      <div class="data-table" style="margin-top: 15px;">
        <table>
          <thead>
            <tr>
              <th>Specialty</th>
              <th>Total</th>
              <th>Completed</th>
              <th>Pending</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            ${window.adminManager.getSpecialtyAnalytics().map(spec => `
              <tr>
                <td>${spec.specialty}</td>
                <td><strong>${spec.total}</strong></td>
                <td><span style="color: #10b981;">${spec.completed}</span></td>
                <td><span style="color: #f59e0b;">${spec.pending}</span></td>
                <td><strong>${((spec.completed / spec.total * 100) || 0).toFixed(0)}%</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getConsultationRequestsHTML() {
  window.adminManager.loadAllData();
  const allRequests = window.adminManager.getAllConsultations();

  if (allRequests.length === 0) {
    return '<p style="color: var(--text-light);">No consultation requests yet.</p>';
  }

  return `
    <div class="card">
      <h2 style="color: var(--primary-cyan);">📋 All Consultation Requests</h2>
      <p style="color: var(--text-light); margin-bottom: 15px;">Total: ${allRequests.length}</p>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
        <button onclick="filterAdminRequests('all')" style="padding: 8px 16px; background: var(--primary-cyan); color: var(--dark-bg); border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">All (${allRequests.length})</button>
        <button onclick="filterAdminRequests('pending')" style="padding: 8px 16px; background: rgba(245,158,11,0.3); color: var(--warning); border: 1.5px solid var(--warning); border-radius: 6px; font-weight: 600; cursor: pointer;">Pending (${window.adminManager.getConsultationsByStatus('pending').length})</button>
        <button onclick="filterAdminRequests('accepted')" style="padding: 8px 16px; background: rgba(16,185,129,0.3); color: var(--success); border: 1.5px solid var(--success); border-radius: 6px; font-weight: 600; cursor: pointer;">Accepted (${window.adminManager.getConsultationsByStatus('accepted').length})</button>
        <button onclick="filterAdminRequests('completed')" style="padding: 8px 16px; background: rgba(20,184,166,0.3); color: var(--primary-cyan); border: 1.5px solid var(--primary-cyan); border-radius: 6px; font-weight: 600; cursor: pointer;">Completed (${window.adminManager.getConsultationsByStatus('completed').length})</button>
      </div>

      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Doctor</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${allRequests.slice(0, 10).map(req => `
              <tr>
                <td style="font-family: monospace; font-size: 12px;">${req.id.substring(0, 12)}...</td>
                <td><strong>${req.patientName}</strong></td>
                <td>${req.specialty}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
                    ${req.status === 'pending' ? 'background: rgba(245,158,11,0.2); color: #fbbf24;' : ''}
                    ${req.status === 'accepted' ? 'background: rgba(16,185,129,0.2); color: #6ee7b7;' : ''}
                    ${req.status === 'completed' ? 'background: rgba(20,184,166,0.2); color: var(--light-cyan);' : ''}
                  ">
                    ${req.status.toUpperCase()}
                  </span>
                </td>
                <td>${req.acceptedBy ? req.acceptedBy.substring(0, 10) : '—'}</td>
                <td style="font-size: 12px;">${new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onclick="viewConsultationDetail('${req.id}')" style="padding: 4px 8px; background: var(--primary-cyan); color: var(--dark-bg); border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 11px;">
                    View
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <p style="color: var(--text-light); font-size: 12px; margin-top: 10px;">Showing 10 of ${allRequests.length} requests</p>
    </div>
  `;
}

function filterAdminRequests(status) {
  console.log('Filtering requests by status:', status);
  // In production, this would filter the displayed data
}

function viewConsultationDetail(requestId) {
  const detail = window.adminManager.getConsultationDetails(requestId);
  if (detail) {
    alert(`
Consultation Details:

ID: ${detail.id}
Patient: ${detail.patientName}
Age: ${detail.age} | Gender: ${detail.gender}

Symptoms: ${detail.symptoms}
Duration: ${detail.duration}

Specialty: ${detail.specialty}
Status: ${detail.status}
Accepted By: ${detail.acceptedBy || 'Pending'}

Preferred Time: ${detail.preferredTime}
Created: ${new Date(detail.createdAt).toLocaleString()}
    `);
  }
}

function exportConsultationData(format = 'json') {
  const data = window.adminManager.exportData(format);
  const filename = `consultations.${format === 'csv' ? 'csv' : 'json'}`;
  
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  alert(`✅ Data exported as ${filename}`);
}
