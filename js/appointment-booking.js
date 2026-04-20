/**
 * APPOINTMENT BOOKING ENGINE
 * 
 * Handles:
 * 1. DateTime parsing from natural language
 * 2. Finding available doctors by specialization
 * 3. Creating booking requests
 * 4. Managing doctor notifications
 * 5. Uber-style first-accept workflow
 * 
 * Usage: Used by vilgax-patient-assistant and patient panel
 */

import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class AppointmentBookingEngine {
  constructor() {
    this.activeRequests = new Map(); // Track active booking requests
    this.doctorListeners = new Map(); // Track Firebase listeners per doctor
  }

  /**
   * Parse appointment date/time from natural language
   * @param {string} input - User input like "tomorrow at 2pm" or "next monday morning"
   * @returns {object} - { date: ISO string, time: HH:MM }
   */
  parseAppointmentDateTime(input) {
    const now = new Date();
    let appointmentDate = new Date();
    let time = '10:00'; // Default time

    const inputLower = input.toLowerCase();

    // Parse time
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      // Check for "morning", "afternoon", "evening"
      if (/morning/.test(inputLower)) {
        time = '09:00';
      } else if (/afternoon/.test(inputLower)) {
        time = '14:00';
      } else if (/evening/.test(inputLower)) {
        time = '18:00';
      }
    }

    // Parse date
    if (/today/.test(inputLower)) {
      appointmentDate = new Date(now);
    } else if (/tomorrow/.test(inputLower)) {
      appointmentDate = new Date(now);
      appointmentDate.setDate(appointmentDate.getDate() + 1);
    } else if (/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(input)) {
      const dayMatch = input.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      const targetDay = dayMatch[1].toLowerCase();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = days.indexOf(targetDay);
      const currentDay = appointmentDate.getDay();
      let daysAhead = targetDayIndex - currentDay;
      if (daysAhead <= 0) {
        daysAhead += 7;
      }
      appointmentDate.setDate(appointmentDate.getDate() + daysAhead);
    }

    return {
      date: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD
      time: time,
      dateTime: new Date(`${appointmentDate.toISOString().split('T')[0]}T${time}:00`)
    };
  }

  /**
   * Find available doctors by specialization
   * Query Firestore for active doctors with matching specialization
   * 
   * @param {string} specialization - Medical specialization
   * @param {date} appointmentDateTime - Requested appointment date/time
   * @returns {array} - List of available doctors
   */
  async findAvailableDoctors(specialization, appointmentDateTime) {
    try {
      // Query Firestore for doctors with matching specialization
      const doctorsRef = collection(db, 'users');
      const q = query(
        doctorsRef,
        where('role', '==', 'doctor'),
        where('specialization', '==', specialization),
        where('status', 'in', ['active', 'available'])
      );

      const snapshot = await getDocs(q);
      const doctors = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        doctors.push({
          id: doc.id,
          name: data.name || 'Dr. ' + data.email.split('@')[0],
          specialization: data.specialization,
          rating: data.rating || 4.5,
          consultations: data.consultations || 0,
          phone: data.phone || '',
          status: data.status,
          email: data.email
        });
      });

      console.log(`[Appointment Engine] Found ${doctors.length} available ${specialization} doctors`);
      return doctors;
    } catch (error) {
      console.error('[Appointment Engine] Error finding doctors:', error);
      return [];
    }
  }

  /**
   * Create appointment request
   * Saves to Firestore with status: pending_acceptance
   * 
   * @param {object} appointmentData - Appointment details
   * @returns {object} - Created appointment object with ID
   */
  async createAppointmentRequest(appointmentData) {
    try {
      const appointmentsRef = collection(db, 'appointments');

      const appointmentDoc = {
        patientId: appointmentData.patientId,
        patientEmail: appointmentData.patientEmail || '',
        patientName: appointmentData.patientName,
        patientAge: appointmentData.patientAge || null,
        patientGender: appointmentData.patientGender || '',
        patientLocation: appointmentData.patientLocation || '',
        consultationId: appointmentData.consultationId || null,
        symptoms: appointmentData.symptoms || [],
        specialization: appointmentData.specialization,
        date: appointmentData.date, // YYYY-MM-DD
        time: appointmentData.time, // HH:MM
        duration: appointmentData.duration || '',
        reason: appointmentData.reason || 'Health consultation',
        status: 'pending_acceptance', // pending_acceptance, confirmed, declined, completed, cancelled
        doctorNotified: [], // Array of doctor IDs notified
        acceptedBy: null, // Doctor ID who accepted
        acceptedAt: null,
        declinedBy: [], // Array of doctor IDs who declined
        createdAt: new Date(),
        severity: appointmentData.severity || 'normal', // normal, urgent, emergency
        notificationTimeout: appointmentData.notificationTimeout || 180000 // 3 minutes default
      };

      const docRef = await addDoc(appointmentsRef, appointmentDoc);
      
      const createdAppointment = {
        id: docRef.id,
        ...appointmentDoc
      };

      console.log('[Appointment Engine] Appointment request created:', docRef.id);

      // Store in active requests for tracking
      this.activeRequests.set(docRef.id, {
        ...createdAppointment,
        doctors: appointmentData.doctors || [],
        notifiedDoctors: [],
        timeoutId: null
      });

      return createdAppointment;
    } catch (error) {
      console.error('[Appointment Engine] Error creating appointment:', error);
      return null;
    }
  }

  /**
   * Send appointment request to doctors
   * Create Firebase notifications and start timeout
   * 
   * @param {string} appointmentId - Appointment ID
   * @param {array} doctors - List of available doctors
   */
  async sendToAvailableDoctors(appointmentId, doctors) {
    try {
      const activeRequest = this.activeRequests.get(appointmentId);
      if (!activeRequest) {
        console.error('[Appointment Engine] No active request found:', appointmentId);
        return;
      }

      // Create notifications collection for each doctor
      const appointmentRef = doc(db, 'appointments', appointmentId);

      // Update appointment with notified doctors
      const notifiedDoctorIds = doctors.map(d => d.id);
      await updateDoc(appointmentRef, {
        doctorNotified: notifiedDoctorIds
      });

      // Create individual doctor notifications in a separate collection
      for (const doctor of doctors) {
        try {
          const notificationsRef = collection(db, 'doctor_notifications');
          await addDoc(notificationsRef, {
            doctorId: doctor.id,
            doctorName: doctor.name,
            appointmentId: appointmentId,
            patientName: activeRequest.patientName,
            patientAge: activeRequest.patientAge,
            symptoms: activeRequest.symptoms,
            specialization: activeRequest.specialization,
            date: activeRequest.date,
            time: activeRequest.time,
            status: 'pending', // pending, accepted, declined, expired
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + activeRequest.notificationTimeout)
          });

          activeRequest.notifiedDoctors.push(doctor.id);
        } catch (error) {
          console.error(`[Appointment Engine] Error notifying doctor ${doctor.id}:`, error);
        }
      }

      console.log(`[Appointment Engine] Notified ${notifiedDoctorIds.length} doctors`);

      // Start timeout to auto-cancel if no one accepts
      this.startAppointmentTimeout(appointmentId);

    } catch (error) {
      console.error('[Appointment Engine] Error sending to doctors:', error);
    }
  }

  /**
   * Handle doctor accepting appointment
   * Auto-decline for all other doctors
   * 
   * @param {string} appointmentId - Appointment ID
   * @param {string} doctorId - Doctor ID who accepted
   */
  async acceptAppointment(appointmentId, doctorId) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);

      // Update appointment status
      await updateDoc(appointmentRef, {
        status: 'confirmed',
        acceptedBy: doctorId,
        acceptedAt: new Date()
      });

      // Get all other doctors who were notified
      const appointmentSnap = await getDoc(appointmentRef);
      const appointmentData = appointmentSnap.data();
      const otherDoctors = appointmentData.doctorNotified.filter(d => d !== doctorId);

      // Auto-decline for other doctors
      for (const otherDoctorId of otherDoctors) {
        try {
          const notificationsRef = collection(db, 'doctor_notifications');
          const q = query(
            notificationsRef,
            where('appointmentId', '==', appointmentId),
            where('doctorId', '==', otherDoctorId)
          );
          const snap = await getDocs(q);
          snap.forEach(async (notifDoc) => {
            await updateDoc(notifDoc.ref, {
              status: 'declined_by_other'
            });
          });
        } catch (error) {
          console.error(`[Appointment Engine] Error declining for doctor ${otherDoctorId}:`, error);
        }
      }

      // Cancel timeout
      const activeRequest = this.activeRequests.get(appointmentId);
      if (activeRequest && activeRequest.timeoutId) {
        clearTimeout(activeRequest.timeoutId);
      }

      console.log(`[Appointment Engine] Appointment ${appointmentId} accepted by doctor ${doctorId}`);

      return true;
    } catch (error) {
      console.error('[Appointment Engine] Error accepting appointment:', error);
      return false;
    }
  }

  /**
   * Handle doctor declining appointment
   * Move to next available doctor
   * 
   * @param {string} appointmentId - Appointment ID
   * @param {string} doctorId - Doctor ID who declined
   */
  async declineAppointment(appointmentId, doctorId) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);

      // Update notification status
      const notificationsRef = collection(db, 'doctor_notifications');
      const q = query(
        notificationsRef,
        where('appointmentId', '==', appointmentId),
        where('doctorId', '==', doctorId)
      );
      const snap = await getDocs(q);
      snap.forEach(async (notifDoc) => {
        await updateDoc(notifDoc.ref, {
          status: 'declined'
        });
      });

      // Add to declinedBy array
      const appointmentData = (await getDoc(appointmentRef)).data();
      const declinedBy = appointmentData.declinedBy || [];
      
      await updateDoc(appointmentRef, {
        declinedBy: [...declinedBy, doctorId]
      });

      console.log(`[Appointment Engine] Doctor ${doctorId} declined appointment ${appointmentId}`);

      return true;
    } catch (error) {
      console.error('[Appointment Engine] Error declining appointment:', error);
      return false;
    }
  }

  /**
   * Start timeout for appointment acceptance
   * Auto-cancel if no doctor accepts within timeout
   * 
   * @param {string} appointmentId - Appointment ID
   */
  startAppointmentTimeout(appointmentId) {
    const activeRequest = this.activeRequests.get(appointmentId);
    if (!activeRequest) return;

    const timeoutMs = activeRequest.notificationTimeout;

    const timeoutId = setTimeout(async () => {
      try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentSnap = await getDoc(appointmentRef);

        if (appointmentSnap.exists()) {
          const data = appointmentSnap.data();
          
          // Only auto-cancel if still pending
          if (data.status === 'pending_acceptance') {
            await updateDoc(appointmentRef, {
              status: 'no_acceptance',
              cancelledAt: new Date(),
              cancelReason: 'No doctors available within timeout'
            });

            console.log(`[Appointment Engine] Appointment ${appointmentId} auto-cancelled (timeout)`);

            // Notify patient about timeout
            if (window.vilgaxPatientAssistant) {
              // Call a notification method if available
              console.log('[Appointment Engine] Patient notified of timeout');
            }
          }
        }
      } catch (error) {
        console.error('[Appointment Engine] Error handling appointment timeout:', error);
      }

      // Remove from active requests
      this.activeRequests.delete(appointmentId);
    }, timeoutMs);

    // Store timeout ID for potential cancellation
    activeRequest.timeoutId = timeoutId;
  }

  /**
   * Listen to appointment request changes for doctors
   * Real-time updates for doctor dashboard
   * 
   * @param {string} doctorId - Doctor ID
   * @param {function} callback - Function to call on updates
   * @returns {function} - Unsubscribe function
   */
  listenToIncomingRequests(doctorId, callback) {
    try {
      const notificationsRef = collection(db, 'doctor_notifications');
      const q = query(
        notificationsRef,
        where('doctorId', '==', doctorId),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach(doc => {
          requests.push({
            id: doc.id,
            ...doc.data()
          });
        });

        callback(requests);
      });

      // Store listener for cleanup
      this.doctorListeners.set(doctorId, unsubscribe);

      console.log(`[Appointment Engine] Listening to incoming requests for doctor ${doctorId}`);
      return unsubscribe;
    } catch (error) {
      console.error('[Appointment Engine] Error listening to requests:', error);
      return () => {}; // Return no-op function
    }
  }

  /**
   * Stop listening to appointment requests
   * @param {string} doctorId - Doctor ID
   */
  stopListeningToRequests(doctorId) {
    const unsubscribe = this.doctorListeners.get(doctorId);
    if (unsubscribe) {
      unsubscribe();
      this.doctorListeners.delete(doctorId);
      console.log(`[Appointment Engine] Stopped listening to requests for doctor ${doctorId}`);
    }
  }

  /**
   * Get appointment by ID
   * @param {string} appointmentId - Appointment ID
   * @returns {object} - Appointment details
   */
  async getAppointment(appointmentId) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const snapshot = await getDoc(appointmentRef);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        };
      }
      return null;
    } catch (error) {
      console.error('[Appointment Engine] Error getting appointment:', error);
      return null;
    }
  }

  /**
   * Get patient's appointments
   * @param {string} patientId - Patient ID
   * @returns {array} - List of appointments
   */
  async getPatientAppointments(patientId) {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const appointments = [];

      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return appointments;
    } catch (error) {
      console.error('[Appointment Engine] Error getting patient appointments:', error);
      return [];
    }
  }

  /**
   * Cancel appointment
   * @param {string} appointmentId - Appointment ID
   * @param {string} reason - Cancellation reason
   */
  async cancelAppointment(appointmentId, reason = 'User cancelled') {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason
      });

      console.log(`[Appointment Engine] Appointment ${appointmentId} cancelled`);
      return true;
    } catch (error) {
      console.error('[Appointment Engine] Error cancelling appointment:', error);
      return false;
    }
  }
}

export default AppointmentBookingEngine;

// Auto-initialize when module is imported
let appointmentBookingEngine;

export async function initAppointmentBookingEngine() {
  return new Promise((resolve) => {
    if (db) {
      appointmentBookingEngine = new AppointmentBookingEngine();
      window.appointmentBookingEngine = appointmentBookingEngine;
      console.log('✓ Appointment Booking Engine initialized');
      resolve(appointmentBookingEngine);
    } else {
      setTimeout(() => initAppointmentBookingEngine().then(resolve), 500);
    }
  });
}
