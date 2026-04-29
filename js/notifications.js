/**
 * Notification System for Care Without Borders
 * Handles real-time notifications for consultations, video calls, and diagnoses
 */

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.loadNotifications();
    this.setupListeners();
  }

  // Load notifications from localStorage
  loadNotifications() {
    try {
      this.notifications = JSON.parse(localStorage.getItem('systemNotifications') || '[]');
    } catch (e) {
      console.error('Error loading notifications:', e);
      this.notifications = [];
    }
  }

  // Save notifications to localStorage
  saveNotifications() {
    localStorage.setItem('systemNotifications', JSON.stringify(this.notifications));
  }

  // Send a notification
  sendNotification(notification) {
    const newNotif = {
      id: 'NOTIF-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    this.notifications.push(newNotif);
    this.saveNotifications();
    this.broadcastNotification(newNotif);
    return newNotif;
  }

  // Broadcast notification event to all listeners
  broadcastNotification(notification) {
    window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notif = this.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
    }
  }

  // Send consultation accepted notification
  sendConsultationApprovedNotification(patientEmail, consultationData) {
    return this.sendNotification({
      type: 'consultation_approved',
      title: '✅ Doctor Approved Your Consultation!',
      message: `Dr. ${consultationData.doctorName} has approved your consultation request for ${consultationData.specialty}. Your condition: ${consultationData.symptoms}`,
      recipient: patientEmail,
      consultationId: consultationData.id,
      doctorId: consultationData.doctorId,
      doctorName: consultationData.doctorName,
      severity: 'high'
    });
  }

  // Send video call invitation notification
  sendVideoCallInvitationNotification(recipient, doctorName, consultationId) {
    return this.sendNotification({
      type: 'video_call_invited',
      title: '📞 Video Call Invitation',
      message: `Dr. ${doctorName} is inviting you for a video consultation. Please accept to join the call.`,
      recipient: recipient,
      consultationId: consultationId,
      severity: 'critical'
    });
  }

  // Send diagnosis notification
  sendDiagnosisNotification(patientEmail, diagnosis) {
    return this.sendNotification({
      type: 'diagnosis_received',
      title: '📋 Doctor\'s Diagnosis',
      message: `Dr. ${diagnosis.doctorName} has provided a diagnosis for your consultation`,
      recipient: patientEmail,
      consultationId: diagnosis.consultationId,
      diagnosis: diagnosis,
      severity: 'medium'
    });
  }

  // Get notifications for specific recipient
  getNotificationsForRecipient(recipient) {
    return this.notifications.filter(n => n.recipient === recipient);
  }

  // Clear a notification
  clearNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Clear all notifications for a recipient
  clearAllForRecipient(recipient) {
    this.notifications = this.notifications.filter(n => n.recipient !== recipient);
    this.saveNotifications();
  }
}

// Initialize global notification system
window.notificationSystem = new NotificationSystem();

// Setup listeners for notification events
window.addEventListener('newNotification', (e) => {
  const notification = e.detail;
  console.log('📬 New Notification:', notification.title);
});
