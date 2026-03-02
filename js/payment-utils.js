// Payment & Session Management Utility
// Handles video call sessions, billing, and transaction records

export class PaymentSession {
  constructor(patientId, doctorId, paymentId, amount, duration = 15) {
    this.sessionId = `session_${Date.now()}`;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.paymentId = paymentId;
    this.amount = amount;
    this.duration = duration; // minutes
    this.startTime = Date.now();
    this.endTime = null;
    this.status = 'active'; // active, paused, completed, cancelled
    this.chatMessages = [];
    this.recordingUrl = null;
  }

  // Calculate remaining time (in ms)
  getRemainingTime() {
    const elapsed = Date.now() - this.startTime;
    const total = this.duration * 60 * 1000;
    return Math.max(0, total - elapsed);
  }

  // Get elapsed time (in seconds)
  getElapsedSeconds() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Format time for display (MM:SS)
  formatRemainingTime() {
    const ms = this.getRemainingTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Check if session expired
  isExpired() {
    return this.getRemainingTime() <= 0;
  }

  // End session
  endSession() {
    this.endTime = Date.now();
    this.status = 'completed';
    return {
      sessionId: this.sessionId,
      duration: this.getElapsedSeconds(),
      totalMinutes: Math.floor(this.getElapsedSeconds() / 60),
      status: this.status
    };
  }

  // Pause session
  pauseSession() {
    this.status = 'paused';
  }

  // Resume session
  resumeSession() {
    this.status = 'active';
  }

  // Add chat message
  addMessage(sender, message, timestamp = Date.now()) {
    this.chatMessages.push({
      id: `msg_${this.chatMessages.length}`,
      sender,
      message,
      timestamp
    });
  }

  // Get session summary
  getSummary() {
    return {
      sessionId: this.sessionId,
      patientId: this.patientId,
      doctorId: this.doctorId,
      paymentId: this.paymentId,
      amount: this.amount,
      allocatedDuration: this.duration,
      actualDuration: this.getElapsedSeconds(),
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime || Date.now(),
      messageCount: this.chatMessages.length,
      recordingUrl: this.recordingUrl
    };
  }
}

// Billing Manager
export class BillingManager {
  static RATE_PER_MINUTE = 5 / 15; // ₹5 for 15 minutes = ₹0.33 per minute

  // Calculate actual bill (pay only for used time)
  static calculateBill(usedSeconds) {
    const minutes = usedSeconds / 60;
    const amount = Math.ceil(minutes * this.RATE_PER_MINUTE);
    return Math.max(100, amount); // Minimum 1 Rs (100 paise)
  }

  // Apply discount
  static applyDiscount(amount, discountPercent) {
    const discount = (amount * discountPercent) / 100;
    return amount - discount;
  }

  // Calculate refund (if session ended early)
  static calculateRefund(paidAmount, usedSeconds) {
    const actualBill = this.calculateBill(usedSeconds);
    const refund = Math.max(0, paidAmount - actualBill);
    return Math.floor(refund);
  }

  // Format amount as currency
  static formatCurrency(amountInPaise) {
    return `₹${(amountInPaise / 100).toFixed(2)}`;
  }

  // Calculate consultation bonus
  static calculateConsultationBonus(totalSessions, totalSpent) {
    // Example: 10% bonus for every 10 sessions or ₹500 spent
    const sessionBonus = Math.floor(totalSessions / 10) * 50;
    const spendingBonus = Math.floor(totalSpent / 50000) * 100;
    return sessionBonus + spendingBonus;
  }
}

// Transaction Logger
export class TransactionLogger {
  static logs = [];

