/**
 * VILGAX Professional UI System
 * Beautiful, modern interfaces for medical AI platform
 * 
 * Components:
 * - ML Metrics Dashboard
 * - Appointment Status Cards
 * - Doctor Profile Cards
 * - Consultation Summary
 * - Feedback Collection UI
 * - Performance Charts
 */

class VILGAXUIManager {
  constructor() {
    this.initializeStyles();
    this.currentPage = 'dashboard';
  }

  /**
   * Initialize all UI styles and components
   */
  initializeStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      /* ===== VILGAX UI SYSTEM ===== */

      /* ROOT COLORS */
      :root {
        --primary-teal: #0f766e;
        --primary-cyan: #14b8a6;
        --light-teal: #ccf0ee;
        --accent-blue: #667eea;
        --accent-purple: #764ba2;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --dark-bg: #0f172a;
        --light-bg: #f8fafc;
        --text-dark: #0f172a;
        --text-light: #64748b;
        --border-color: #e2e8f0;
        --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
        --shadow-lg: 0 20px 40px rgba(0,0,0,0.15);
        --shadow-xl: 0 30px 60px rgba(0,0,0,0.2);
      }

      /* ===== DASHBOARD CONTAINER ===== */
      .vilgax-dashboard {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        min-height: 100vh;
        padding: 30px 20px;
        color: white;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        max-width: 1400px;
        margin: 0 auto;
      }

      /* ===== METRIC CARDS ===== */
      .metric-card {
        background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
        border: 1px solid rgba(20, 184, 166, 0.3);
        border-radius: 16px;
        padding: 25px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .metric-card:hover {
        transform: translateY(-5px);
        border-color: rgba(20, 184, 166, 0.6);
        box-shadow: 0 20px 40px rgba(20, 184, 166, 0.2);
      }

      .metric-card.full-width {
        grid-column: 1 / -1;
      }

      .metric-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .metric-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .metric-value {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .metric-subtext {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
      }

      /* ===== PROGRESS BAR ===== */
      .progress-bar {
        background: rgba(255, 255, 255, 0.1);
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 12px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%);
        border-radius: 3px;
        transition: width 0.4s ease;
      }

      /* ===== DOCTOR CARDS ===== */
      .doctor-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
      }

      .doctor-card:hover {
        box-shadow: var(--shadow-xl);
        transform: translateY(-8px);
      }

      .doctor-card-header {
        background: linear-gradient(135deg, var(--primary-teal) 0%, var(--accent-blue) 100%);
        color: white;
        padding: 20px;
        text-align: center;
      }

