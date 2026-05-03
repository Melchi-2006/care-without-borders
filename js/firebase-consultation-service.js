/**
 * Firebase Consultation Service
 * Handles real-time synchronization of consultations across devices
 * Uses Firebase Realtime Database for instant updates
 */

import { getDatabase, ref, push, set, get, update, onValue, off } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config (same as in firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyBMHhwzdjBEr9GaMNnhxugg0K71WrPN0n4",
  authDomain: "care-without-borders-789dd.firebaseapp.com",
  projectId: "care-without-borders-789dd",
  storageBucket: "care-without-borders-789dd.firebasestorage.app",
  messagingSenderId: "736136702535",
  appId: "1:736136702535:web:c862ef87108bd027bb9f62",
  measurementId: "G-9PLWT8WHC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

class FirebaseConsultationService {
  constructor() {
    this.db = database;
    this.auth = auth;
    this.listeners = new Map(); // Track listeners for cleanup
    this.isOnline = navigator.onLine;
    this.syncQueue = []; // Queue for offline operations
    
    // Listen for online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    console.log('✓ Firebase Consultation Service initialized');
  }

  /**
   * Save consultation request to Firebase (replaces localStorage)
   * @param {object} consultationData - Consultation object to save
   * @returns {Promise<string>} - Consultation ID
   */
  async saveConsultationRequest(consultationData) {
    try {
      const consultationsRef = ref(this.db, 'consultations');
      const newConsultationRef = push(consultationsRef);
      
      const consultation = {
        ...consultationData,
        id: newConsultationRef.key,
        createdAt: new Date().toISOString(),
        syncedAt: new Date().toISOString()
      };

      await set(newConsultationRef, consultation);
      
      console.log('💾 Consultation saved to Firebase:', consultation.id);
      
      // Also save to localStorage as backup
      this.saveToLocalStorageBackup('consultationRequests', consultation);
      
      return consultation.id;
    } catch (error) {
      console.error('❌ Error saving consultation to Firebase:', error);
      // Queue for retry if offline
      if (!this.isOnline) {
        this.syncQueue.push({ operation: 'save', data: consultationData });
        console.log('📋 Consultation queued for sync:', consultationData);
      }
      throw error;
    }
  }

  /**
   * Load all consultation requests
   * @returns {Promise<array>} - Array of consultations
   */
  async loadConsultations() {
    try {
      const consultationsRef = ref(this.db, 'consultations');
      const snapshot = await get(consultationsRef);
      
      if (snapshot.exists()) {
        const consultations = Object.values(snapshot.val());
        console.log('📥 Loaded', consultations.length, 'consultations from Firebase');
        return consultations;
      }
      
      console.log('ℹ️ No consultations found in Firebase');
      return [];
    } catch (error) {
      console.error('❌ Error loading consultations:', error);
      // Fallback to localStorage
      return this.getFromLocalStorageBackup('consultationRequests') || [];
    }
  }

  /**
   * Listen to real-time consultation updates
   * @param {function} callback - Function to call when data changes
   * @returns {function} - Unsubscribe function
   */
  subscribeToConsultations(callback) {
    try {
      const consultationsRef = ref(this.db, 'consultations');
      
      const unsubscribe = onValue(consultationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const consultations = Object.values(snapshot.val());
          console.log('🔄 Real-time update: Consultations changed');
          callback(consultations);
          
          // Update localStorage backup
          localStorage.setItem('consultationRequests', JSON.stringify(consultations));
        } else {
          callback([]);
        }
      }, (error) => {
        console.error('❌ Error listening to consultations:', error);
        // Fallback to localStorage if Firebase unavailable
        const backupData = this.getFromLocalStorageBackup('consultationRequests') || [];
        callback(backupData);
      });

      // Store listener reference for cleanup
      this.listeners.set('consultations', unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to consultations:', error);
      throw error;
    }
  }

  /**
   * Update a consultation (e.g., doctor accepts)
   * @param {string} consultationId - ID of consultation to update
   * @param {object} updates - Updates to apply
   * @returns {Promise}
   */
  async updateConsultation(consultationId, updates) {
    try {
      const consultationRef = ref(this.db, `consultations/${consultationId}`);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(consultationRef, updateData);
      
      console.log('✏️ Consultation updated:', consultationId);
      
      // Also update localStorage backup
      this.updateLocalStorageBackup('consultationRequests', consultationId, updateData);
      
      return updateData;
    } catch (error) {
      console.error('❌ Error updating consultation:', error);
      if (!this.isOnline) {
        this.syncQueue.push({ operation: 'update', id: consultationId, data: updates });
      }
      throw error;
    }
  }

  /**
   * Delete a consultation
   * @param {string} consultationId - ID of consultation to delete
   * @returns {Promise}
   */
  async deleteConsultation(consultationId) {
    try {
      const consultationRef = ref(this.db, `consultations/${consultationId}`);
      await set(consultationRef, null);
      
      console.log('🗑️ Consultation deleted:', consultationId);
      
      // Also update localStorage backup
      this.deleteFromLocalStorageBackup('consultationRequests', consultationId);
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting consultation:', error);
      throw error;
    }
  }

  /**
   * Get consultations for a specific doctor
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<array>} - Consultations for doctor
   */
  async getDoctorConsultations(doctorId) {
    try {
      const consultations = await this.loadConsultations();
      
      return consultations.filter(c => 
        (c.status === 'pending' && !c.acceptedBy) || 
        (c.acceptedBy === doctorId) ||
        (c.status === 'completed' && c.acceptedBy === doctorId)
      );
    } catch (error) {
      console.error('❌ Error getting doctor consultations:', error);
      return [];
    }
  }

  /**
   * Get consultations for a specific patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<array>} - Consultations for patient
   */
  async getPatientConsultations(patientId) {
    try {
      const consultations = await this.loadConsultations();
      return consultations.filter(c => c.patientId === patientId || c.patientName === patientId);
    } catch (error) {
      console.error('❌ Error getting patient consultations:', error);
      return [];
    }
  }

  /**
   * Batch save diagnoses to Firebase
   * @param {string} consultationId - Consultation ID
   * @param {object} diagnosisData - Diagnosis information
   * @returns {Promise}
   */
  async saveDiagnosis(consultationId, diagnosisData) {
    try {
      const diagnosisRef = ref(this.db, `diagnoses/${consultationId}`);
      
      const diagnosis = {
        ...diagnosisData,
        consultationId: consultationId,
        savedAt: new Date().toISOString()
      };
      
      await set(diagnosisRef, diagnosis);
      
      console.log('📋 Diagnosis saved:', consultationId);
      
      // Update consultation status to completed
      await this.updateConsultation(consultationId, { status: 'completed' });
      
      // Save to localStorage backup
      const diagnoses = this.getFromLocalStorageBackup('diagnoses') || {};
      diagnoses[consultationId] = diagnosis;
      localStorage.setItem('diagnoses', JSON.stringify(diagnoses));
      
      return diagnosis;
    } catch (error) {
      console.error('❌ Error saving diagnosis:', error);
      throw error;
    }
  }

  /**
   * Load diagnosis for consultation
   * @param {string} consultationId - Consultation ID
   * @returns {Promise<object>} - Diagnosis data
   */
  async loadDiagnosis(consultationId) {
    try {
      const diagnosisRef = ref(this.db, `diagnoses/${consultationId}`);
      const snapshot = await get(diagnosisRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error loading diagnosis:', error);
      return null;
    }
  }

  /**
   * Handle coming online - sync queued operations
   */
  async handleOnline() {
    this.isOnline = true;
    console.log('✓ Back online - syncing queued operations');
    
    // Process sync queue
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      try {
        if (operation.operation === 'save') {
          await this.saveConsultationRequest(operation.data);
        } else if (operation.operation === 'update') {
          await this.updateConsultation(operation.id, operation.data);
        }
        console.log('✓ Synced operation:', operation);
      } catch (error) {
        console.error('❌ Failed to sync operation:', operation, error);
        this.syncQueue.unshift(operation); // Re-queue for retry
        break;
      }
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    this.isOnline = false;
    console.log('⚠️ Offline - operations will be queued');
  }

  /**
   * Save consultation to localStorage as backup
   * @param {string} key - Storage key
   * @param {object} consultation - Consultation object
   */
  saveToLocalStorageBackup(key, consultation) {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(consultation);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving to localStorage backup:', error);
    }
  }

  /**
   * Get data from localStorage backup
   * @param {string} key - Storage key
   * @returns {array|null} - Data or null
   */
  getFromLocalStorageBackup(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Update localStorage backup
   * @param {string} key - Storage key
   * @param {string} id - Item ID
   * @param {object} updates - Updates to apply
   */
  updateLocalStorageBackup(key, id, updates) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const index = data.findIndex(item => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }

  /**
   * Delete from localStorage backup
   * @param {string} key - Storage key
   * @param {string} id - Item ID
   */
  deleteFromLocalStorageBackup(key, id) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = data.filter(item => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
      this.listeners.delete(key);
    });
    console.log('✓ Firebase listeners cleaned up');
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedOperations: this.syncQueue.length,
      activeListeners: this.listeners.size
    };
  }
}

// Create global instance
window.firebaseConsultationService = new FirebaseConsultationService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.firebaseConsultationService.cleanup();
});

export default FirebaseConsultationService;