  static log(transaction) {
    const logEntry = {
      id: `txn_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...transaction
    };
    this.logs.push(logEntry);
    console.log('Transaction logged:', logEntry);
    return logEntry;
  }

  static getTransactionsByPatient(patientId) {
    return this.logs.filter(log => log.patientId === patientId);
  }

  static getTransactionsByDoctor(doctorId) {
    return this.logs.filter(log => log.doctorId === doctorId);
  }

  static getTransactionsByStatus(status) {
    return this.logs.filter(log => log.status === status);
  }

  static getTotalRevenue() {
    return this.logs
      .filter(log => log.status === 'completed')
      .reduce((sum, log) => sum + (log.amount || 0), 0);
  }

  static exportLog() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Session Manager
export class SessionManager {
  static activeSessions = {};

  static startSession(patientId, doctorId, paymentId, amount) {
    const session = new PaymentSession(patientId, doctorId, paymentId, amount);
    this.activeSessions[session.sessionId] = session;

    TransactionLogger.log({
      type: 'session_start',
      sessionId: session.sessionId,
      patientId,
      doctorId,
      paymentId,
      amount,
      timestamp: Date.now()
    });

    return session;
  }

  static getSession(sessionId) {
    return this.activeSessions[sessionId];
  }

  static endSession(sessionId) {
    const session = this.activeSessions[sessionId];
    if (!session) return null;

    const summary = session.endSession();

    TransactionLogger.log({
      type: 'session_end',
      ...summary,
      timestamp: Date.now()
    });

    // Calculate refund if applicable
    const refund = BillingManager.calculateRefund(session.amount, summary.duration);

    delete this.activeSessions[sessionId];

    return {
      summary,
      refund,
      refundMessage: refund > 0 
        ? `₹${(refund / 100).toFixed(2)} will be refunded`
        : 'No refund applicable'
    };
  }

  static getAllActiveSessions() {
    return Object.values(this.activeSessions);
  }

  static getPatientActiveSessions(patientId) {
    return Object.values(this.activeSessions)
      .filter(s => s.patientId === patientId && s.status === 'active');
  }

  static getDoctorActiveSessions(doctorId) {
    return Object.values(this.activeSessions)
      .filter(s => s.doctorId === doctorId && s.status === 'active');
  }
}

// Wallet Management
export class WalletManager {
  static wallets = {}; // patientId -> { balance, transactions }

  static initializeWallet(patientId, initialBalance = 0) {
    this.wallets[patientId] = {
      balance: initialBalance,
      transactions: [],
      createdAt: Date.now()
    };
  }

  static getWallet(patientId) {
    if (!this.wallets[patientId]) {
      this.initializeWallet(patientId);
    }
    return this.wallets[patientId];
  }

  static addFunds(patientId, amount, transactionId) {
    const wallet = this.getWallet(patientId);
    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      transactionId,
      timestamp: Date.now()
    });
    console.log(`Added ₹${(amount / 100).toFixed(2)} to patient ${patientId}. New balance: ₹${(wallet.balance / 100).toFixed(2)}`);
  }

  static deductFunds(patientId, amount, sessionId) {
    const wallet = this.getWallet(patientId);
    if (wallet.balance < amount) {
      return { success: false, message: 'Insufficient balance' };
    }
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      sessionId,
      timestamp: Date.now()
    });
    return { success: true, newBalance: wallet.balance };
  }

  static getBalance(patientId) {
    return this.getWallet(patientId).balance;
  }

  static getTransactionHistory(patientId) {
    return this.getWallet(patientId).transactions;
  }

  static formatBalance(patientId) {
    const balance = this.getBalance(patientId);
    return `₹${(balance / 100).toFixed(2)}`;
  }
}

// Statistics & Analytics
export class ConsultationAnalytics {
  static calculateMetrics() {
    const logs = TransactionLogger.logs;
    const completedSessions = logs.filter(l => l.type === 'session_end');

    return {
      totalConsultations: completedSessions.length,
      totalRevenue: TransactionLogger.getTotalRevenue(),
      averageSessionDuration: this.getAverageSessionDuration(completedSessions),
      totalPatients: this.getUniquePatients(logs),
      totalDoctors: this.getUniqueDoctors(logs),
      averageRating: this.calculateAverageRating(logs),
      consultationsByHour: this.getConsultationsByHour(logs),
      topDoctors: this.getTopDoctors(completedSessions)
    };
  }

  static getAverageSessionDuration(sessions) {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return Math.floor(total / sessions.length);
  }

  static getUniquePatients(logs) {
    return new Set(logs.map(l => l.patientId)).size;
  }

  static getUniqueDoctors(logs) {
    return new Set(logs.map(l => l.doctorId)).size;
  }

  static calculateAverageRating(logs) {
    return 4.5; // Placeholder - integrate with rating system
  }

  static getConsultationsByHour(logs) {
    const hourly = {};
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    return hourly;
  }

  static getTopDoctors(sessions) {
    const doctorStats = {};
    sessions.forEach(s => {
      if (!doctorStats[s.doctorId]) {
        doctorStats[s.doctorId] = { consultations: 0, revenue: 0 };
      }
      doctorStats[s.doctorId].consultations++;
      doctorStats[s.doctorId].revenue += s.amount;
    });
    return Object.entries(doctorStats)
      .sort((a, b) => b[1].consultations - a[1].consultations)
      .slice(0, 10)
      .map(([doctorId, stats]) => ({ doctorId, ...stats }));
  }
}

// Export all utilities
export default {
  PaymentSession,
  BillingManager,
  TransactionLogger,
  SessionManager,
  WalletManager,
  ConsultationAnalytics
};