      .doctor-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin: 0 auto 12px;
      }

      .doctor-name {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 5px;
      }

      .doctor-specialty {
        font-size: 13px;
        opacity: 0.9;
      }

      .doctor-card-body {
        padding: 20px;
        flex: 1;
      }

      .doctor-rating {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .star-rating {
        color: #fbbf24;
        font-size: 14px;
      }

      .doctor-info-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color);
        font-size: 13px;
      }

      .doctor-info-row:last-child {
        border-bottom: none;
      }

      .doctor-info-label {
        color: var(--text-light);
        font-weight: 600;
      }

      .doctor-info-value {
        color: var(--text-dark);
        font-weight: 700;
      }

      .doctor-card-footer {
        padding: 15px 20px;
        background: var(--light-bg);
        border-top: 1px solid var(--border-color);
      }

      .btn-select-doctor {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-select-doctor:hover {
        transform: scale(1.02);
        box-shadow: var(--shadow-lg);
      }

      /* ===== APPOINTMENT STATUS ===== */
      .appointment-status {
        background: white;
        border-radius: 16px;
        padding: 25px;
        box-shadow: var(--shadow-md);
      }

      .status-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
      }

      .status-icon {
        font-size: 40px;
      }

      .status-text h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 5px;
      }

      .status-text p {
        font-size: 13px;
        color: var(--text-light);
      }

      .appointment-details {
        display: grid;
        gap: 12px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--light-bg);
        border-radius: 8px;
      }

      .detail-label {
        font-size: 13px;
        color: var(--text-light);
        font-weight: 600;
      }

      .detail-value {
        font-size: 14px;
        color: var(--text-dark);
        font-weight: 700;
      }

      /* ===== CONSULTATION SUMMARY ===== */
      .consultation-summary {
        background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
        border: 2px solid var(--success);
        border-radius: 16px;
        padding: 25px;
      }

      .summary-title {
        color: var(--text-dark);
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .summary-section {
        margin-bottom: 15px;
      }

      .summary-section-title {
        font-size: 12px;
        color: var(--text-light);
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .summary-section-content {
        font-size: 14px;
        color: var(--text-dark);
        line-height: 1.6;
      }

      /* ===== FEEDBACK FORM ===== */
      .feedback-form {
        background: white;
        border-radius: 16px;
        padding: 25px;
        box-shadow: var(--shadow-md);
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 10px;
      }

      .star-selector {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }

      .star {
        font-size: 32px;
        cursor: pointer;
        transition: all 0.2s ease;
        filter: grayscale(100%);
        opacity: 0.5;
      }

      .star:hover,
      .star.active {
        filter: grayscale(0%);
        opacity: 1;
        transform: scale(1.2);
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .checkbox-item input {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .checkbox-item label {
        cursor: pointer;
        font-size: 14px;
      }

      /* ===== BUTTONS ===== */
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .btn-secondary {
        background: var(--light-bg);
        color: var(--text-dark);
        border: 1px solid var(--border-color);
      }

      .btn-secondary:hover {
        background: var(--border-color);
      }

      .btn-success {
        background: var(--success);
        color: white;
      }

      .btn-success:hover {
        filter: brightness(1.1);
      }

      .btn-danger {
        background: var(--danger);
        color: white;
      }

      .btn-danger:hover {
        filter: brightness(1.1);
      }

      /* ===== BADGE ===== */
      .badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      .badge-success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
      }

      .badge-warning {
        background: rgba(245, 158, 11, 0.1);
        color: var(--warning);
      }

      .badge-danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }

      /* ===== LOADING ANIMATION ===== */
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* ===== TIMELINE ===== */
      .timeline {
        position: relative;
        padding: 20px 0;
      }

      .timeline-item {
        position: relative;
        padding-left: 40px;
        margin-bottom: 20px;
      }

      .timeline-item:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary-cyan);
        border: 3px solid white;
      }

      .timeline-item:after {
        content: '';
        position: absolute;
        left: 4px;
        top: 12px;
        width: 2px;
        height: calc(100% + 8px);
        background: var(--border-color);
      }

      .timeline-item:last-child:after {
        display: none;
      }

      .timeline-title {
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 5px;
      }

      .timeline-time {
        font-size: 12px;
        color: var(--text-light);
      }

      /* ===== CHART ANIMATION ===== */
      .chart-bar {
        height: 100%;
        background: linear-gradient(180deg, var(--primary-cyan) 0%, var(--accent-blue) 100%);
        border-radius: 4px 4px 0 0;
        transition: height 0.6s ease;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .metric-card.full-width {
          grid-column: 1;
        }

        .metric-value {
          font-size: 28px;
        }

        .doctor-card {
          max-width: 100%;
        }

        .star-selector {
          gap: 5px;
        }

        .star {
          font-size: 24px;
        }
      }

      /* ===== ANIMATIONS ===== */
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .slide-in {
        animation: slideIn 0.5s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .fade-in {
        animation: fadeIn 0.3s ease;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .pulse {
        animation: pulse 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  /**
   * Create ML Metrics Dashboard
   */
  createMetricsDashboard() {
    const dashboard = document.createElement('div');
    dashboard.className = 'vilgax-dashboard slide-in';
    dashboard.id = 'vilgaxMetricsDashboard';

    const metricsHTML = `
      <div class="dashboard-grid">
        <!-- Header -->
        <div class="metric-card full-width" style="border: 2px solid rgba(20, 184, 166, 0.6); grid-column: 1 / -1;">
          <h1 style="font-size: 32px; margin-bottom: 10px; background: linear-gradient(135deg, #14b8a6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🧠 VILGAX AI Dashboard</h1>
          <p style="color: rgba(255,255,255,0.7); font-size: 14px;">Professional ML System • Real-Time Performance Tracking</p>
        </div>

        <!-- Overall Accuracy -->
        <div class="metric-card">
          <div class="metric-icon">🎯</div>
          <div class="metric-label">Overall Accuracy</div>
          <div class="metric-value" id="overallAccuracy">85.0%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="overallAccuracyBar" style="width: 85%;"></div>
          </div>
          <div class="metric-subtext">Target: 99.999%</div>
        </div>

        <!-- Severity Classifier -->
        <div class="metric-card">
          <div class="metric-icon">🚨</div>
          <div class="metric-label">Severity Detection</div>
          <div class="metric-value" id="severityAccuracy">85%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="severityBar" style="width: 85%;"></div>
          </div>
          <div class="metric-subtext">Emergency Detection</div>
        </div>

        <!-- Symptom Matching -->
        <div class="metric-card">
          <div class="metric-icon">🔍</div>
          <div class="metric-label">Symptom Matching</div>
          <div class="metric-value" id="matchingAccuracy">80%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="matchingBar" style="width: 80%;"></div>
          </div>
          <div class="metric-subtext">Variant Recognition</div>
        </div>

        <!-- Specialty Prediction -->
        <div class="metric-card">
          <div class="metric-icon">⚕️</div>
          <div class="metric-label">Specialty Prediction</div>
          <div class="metric-value" id="bayesAccuracy">88%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="bayesBar" style="width: 88%;"></div>
          </div>
          <div class="metric-subtext">Naive Bayes Classifier</div>
        </div>

        <!-- Doctor Routing -->
        <div class="metric-card">
          <div class="metric-icon">👨‍⚕️</div>
          <div class="metric-label">Doctor Routing</div>
          <div class="metric-value" id="routingAccuracy">82%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="routingBar" style="width: 82%;"></div>
          </div>
          <div class="metric-subtext">Specialist Matching</div>
        </div>

        <!-- Feedback Samples -->
        <div class="metric-card">
          <div class="metric-icon">📊</div>
          <div class="metric-label">Training Data</div>
          <div class="metric-value" id="feedbackCount">0</div>
          <div class="progress-bar">
            <div class="progress-fill" id="feedbackBar" style="width: 0%;"></div>
          </div>
          <div class="metric-subtext">Doctor Feedback Collected</div>
        </div>

        <!-- Training Iterations -->
        <div class="metric-card">
          <div class="metric-icon">🔄</div>
          <div class="metric-label">Model Training</div>
          <div class="metric-value" id="iterations">0</div>
          <div class="progress-bar">
            <div class="progress-fill" id="iterationsBar" style="width: 0%;"></div>
          </div>
          <div class="metric-subtext">Training Iterations</div>
        </div>

        <!-- System Status -->
        <div class="metric-card full-width">
          <div class="metric-label">🟢 System Status</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
            <div>
              <span class="badge badge-success">ACTIVE</span>
              <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.7);">System Running</p>
            </div>
            <div>
              <span class="badge badge-success">LEARNING</span>
              <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.7);">Models Training</p>
            </div>
            <div>
              <span class="badge badge-success">ONLINE</span>
              <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.7);">Services Available</p>
            </div>
            <div>
              <span class="badge badge-success">OPTIMIZED</span>
              <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.7);">Performance Ready</p>
            </div>
          </div>
        </div>
      </div>
    `;

    dashboard.innerHTML = metricsHTML;
    return dashboard;
  }

  /**
   * Update Dashboard with Real Metrics
   */
  updateMetrics(metrics) {
    if (!metrics) return;

    const updates = {
      'overallAccuracy': `${(metrics.overallAccuracy * 100).toFixed(1)}%`,
      'overallAccuracyBar': { width: `${metrics.overallAccuracy * 100}%` },
      'severityAccuracy': `${(metrics.severityAccuracy * 100).toFixed(0)}%`,
      'severityBar': { width: `${metrics.severityAccuracy * 100}%` },
      'matchingAccuracy': `${(metrics.symptomMatchingAccuracy * 100).toFixed(0)}%`,
      'matchingBar': { width: `${metrics.symptomMatchingAccuracy * 100}%` },
      'bayesAccuracy': `${(metrics.naiveBayesAccuracy * 100).toFixed(0)}%`,
      'bayesBar': { width: `${metrics.naiveBayesAccuracy * 100}%` },
      'routingAccuracy': `${(metrics.doctorRoutingAccuracy * 100).toFixed(0)}%`,
      'routingBar': { width: `${metrics.doctorRoutingAccuracy * 100}%` },
      'feedbackCount': metrics.feedbackSamples.toString(),
      'feedbackBar': { width: `${Math.min(metrics.feedbackSamples / 100 * 100, 100)}%` },
      'iterations': metrics.trainingIterations.toString(),
      'iterationsBar': { width: `${Math.min(metrics.trainingIterations / 50 * 100, 100)}%` }
    };

    for (const [id, value] of Object.entries(updates)) {
      const element = document.getElementById(id);
      if (element) {
        if (typeof value === 'string') {
          element.textContent = value;
        } else {
          Object.assign(element.style, value);
        }
      }
    }
  }

  /**
   * Create Doctor Selection Cards
   */
  createDoctorCards(doctors) {
    const cardsHTML = doctors.map(doctor => `
      <div class="doctor-card slide-in">
        <div class="doctor-card-header">
          <div class="doctor-avatar">👨‍⚕️</div>
          <div class="doctor-name">${doctor.name}</div>
          <div class="doctor-specialty">${doctor.specialty}</div>
        </div>
        <div class="doctor-card-body">
          <div class="doctor-rating">
            <span class="star-rating">⭐ ${doctor.rating}/5</span>
            <span style="font-size: 12px; color: var(--text-light);">${doctor.acceptanceRate}% acceptance</span>
          </div>
          <div class="doctor-info-row">
            <span class="doctor-info-label">Experience</span>
            <span class="doctor-info-value">${doctor.experience}</span>
          </div>
          <div class="doctor-info-row">
            <span class="doctor-info-label">Qualification</span>
            <span class="doctor-info-value">${doctor.qualification}</span>
          </div>
          <div class="doctor-info-row">
            <span class="doctor-info-label">Available Slots</span>
            <span class="doctor-info-value">${doctor.availableSlots.length}</span>
          </div>
          <div class="doctor-info-row">
            <span class="doctor-info-label">Status</span>
            <span class="badge badge-success">Online</span>
          </div>
        </div>
        <div class="doctor-card-footer">
          <button class="btn-select-doctor" onclick="selectDoctor('${doctor.id}', '${doctor.name}')">
            Select Doctor
          </button>
        </div>
      </div>
    `).join('');

    const container = document.createElement('div');
    container.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 30px;';
    container.innerHTML = cardsHTML;
    return container;
  }

  /**
   * Create Appointment Status Display
   */
  createAppointmentStatus(appointment, severity) {
    return `
      <div class="appointment-status slide-in">
        <div class="status-header">
          <div class="status-icon">✅</div>
          <div class="status-text">
            <h3>Appointment Confirmed</h3>
            <p>Your consultation has been scheduled</p>
          </div>
        </div>
        <div class="appointment-details">
          <div class="detail-item">
            <span class="detail-label">Doctor</span>
            <span class="detail-value">${appointment.doctor.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Specialty</span>
            <span class="detail-value">${appointment.doctor.specialty}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Rating</span>
            <span class="detail-value">⭐ ${appointment.doctor.rating}/5</span>
          </div>
          ${severity ? `
          <div class="detail-item">
            <span class="detail-label">Severity</span>
            <span class="badge badge-${severity.level === 'EMERGENCY' ? 'danger' : severity.level === 'URGENT' ? 'warning' : 'success'}">${severity.level}</span>
          </div>
          ` : ''}
          <div class="detail-item">
            <span class="detail-label">Video Room</span>
            <span class="detail-value" style="font-family: monospace; font-size: 12px;">${appointment.videoRoomId}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="badge badge-success">READY</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create Consultation Summary
   */
  createConsultationSummary(patientInfo, analysis) {
    return `
      <div class="consultation-summary slide-in">
        <div class="summary-title">
          <span>✅</span> Consultation Summary
        </div>

        <div class="summary-section">
          <div class="summary-section-title">Patient Information</div>
          <div class="summary-section-content">
            <strong>${patientInfo.name || 'Patient'}</strong> • ${patientInfo.age} years old • ${patientInfo.gender}<br>
            📍 ${patientInfo.location || 'Location not specified'}
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-section-title">Chief Complaints</div>
          <div class="summary-section-content">
            ${patientInfo.symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-section-title">Duration</div>
          <div class="summary-section-content">
            ${patientInfo.duration || 'Not specified'}
          </div>
        </div>

        ${analysis ? `
        <div class="summary-section">
          <div class="summary-section-title">AI Analysis</div>
          <div class="summary-section-content">
            <strong>Severity:</strong> ${analysis.severity.level} (${(analysis.severity.score * 100).toFixed(0)}%)<br>
            <strong>Recommended Specialty:</strong> ${analysis.recommendedSpecialty}<br>
            <strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(1)}%
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create Feedback Form
   */
  createFeedbackForm(appointmentId) {
    return `
      <div class="feedback-form slide-in">
        <h3 style="margin-bottom: 20px; color: var(--text-dark); font-size: 18px;">📝 Share Your Feedback</h3>

        <div class="form-group">
          <label class="form-label">How would you rate your doctor?</label>
          <div class="star-selector" id="doctorRatingStars">
            <span class="star" data-value="1">⭐</span>
            <span class="star" data-value="2">⭐</span>
            <span class="star" data-value="3">⭐</span>
            <span class="star" data-value="4">⭐</span>
            <span class="star" data-value="5">⭐</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Appointment Quality</label>
          <div class="star-selector" id="qualityRatingStars">
            <span class="star" data-value="1">⭐</span>
            <span class="star" data-value="2">⭐</span>
            <span class="star" data-value="3">⭐</span>
            <span class="star" data-value="4">⭐</span>
            <span class="star" data-value="5">⭐</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Was the recommended specialty correct?</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="radio" name="correctSpecialty" value="yes" id="correctYes">
              <label for="correctYes">Yes, very helpful</label>
            </div>
            <div class="checkbox-item">
              <input type="radio" name="correctSpecialty" value="partial" id="correctPartial">
              <label for="correctPartial">Somewhat helpful</label>
            </div>
            <div class="checkbox-item">
              <input type="radio" name="correctSpecialty" value="no" id="correctNo">
              <label for="correctNo">Not helpful</label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Patient Outcome</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="radio" name="outcome" value="positive" id="outcomePositive">
              <label for="outcomePositive">✅ Positive - Feeling better</label>
            </div>
            <div class="checkbox-item">
              <input type="radio" name="outcome" value="neutral" id="outcomeNeutral">
              <label for="outcomeNeutral">➖ Neutral - No change</label>
            </div>
            <div class="checkbox-item">
              <input type="radio" name="outcome" value="negative" id="outcomeNegative">
              <label for="outcomeNegative">❌ Negative - Got worse</label>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="submitFeedbackForm('${appointmentId}')">
          Submit Feedback & Help VILGAX Learn
        </button>
      </div>
    `;
  }
}

// Initialize UI Manager globally
const vilgaxUI = new VILGAXUIManager();

// Add to window for access
window.vilgaxUI = vilgaxUI;

console.log('🎨 VILGAX Professional UI System Initialized');
