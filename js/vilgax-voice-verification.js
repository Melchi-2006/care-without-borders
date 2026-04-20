/**
 * VILGAX Voice Verification Security System
 * Implements voice biometric authentication for sensitive operations
 * 
 * Features:
 * - Voice fingerprint creation and enrollment
 * - Voice pattern matching for verification
 * - Pitch, tone, and speech pattern analysis
 * - Multi-factor authentication support
 * - Fraud detection based on anomalies
 * - Session-based voice verification
 */

class VilgaxVoiceVerification {
  constructor() {
    this.enrolledProfiles = {};
    this.voiceSignatures = [];
    this.verificationSessions = {};
    this.securityThreshold = 0.85; // 85% confidence required
    this.anomalyThreshold = 0.7; // Detect unusual patterns
    this.maxAttemptsBeforeLockout = 3;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.audioContext = null;
    
    this.init();
    console.log('🔐 VILGAX Voice Verification initialized');
  }

  /**
   * Initialize voice verification system
   */
  init() {
    // Load enrolled profiles from storage
    this.loadEnrolledProfiles();
    
    // Initialize audio context
    this.initAudioContext();
    
    console.log(`✅ Voice verification ready with threshold: ${this.securityThreshold * 100}%`);
  }

  /**
   * Initialize Web Audio API for voice analysis
   */
  initAudioContext() {
    if (!this.audioContext) {
      const audioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new audioContextClass();
      console.log('✅ Audio context initialized for voice verification');
    }
  }

  /**
   * Enroll a user's voice profile
   * Records 3-5 voice samples for baseline
   */
  async enrollUserVoice(userId, voiceSamples = []) {
    if (voiceSamples.length < 3) {
      console.error('At least 3 voice samples required for enrollment');
      return null;
    }
    
    const signatures = [];
    for (const sample of voiceSamples) {
      const signature = await this.createVoiceSignature(sample);
      signatures.push(signature);
    }
    
    const profile = {
      userId,
      enrolledAt: new Date().toISOString(),
      enrollmentCount: voiceSamples.length,
      signatures,
      baselineSignature: this.generateAverageSignature(signatures),
      verificationAttempts: 0,
      lastVerification: null,
      locked: false,
      lockoutUntil: null
    };
    
    this.enrolledProfiles[userId] = profile;
    await this.saveEnrolledProfiles();
    
    console.log(`✅ User voice enrolled: ${userId} with ${voiceSamples.length} samples`);
    return profile;
  }

  /**
   * Create voice signature from audio sample
   */
  async createVoiceSignature(audioData) {
    // Extract voice characteristics
    const signature = {
      timestamp: new Date().toISOString(),
      pitchProfile: this.extractPitchProfile(audioData),
      mfcc: this.extractMFCC(audioData), // Mel-Frequency Cepstral Coefficients
      energy: this.extractEnergyProfile(audioData),
      spectralCentroid: this.extractSpectralCentroid(audioData),
      zerocrossingRate: this.extractZeroCrossingRate(audioData),
      perceptualHash: this.generatePerceptualHash(audioData)
    };
    
    return signature;
  }

  /**
   * Extract pitch profile from audio
   */
  extractPitchProfile(audioData) {
    // Simplified pitch extraction
    if (!audioData || audioData.length < 512) {
      return { averagePitch: 0, pitchVariance: 0 };
    }
    
    const realPart = new Float32Array(audioData.length);
    const imagPart = new Float32Array(audioData.length);
    
    // Simple autocorrelation for pitch
    let maxAutoCorr = 0;
    let estimatedPitch = 0;
    
    for (let lag = 0; lag < audioData.length / 2; lag++) {
      let autoCorr = 0;
      for (let i = 0; i < audioData.length / 2; i++) {
        autoCorr += audioData[i] * audioData[i + lag];
      }
      
      if (autoCorr > maxAutoCorr) {
        maxAutoCorr = autoCorr;
        estimatedPitch = lag;
      }
    }
    
    return {
      averagePitch: estimatedPitch,
      pitchVariance: this.calculateVariance(audioData),
      pitchStability: maxAutoCorr > 0 ? 1 - (estimatedPitch / audioData.length) : 0
    };
  }

