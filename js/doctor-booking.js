/**
 * Doctor Booking System
 * Manages doctor availability, appointment requests, and video call routing
 * Implements Uber-like first-accept model where first doctor to accept gets the call
 */

class DoctorBookingSystem {
  constructor() {
    this.doctors = new Map();
    this.appointmentRequests = new Map();
    this.activeAppointments = new Map();
    this.requestId = 0;

    this.initDoctors();
  }

  /**
   * Initialize sample doctors with specialties and availability
   * In production, this would fetch from backend API
   */
  initDoctors() {
    const doctorsData = [
      // Gastroenterology
      {
        id: 'doc_001',
        name: 'Dr. Rajesh Kumar',
        specialty: 'Gastroenterology',
        qualification: 'MD, DM (Gastroenterology)',
        experience: '12 years',
        rating: 4.8,
        availableSlots: ['09:00', '09:30', '10:00', '14:00', '14:30', '15:00'],
        isOnline: true,
        acceptanceRate: 95
      },
      {
        id: 'doc_002',
        name: 'Dr. Priya Sharma',
        specialty: 'Gastroenterology',
        qualification: 'MD, DM (Gastroenterology)',
        experience: '8 years',
        rating: 4.7,
        availableSlots: ['10:00', '10:30', '11:00', '15:00', '15:30'],
        isOnline: true,
        acceptanceRate: 92
      },

      // General Practice
      {
        id: 'doc_003',
        name: 'Dr. Arun Singh',
        specialty: 'General Practice',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '10 years',
        rating: 4.9,
        availableSlots: ['08:00', '08:30', '09:00', '14:00', '16:00'],
        isOnline: true,
        acceptanceRate: 98
      },
      {
        id: 'doc_004',
        name: 'Dr. Anjali Gupta',
        specialty: 'General Practice',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '6 years',
        rating: 4.6,
        availableSlots: ['09:30', '10:30', '11:00', '13:00', '15:00'],
        isOnline: true,
        acceptanceRate: 90
      },

      // Cardiology
      {
        id: 'doc_005',
        name: 'Dr. Vikram Malhotra',
        specialty: 'Cardiology',
        qualification: 'MD, DM (Cardiology)',
        experience: '15 years',
        rating: 4.9,
        availableSlots: ['10:00', '11:00', '13:00', '14:00'],
        isOnline: true,
        acceptanceRate: 96
      },

      // Neurology
      {
        id: 'doc_006',
        name: 'Dr. Sanjay Patel',
        specialty: 'Neurology',
        qualification: 'MD, DM (Neurology)',
        experience: '11 years',
        rating: 4.7,
        availableSlots: ['09:00', '10:00', '14:00', '15:00', '16:00'],
        isOnline: true,
        acceptanceRate: 94
      },

      // Dermatology
      {
        id: 'doc_007',
        name: 'Dr. Meera Rao',
        specialty: 'Dermatology',
        qualification: 'MD, DDV (Dermatology)',
        experience: '9 years',
        rating: 4.8,
        availableSlots: ['09:00', '10:30', '13:00', '14:30', '15:30'],
        isOnline: true,
        acceptanceRate: 93
      },

      // Orthopedics
      {
        id: 'doc_008',
        name: 'Dr. Rohan Desai',
        specialty: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: '13 years',
        rating: 4.8,
        availableSlots: ['08:00', '09:00', '10:00', '15:00', '16:00'],
        isOnline: true,
        acceptanceRate: 95
      },

      // Psychiatry
      {
        id: 'doc_009',
        name: 'Dr. Neha Yadav',
        specialty: 'Psychiatry',
        qualification: 'MD, DM (Psychiatry)',
        experience: '7 years',
        rating: 4.7,
        availableSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
        isOnline: true,
        acceptanceRate: 91
      },

      // Pulmonology
      {
        id: 'doc_010',
        name: 'Dr. Deepak Verma',
        specialty: 'Pulmonology',
        qualification: 'MD, DM (Pulmonology)',
        experience: '10 years',
        rating: 4.8,
        availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:30'],
        isOnline: true,
        acceptanceRate: 94
      }
    ];

    doctorsData.forEach(doctor => {
      this.doctors.set(doctor.id, doctor);
    });
  }

  /**
   * Find available doctors by specialty
   */
  findDoctorsBySpecialty(specialty) {
    const availableDoctors = Array.from(this.doctors.values())
      .filter(doc => doc.specialty === specialty && doc.isOnline)
      .sort((a, b) => b.rating - a.rating); // Sort by rating
    
    return availableDoctors;
  }

  /**
   * Create an appointment request (broadcasts to doctors)
   */
  createAppointmentRequest(patientInfo, specialty, preferredTime) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request = {
      requestId,
      patientInfo,
      specialty,
      preferredTime,
      createdAt: new Date(),
      status: 'pending', // pending -> accepted -> active -> completed
      acceptedByDoctor: null,
      acceptedAt: null,
      videoRoomId: null,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes to accept
    };

    this.appointmentRequests.set(requestId, request);

    // Log request
    console.log(`📋 Appointment Request Created: ${requestId}`);
    console.log(`   Specialty: ${specialty}`);
    console.log(`   Patient: ${patientInfo.name || 'Anonymous'}`);
    console.log(`   Expires in 2 minutes`);

    // In production, broadcast to all doctors in specialty
    this.broadcastToDocdoctors(request);

