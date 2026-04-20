/**
 * VILGAX Appointment Reminders System
 * Manages appointment scheduling, reminders, and notifications
 * 
 * Features:
 * - Voice-based appointment booking with reminders
 * - Local reminder notifications
 * - Multiple reminder times (15min, 1hour, 1day before)
 * - Persistent storage with IndexedDB
 * - Calendar integration support
 * - Voice notifications
 */

class VilgaxAppointmentReminders {
  constructor() {
    this.appointments = [];
    this.reminders = [];
    this.notificationPermission = false;
    this.checkInterval = null;
    this.dbName = 'vilgax_appointments';
    this.storeName = 'appointments';
    
    this.init();
    console.log('📅 VILGAX Appointment Reminders initialized');
  }

  /**
   * Initialize reminders system
   */
  async init() {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.notificationPermission = true;
      } else if (Notification.permission !== 'denied') {
        try {
          const permission = await Notification.requestPermission();
          this.notificationPermission = permission === 'granted';
        } catch (error) {
          console.log('Notification permission denied:', error);
        }
      }
    }
    
    // Load appointments from storage
    await this.loadAppointments();
    
    // Start checking for reminders (every minute)
    this.startReminderCheck();
    
    console.log(`✅ Reminders system ready with notification ${this.notificationPermission ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load appointments from persistent storage
   */
  async loadAppointments() {
    try {
      const stored = localStorage.getItem('vilgax_appointments');
      if (stored) {
        this.appointments = JSON.parse(stored);
        console.log(`📂 Loaded ${this.appointments.length} appointments from storage`);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      this.appointments = [];
    }
  }

  /**
   * Save appointments to persistent storage
   */
  async saveAppointments() {
    try {
      localStorage.setItem('vilgax_appointments', JSON.stringify(this.appointments));
      console.log('💾 Appointments saved to storage');
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  }

  /**
   * Book appointment via voice or form
   */
  async bookAppointment(appointmentData) {
    const appointment = {
      id: this.generateId(),
      ...appointmentData,
      createdAt: new Date().toISOString(),
      reminders: [
        { offset: 24 * 60, unit: 'minutes', sent: false }, // 1 day before
        { offset: 60, unit: 'minutes', sent: false },       // 1 hour before
        { offset: 15, unit: 'minutes', sent: false }        // 15 minutes before
      ],
      status: 'confirmed'
    };
    
    // Validate appointment data
    if (!this.validateAppointment(appointment)) {
      console.error('Invalid appointment data');
      return null;
    }
    
    this.appointments.push(appointment);
    await this.saveAppointments();
    
    console.log(`✅ Appointment booked: ${appointment.id}`);
    this.notifyAppointmentConfirmed(appointment);
    
    return appointment;
  }

  /**
   * Validate appointment data
   */
  validateAppointment(appointment) {
    const required = ['doctorName', 'appointmentTime', 'patientName', 'patientPhone'];
    return required.every(field => appointment[field]);
  }

  /**
   * Start checking for reminders
   */
  startReminderCheck() {
    // Clear existing interval
    if (this.checkInterval) clearInterval(this.checkInterval);
    
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkAndSendReminders();
    }, 60000); // 60 seconds
    
    // Also check immediately
    this.checkAndSendReminders();
  }

  /**
   * Check and send due reminders
   */
  async checkAndSendReminders() {
    const now = new Date();
    let remindersSent = 0;
    
    for (const appointment of this.appointments) {
      if (appointment.status !== 'confirmed') continue;
      
      const appointmentTime = new Date(appointment.appointmentTime);
      
      for (const reminder of appointment.reminders) {
        if (reminder.sent) continue; // Already sent
        
        const reminderTime = new Date(appointmentTime.getTime() - reminder.offset * 60000);
        
        if (now >= reminderTime) {
          this.sendReminder(appointment, reminder);
          reminder.sent = true;
          remindersSent++;
        }
      }
    }
    
    if (remindersSent > 0) {
      await this.saveAppointments();
      console.log(`📢 Sent ${remindersSent} reminder(s)`);
    }
  }

  /**
   * Send reminder notification and voice alert
   */
  sendReminder(appointment, reminder) {
    const appointmentTime = new Date(appointment.appointmentTime);
    const minutesUntil = reminder.offset;
    
    const message = minutesUntil >= 60
      ? `Reminder: Your appointment with ${appointment.doctorName} is in ${Math.round(minutesUntil / 60)} hour(s)`
      : `Reminder: Your appointment with ${appointment.doctorName} is in ${minutesUntil} minutes`;
    
    // Browser notification
    if (this.notificationPermission) {
      try {
        new Notification('VILGAX Appointment Reminder', {
          body: message,
          icon: '/images/vilgax-icon.png',
          badge: '/images/vilgax-badge.png',
          tag: `appointment-${appointment.id}`,
          requireInteraction: minutesUntil <= 15 // Important if less than 15 min
        });
      } catch (error) {
        console.log('Notification failed:', error);
      }
    }
    
    // Voice notification
    if (window.audio && audio.speak) {
      audio.speak(message);
    }
    
    // Store reminder sent in appointment history
    appointment.lastReminderTime = new Date().toISOString();
    appointment.lastReminderMessage = message;
    
    console.log(`📬 Reminder sent for appointment ${appointment.id}: ${message}`);
  }

  /**
   * Notify appointment confirmation
   */
  notifyAppointmentConfirmed(appointment) {
    const message = `Your appointment with ${appointment.doctorName} is confirmed for ${new Date(appointment.appointmentTime).toLocaleString()}`;
    
    // Browser notification
    if (this.notificationPermission) {
      try {
        new Notification('Appointment Confirmed', {
          body: message,
          icon: '/images/vilgax-icon.png'
        });
      } catch (error) {
        console.log('Notification failed:', error);
      }
    }
    
    // Voice notification
    if (window.audio && audio.speak) {
      audio.speak(`Appointment confirmed with ${appointment.doctorName}. I'll remind you before your appointment.`);
    }
  }

  /**
   * Get upcoming appointments
   */
  getUpcomingAppointments(days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.appointments.filter(apt => {
      const aptTime = new Date(apt.appointmentTime);
      return aptTime >= now && aptTime <= future && apt.status === 'confirmed';
    }).sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
  }

  /**
   * Get appointment by ID
   */
  getAppointment(appointmentId) {
    return this.appointments.find(apt => apt.id === appointmentId);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId) {
    const appointment = this.getAppointment(appointmentId);
    if (!appointment) return false;
    
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date().toISOString();
    
    await this.saveAppointments();
    
    if (window.audio && audio.speak) {
      audio.speak(`Your appointment with ${appointment.doctorName} has been cancelled.`);
    }
    
    console.log(`❌ Appointment cancelled: ${appointmentId}`);
    return true;
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId, newTime) {
    const appointment = this.getAppointment(appointmentId);
    if (!appointment) return false;
    
    const oldTime = new Date(appointment.appointmentTime).toLocaleString();
    appointment.appointmentTime = newTime;
    appointment.rescheduledAt = new Date().toISOString();
    appointment.reminders.forEach(r => r.sent = false); // Reset reminder flags
    
    await this.saveAppointments();
    
    if (window.audio && audio.speak) {
      audio.speak(`Your appointment has been rescheduled to ${new Date(newTime).toLocaleString()}`);
    }
    
    console.log(`🔄 Appointment rescheduled: ${appointmentId} from ${oldTime} to ${newTime}`);
    return true;
  }

  /**
   * Get appointment statistics
   */
  getStatistics() {
    const confirmed = this.appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = this.appointments.filter(a => a.status === 'cancelled').length;
    const upcoming = this.getUpcomingAppointments().length;
    const completed = this.appointments.filter(a => a.status === 'completed').length;
    
    return {
      totalAppointments: this.appointments.length,
      confirmed,
      cancelled,
      upcoming,
      completed,
      remindersScheduled: this.appointments.reduce((sum, a) => sum + a.reminders.filter(r => !r.sent).length, 0)
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get voice-friendly appointment summary
   */
  getVoiceSummary(appointmentId) {
    const appointment = this.getAppointment(appointmentId);
    if (!appointment) return null;
    
    const time = new Date(appointment.appointmentTime);
    const today = new Date();
    const days = Math.floor((time - today) / (24 * 60 * 60 * 1000));
    
    let timeDescription = '';
    if (days === 0) timeDescription = `today at ${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    else if (days === 1) timeDescription = `tomorrow at ${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    else timeDescription = `in ${days} days at ${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    return `Your appointment with ${appointment.doctorName} ${timeDescription}. Location: ${appointment.location || 'Not specified'}`;
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      appointmentCount: this.appointments.length,
      upcomingCount: this.getUpcomingAppointments().length,
      statistics: this.getStatistics(),
      notificationsEnabled: this.notificationPermission,
      reminderCheckActive: this.checkInterval !== null
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Initialize appointment reminders globally
let vilgaxAppointmentReminders;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgaxAppointmentReminders = new VilgaxAppointmentReminders();
  });
} else {
  vilgaxAppointmentReminders = new VilgaxAppointmentReminders();
}