  /**
   * Extract MFCC (Mel-Frequency Cepstral Coefficients)
   */
  extractMFCC(audioData) {
    // Simplified MFCC extraction
    if (!audioData || audioData.length < 512) {
      return [];
    }
    
    const mfcc = [];
    const frameSize = 512;
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      const frame = audioData.slice(i, i + frameSize);
      const energy = frame.reduce((sum, val) => sum + (val * val), 0) / frameSize;
      mfcc.push(Math.sqrt(energy));
    }
    
    return mfcc.slice(0, 13); // Standard 13 MFCC coefficients
  }

  /**
   * Extract energy profile
   */
  extractEnergyProfile(audioData) {
    if (!audioData || audioData.length === 0) {
      return { totalEnergy: 0, averageEnergy: 0 };
    }
    
    const energies = [];
    const frameSize = 512;
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      const frame = audioData.slice(i, i + frameSize);
      const energy = frame.reduce((sum, val) => sum + Math.abs(val), 0) / frameSize;
      energies.push(energy);
    }
    
    const totalEnergy = energies.reduce((a, b) => a + b, 0);
    const avgEnergy = totalEnergy / energies.length;
    
    return {
      totalEnergy,
      averageEnergy: avgEnergy,
      energyVariance: this.calculateVariance(energies)
    };
  }

  /**
   * Extract spectral centroid
   */
  extractSpectralCentroid(audioData) {
    if (!audioData || audioData.length < 512) {
      return 0;
    }
    
    // Apply FFT (simplified)
    const magnitude = this.simpleFFT(audioData);
    let centroid = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < magnitude.length; i++) {
      centroid += i * magnitude[i];
      totalEnergy += magnitude[i];
    }
    
    return totalEnergy > 0 ? centroid / totalEnergy : 0;
  }

  /**
   * Extract zero crossing rate
   */
  extractZeroCrossingRate(audioData) {
    if (!audioData || audioData.length < 2) {
      return 0;
    }
    
    let zeroCrossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] > 0 && audioData[i - 1] < 0) ||
          (audioData[i] < 0 && audioData[i - 1] > 0)) {
        zeroCrossings++;
      }
    }
    
    return zeroCrossings / audioData.length;
  }

  /**
   * Simple FFT implementation
   */
  simpleFFT(audioData) {
    const n = audioData.length;
    const magnitude = new Float32Array(n / 2);
    
    for (let k = 0; k < n / 2; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n_idx = 0; n_idx < n; n_idx++) {
        const angle = (2 * Math.PI * k * n_idx) / n;
        real += audioData[n_idx] * Math.cos(angle);
        imag += audioData[n_idx] * Math.sin(angle);
      }
      
      magnitude[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return magnitude;
  }

  /**
   * Generate perceptual hash of voice
   */
  generatePerceptualHash(audioData) {
    let hash = '';
    const chunkSize = Math.ceil(audioData.length / 16);
    
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, i + chunkSize);
      const average = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      hash += average > 0 ? '1' : '0';
    }
    
    return hash;
  }

  /**
   * Calculate variance of array
   */
  calculateVariance(arr) {
    if (arr.length === 0) return 0;
    
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + ((val - mean) ** 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  /**
   * Generate average signature from multiple samples
   */
  generateAverageSignature(signatures) {
    const average = {
      pitchProfile: {
        averagePitch: 0,
        pitchVariance: 0,
        pitchStability: 0
      },
      mfcc: Array(13).fill(0),
      energy: {
        totalEnergy: 0,
        averageEnergy: 0,
        energyVariance: 0
      },
      spectralCentroid: 0,
      zerocrossingRate: 0
    };
    
    for (const sig of signatures) {
      average.pitchProfile.averagePitch += sig.pitchProfile.averagePitch;
      average.pitchProfile.pitchVariance += sig.pitchProfile.pitchVariance;
      average.pitchProfile.pitchStability += sig.pitchProfile.pitchStability;
      
      for (let i = 0; i < 13; i++) {
        average.mfcc[i] += sig.mfcc[i] || 0;
      }
      
      average.energy.totalEnergy += sig.energy.totalEnergy;
      average.energy.averageEnergy += sig.energy.averageEnergy;
      average.energy.energyVariance += sig.energy.energyVariance;
      
      average.spectralCentroid += sig.spectralCentroid;
      average.zerocrossingRate += sig.zerocrossingRate;
    }
    
    const len = signatures.length;
    average.pitchProfile.averagePitch /= len;
    average.pitchProfile.pitchVariance /= len;
    average.pitchProfile.pitchStability /= len;
    
    for (let i = 0; i < 13; i++) {
      average.mfcc[i] /= len;
    }
    
    average.energy.totalEnergy /= len;
    average.energy.averageEnergy /= len;
    average.energy.energyVariance /= len;
    
    average.spectralCentroid /= len;
    average.zerocrossingRate /= len;
    
    return average;
  }

  /**
   * Verify user voice
   */
  async verifyUserVoice(userId, audioData) {
    const profile = this.enrolledProfiles[userId];
    
    if (!profile) {
      console.error('User voice profile not enrolled:', userId);
      return { verified: false, confidence: 0, reason: 'Profile not found' };
    }
    
    // Check if account is locked
    if (profile.locked && new Date().getTime() < profile.lockoutUntil) {
      const timeRemaining = Math.ceil((profile.lockoutUntil - new Date().getTime()) / 1000);
      return {
        verified: false,
        confidence: 0,
        reason: `Account locked. Try again in ${timeRemaining} seconds`,
        locked: true
      };
    }
    
    // Reset lock if expired
    if (profile.locked && new Date().getTime() >= profile.lockoutUntil) {
      profile.locked = false;
      profile.verificationAttempts = 0;
    }
    
    // Create signature from verification audio
    const verificationSignature = await this.createVoiceSignature(audioData);
    
    // Compare with baseline
    const confidence = this.compareSignatures(profile.baselineSignature, verificationSignature);
    
    // Check for anomalies
    const anomalyScore = this.detectAnomalies(userId, verificationSignature);
    const adjustedConfidence = confidence * (1 - anomalyScore * 0.2);
    
    profile.verificationAttempts++;
    const verified = adjustedConfidence >= this.securityThreshold;
    
    if (verified) {
      // Success - record verification
      profile.lastVerification = new Date().toISOString();
      profile.verificationAttempts = 0;
      await this.saveEnrolledProfiles();
      
      console.log(`✅ Voice verification successful for ${userId} (confidence: ${(adjustedConfidence * 100).toFixed(1)}%)`);
      
      // Create verification session
      return {
        verified: true,
        confidence: adjustedConfidence,
        sessionId: this.createVerificationSession(userId),
        reason: 'Voice verified'
      };
    } else {
      // Failed attempt
      if (profile.verificationAttempts >= this.maxAttemptsBeforeLockout) {
        profile.locked = true;
        profile.lockoutUntil = new Date().getTime() + this.lockoutDuration;
        console.error(`🔒 Account locked after ${this.maxAttemptsBeforeLockout} failed attempts`);
      }
      
      await this.saveEnrolledProfiles();
      
      return {
        verified: false,
        confidence: adjustedConfidence,
        attemptsRemaining: this.maxAttemptsBeforeLockout - profile.verificationAttempts,
        reason: 'Voice does not match. Please try again.'
      };
    }
  }

  /**
   * Compare two voice signatures
   */
  compareSignatures(baseline, current) {
    let similarityScore = 0;
    let componentCount = 0;
    
    // Compare pitch profile
    const pitchSimilarity = 1 - (Math.abs(baseline.pitchProfile.averagePitch - current.pitchProfile.averagePitch) / Math.max(baseline.pitchProfile.averagePitch, current.pitchProfile.averagePitch, 1));
    similarityScore += Math.max(0, pitchSimilarity);
    componentCount++;
    
    // Compare MFCC
    let mfccDistance = 0;
    for (let i = 0; i < baseline.mfcc.length && i < current.mfcc.length; i++) {
      mfccDistance += Math.abs(baseline.mfcc[i] - current.mfcc[i]);
    }
    const mfccSimilarity = Math.max(0, 1 - (mfccDistance / baseline.mfcc.length));
    similarityScore += mfccSimilarity;
    componentCount++;
    
    // Compare energy
    const energySimilarity = 1 - (Math.abs(baseline.energy.averageEnergy - current.energy.averageEnergy) / Math.max(baseline.energy.averageEnergy, current.energy.averageEnergy, 1));
    similarityScore += Math.max(0, energySimilarity);
    componentCount++;
    
    // Compare spectral centroid
    const spectralSimilarity = 1 - (Math.abs(baseline.spectralCentroid - current.spectralCentroid) / Math.max(baseline.spectralCentroid, current.spectralCentroid, 1));
    similarityScore += Math.max(0, spectralSimilarity);
    componentCount++;
    
    return similarityScore / componentCount;
  }

  /**
   * Detect anomalies in voice pattern
   */
  detectAnomalies(userId, signature) {
    const profile = this.enrolledProfiles[userId];
    if (!profile) return 0;
    
    // Check if signature differs significantly from baseline
    const mfccVariance = this.calculateSignatureVariance(profile.baselineSignature.mfcc, signature.mfcc);
    const energyVariance = Math.abs(profile.baselineSignature.energy.averageEnergy - signature.energy.averageEnergy);
    
    // Score anomalies (0-1)
    let anomalyScore = 0;
    if (mfccVariance > 0.3) anomalyScore += 0.5;
    if (energyVariance > 0.2) anomalyScore += 0.5;
    
    return Math.min(1, anomalyScore);
  }

  /**
   * Calculate variance between two signature arrays
   */
  calculateSignatureVariance(arr1, arr2) {
    if (arr1.length !== arr2.length) return 1;
    
    let variance = 0;
    for (let i = 0; i < arr1.length; i++) {
      variance += Math.abs(arr1[i] - arr2[i]);
    }
    
    return variance / arr1.length;
  }

  /**
   * Create verification session
   */
  createVerificationSession(userId) {
    const sessionId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.verificationSessions[sessionId] = {
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour
      isValid: true
    };
    
    console.log(`🎫 Verification session created: ${sessionId}`);
    return sessionId;
  }

  /**
   * Validate verification session
   */
  isSessionValid(sessionId) {
    const session = this.verificationSessions[sessionId];
    
    if (!session || !session.isValid) return false;
    if (new Date().getTime() > new Date(session.expiresAt).getTime()) {
      session.isValid = false;
      return false;
    }
    
    return true;
  }

  /**
   * Load enrolled profiles from storage
   */
  loadEnrolledProfiles() {
    try {
      const stored = localStorage.getItem('vilgax_voice_profiles');
      if (stored) {
        this.enrolledProfiles = JSON.parse(stored);
        console.log(`📂 Loaded ${Object.keys(this.enrolledProfiles).length} voice profiles`);
      }
    } catch (error) {
      console.error('Error loading voice profiles:', error);
    }
  }

  /**
   * Save enrolled profiles to storage
   */
  async saveEnrolledProfiles() {
    try {
      localStorage.setItem('vilgax_voice_profiles', JSON.stringify(this.enrolledProfiles));
      console.log('💾 Voice profiles saved');
    } catch (error) {
      console.error('Error saving voice profiles:', error);
    }
  }

  /**
   * Get verification status
   */
  getStatus() {
    return {
      enrolledUsers: Object.keys(this.enrolledProfiles).length,
      securityThreshold: `${this.securityThreshold * 100}%`,
      activeSessions: Object.keys(this.verificationSessions).filter(id => this.isSessionValid(id)).length,
      systemReady: this.audioContext !== null
    };
  }
}

// Initialize voice verification globally
let vilgaxVoiceVerification;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgaxVoiceVerification = new VilgaxVoiceVerification();
  });
} else {
  vilgaxVoiceVerification = new VilgaxVoiceVerification();
}