    return request;
  }

  /**
   * Broadcast request to available doctors (simulated)
   */
  broadcastToDocdoctors(request) {
    const doctors = this.findDoctorsBySpecialty(request.specialty);
    
    console.log(`📢 Broadcasting to ${doctors.length} doctors in ${request.specialty}`);
    doctors.forEach(doctor => {
      console.log(`   - Sent to: ${doctor.name} (${doctor.id})`);
    });

    // Simulate automatic acceptance by first doctor (highest rating)
    if (doctors.length > 0) {
      setTimeout(() => {
        const acceptingDoctor = doctors[0];
        this.acceptAppointment(request.requestId, acceptingDoctor.id);
      }, 1000); // 1 second delay for realism
    }
  }

  /**
   * Doctor accepts the appointment request
   */
  acceptAppointment(requestId, doctorId) {
    const request = this.appointmentRequests.get(requestId);
    if (!request) return null;

    if (request.status !== 'pending') {
      console.log(`❌ Request ${requestId} already ${request.status}`);
      return null;
    }

    const doctor = this.doctors.get(doctorId);
    if (!doctor) return null;

    // Mark as accepted
    request.status = 'accepted';
    request.acceptedByDoctor = doctorId;
    request.acceptedAt = new Date();
    request.videoRoomId = this.generateVideoRoomId();

    // Create active appointment
    const appointment = {
      appointmentId: `apt_${Date.now()}`,
      requestId,
      doctorId,
      doctor: doctor,
      patientInfo: request.patientInfo,
      specialty: request.specialty,
      startTime: request.preferredTime || new Date(),
      videoRoomId: request.videoRoomId,
      status: 'accepted' // accepted -> started -> ended
    };

    this.activeAppointments.set(appointment.appointmentId, appointment);

    console.log(`✅ Appointment Accepted!`);
    console.log(`   Doctor: ${doctor.name} (${doctor.specialty})`);
    console.log(`   Video Room: ${request.videoRoomId}`);

    // Cancel all other pending requests from same specialty
    this.cancelCompetingRequests(requestId);

    return appointment;
  }

  /**
   * Cancel competing requests (Uber-like model)
   * When one doctor accepts, other requests expire
   */
  cancelCompetingRequests(acceptedRequestId) {
    const acceptedRequest = this.appointmentRequests.get(acceptedRequestId);
    
    for (const [id, request] of this.appointmentRequests) {
      if (id !== acceptedRequestId && 
          request.specialty === acceptedRequest.specialty && 
          request.status === 'pending') {
        request.status = 'cancelled';
        console.log(`🚫 Cancelled competing request: ${id}`);
      }
    }
  }

  /**
   * Get appointment details
   */
  getAppointment(appointmentId) {
    return this.activeAppointments.get(appointmentId);
  }

  /**
   * Get appointment request status
   */
  getRequestStatus(requestId) {
    return this.appointmentRequests.get(requestId);
  }

  /**
   * Generate unique video room ID
   */
  generateVideoRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start video call
   */
  startVideoCall(appointmentId) {
    const appointment = this.activeAppointments.get(appointmentId);
    if (!appointment) return null;

    appointment.status = 'started';
    appointment.videoStartTime = new Date();

    console.log(`📹 Starting video call...`);
    console.log(`   Room: ${appointment.videoRoomId}`);
    console.log(`   Patient: ${appointment.patientInfo.name}`);
    console.log(`   Doctor: ${appointment.doctor.name}`);

    return appointment;
  }

  /**
   * End video call and complete appointment
   */
  endVideoCall(appointmentId) {
    const appointment = this.activeAppointments.get(appointmentId);
    if (!appointment) return null;

    appointment.status = 'ended';
    appointment.videoEndTime = new Date();
    appointment.duration = Math.round(
      (appointment.videoEndTime - appointment.videoStartTime) / 60000
    ); // minutes

    console.log(`📞 Video call ended`);
    console.log(`   Duration: ${appointment.duration} minutes`);

    return appointment;
  }

  /**
   * Format appointment summary for display
   */
  formatAppointmentSummary(appointment) {
    if (!appointment) return 'Appointment not found';

    let summary = [];
    summary.push(`✅ Appointment Confirmed!\n`);
    summary.push(`👨‍⚕️ Doctor: ${appointment.doctor.name}`);
    summary.push(`🏥 Specialty: ${appointment.doctor.specialty}`);
    summary.push(`📍 Experience: ${appointment.doctor.experience}`);
    summary.push(`⭐ Rating: ${appointment.doctor.rating}/5`);
    summary.push(`🎥 Video Room: ${appointment.videoRoomId}`);
    summary.push(`📱 Status: ${appointment.status.toUpperCase()}`);
    
    return summary.join('\n');
  }

  /**
   * Format list of available doctors
   */
  formatDoctorList(doctors) {
    if (doctors.length === 0) return 'No doctors available';

    let list = [];
    doctors.forEach((doc, index) => {
      list.push(`${index + 1}. **${doc.name}**`);
      list.push(`   ${doc.specialty} | ${doc.experience}`);
      list.push(`   Rating: ⭐ ${doc.rating}/5 | Available: ${doc.availableSlots.length} slots`);
    });

    return list.join('\n');
  }
}

// Initialize globally
const doctorBookingSystem = new DoctorBookingSystem();
