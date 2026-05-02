/**
 * ScheduledNotificationManager - Handles time-based appointment notifications
 * Monitors consultations and sends notifications when appointment time arrives
 */
class ScheduledNotificationManager {
  constructor() {
    this.checkInterval = null;
    this.lastCheckedTime = null;
    this.notifiedConsultations = new Set(); // Track which consultations have been notified
    this.isRunning = false;
  }

  /**
   * Start monitoring scheduled consultations
   * @param {number} intervalSeconds - How often to check (default: 60 seconds)
   */
  start(intervalSeconds = 60) {
    if (this.isRunning) {
      console.log('⚠️ ScheduledNotificationManager already running');
      return;
    }

    this.isRunning = true;
    console.log('✓ ScheduledNotificationManager started - checking every ' + intervalSeconds + 's');

    // Initial check
    this.checkScheduledConsultations();

    // Set up interval to check periodically
    this.checkInterval = setInterval(() => {
      this.checkScheduledConsultations();
    }, intervalSeconds * 1000);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isRunning = false;
      console.log('✓ ScheduledNotificationManager stopped');
    }
  }

  /**
   * Check all scheduled consultations and send notifications when time arrives
   */
  checkScheduledConsultations() {
    try {
      const consultations = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      const now = new Date();

      consultations.forEach(consultation => {
        // Only check pending and accepted consultations that have a preferred time
        if (!consultation.preferredTime || consultation.status === 'completed') {
          return;
        }

        // Skip if already notified
        if (this.notifiedConsultations.has(consultation.id)) {
          return;
        }

        const appointmentTime = new Date(consultation.preferredTime);
        const timeDiffMs = appointmentTime.getTime() - now.getTime();
        const timeDiffMinutes = Math.round(timeDiffMs / (1000 * 60));

        // Send notification if within 2 minutes before appointment
        if (timeDiffMinutes <= 2 && timeDiffMinutes >= 0) {
          this.sendAppointmentNotification(consultation, timeDiffMinutes);
          this.notifiedConsultations.add(consultation.id);
        }
      });
    } catch (error) {
      console.error('Error checking scheduled consultations:', error);
    }
  }

  /**
   * Send appointment notification to both doctor and patient
   * @param {object} consultation - The consultation object
   * @param {number} minutesUntil - Minutes until appointment (0-2)
   */
  sendAppointmentNotification(consultation, minutesUntil) {
    try {
      const doctorData = JSON.parse(localStorage.getItem('doctorData') || '{}');
      const patientProfile = JSON.parse(localStorage.getItem('patientProfile') || '{}');
      const doctorProfile = JSON.parse(localStorage.getItem('doctorProfile') || '{}');

      let timeMessage = minutesUntil === 0 ? 'now' : `in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`;

      // Create appointment notification object
      const appointmentNotification = {
        type: 'appointment_time_reached',
        consultationId: consultation.id,
        patientName: consultation.patientName,
        doctorName: doctorProfile.name || doctorData.name || 'Doctor',
        doctorId: consultation.acceptedBy,
        appointmentTime: consultation.preferredTime,
        timeMessage: timeMessage,
        message: `Your consultation appointment starts ${timeMessage}! Dr. ${doctorProfile.name || doctorData.name || 'Doctor'} is waiting.`,
        timestamp: new Date().toISOString()
      };

      // Broadcast to patient page
      if (window.notificationSystem) {
        window.notificationSystem.broadcastAppointmentNotification(
          'patient',
          appointmentNotification
        );
      }

      // Broadcast to doctor page
      if (window.notificationSystem) {
        window.notificationSystem.broadcastAppointmentNotification(
          'doctor',
          appointmentNotification
        );
      }

      // Log notification
      console.log(`📢 Appointment notification sent for consultation ${consultation.id}: ${timeMessage}`);

      // Show visual notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Care Without Borders - Appointment Reminder', {
          body: `Your consultation with Dr. ${doctorProfile.name || doctorData.name || 'Doctor'} starts ${timeMessage}!`,
          icon: '📅'
        });
      }

      // Store notification in history
      this.storeNotificationHistory(appointmentNotification);
    } catch (error) {
      console.error('Error sending appointment notification:', error);
    }
  }

  /**
   * Store notification in localStorage for history/reference
   * @param {object} notification - The notification object
   */
  storeNotificationHistory(notification) {
    try {
      const history = JSON.parse(localStorage.getItem('appointmentNotificationHistory') || '[]');
      history.push(notification);
      
      // Keep only last 100 notifications
      if (history.length > 100) {
        history.shift();
      }
      
      localStorage.setItem('appointmentNotificationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error storing notification history:', error);
    }
  }

  /**
   * Request browser notification permissions
   */
  static requestNotificationPermissions() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✓ Browser notifications enabled');
        }
      });
    }
  }

  /**
   * Clear a consultation from the notified list (for testing)
   * @param {string} consultationId - The consultation ID to clear
   */
  clearNotificationFor(consultationId) {
    this.notifiedConsultations.delete(consultationId);
  }

  /**
   * Clear all notifications (for testing)
   */
  clearAllNotifications() {
    this.notifiedConsultations.clear();
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      notifiedCount: this.notifiedConsultations.size,
      notifiedConsultations: Array.from(this.notifiedConsultations)
    };
  }
}

// Create global instance
window.scheduledNotificationManager = new ScheduledNotificationManager();
