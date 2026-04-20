/**
 * VILGAX Emotion Detector - Voice Sentiment & Emotion Analysis
 * Analyzes voice tone, pitch, speed, and linguistic patterns
 * Provides emotional context for better response personalization
 * 
 * Version: 1.0
 * Features:
 * - Pitch analysis (frequency spectrum)
 * - Speaking rate analysis
 * - Volume/intensity analysis
 * - Linguistic sentiment analysis
 * - Emotion classification: happy, sad, angry, urgent, stressed, calm, confused, neutral
 */

class VilgaxEmotionDetector {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.emotions = {
      'happy': { keywords: ['great', 'wonderful', 'excellent', 'love', 'awesome', 'amazing'], intensity: 0.8 },
      'sad': { keywords: ['sad', 'unhappy', 'depressed', 'sorry', 'down', 'cry'], intensity: 0.6 },
      'angry': { keywords: ['angry', 'furious', 'mad', 'upset', 'hate', 'terrible'], intensity: 0.9 },
      'urgent': { keywords: ['urgent', 'emergency', 'immediately', 'asap', 'now', 'quickly'], intensity: 0.95 },
      'stressed': { keywords: ['stressed', 'anxious', 'worried', 'nervous', 'scared', 'panic'], intensity: 0.85 },
      'calm': { keywords: ['calm', 'relaxed', 'peaceful', 'comfortable', 'fine', 'okay'], intensity: 0.3 },
      'confused': { keywords: ['confused', 'confused', 'unclear', 'lost', 'understand', 'help'], intensity: 0.5 },
      'neutral': { keywords: [], intensity: 0.5 }
    };
    
    this.emotionHistory = [];
    this.currentEmotion = 'neutral';
    this.emotionConfidence = 0;
    
    this.initAudioContext();
    console.log('🎭 VILGAX Emotion Detector initialized');
  }

  /**
   * Initialize Web Audio API context for frequency analysis
   */
  initAudioContext() {
    if (!this.audioContext) {
      const audioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new audioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      console.log('✅ Audio context initialized for emotion analysis');
    }
  }

  /**
   * Detect emotion from transcript and voice characteristics
   * Returns: { emotion, confidence, intensity, analysis }
   */
  detectEmotion(transcript, voiceData = null) {
    let emotionScore = {};
    
    // Analyze linguistic sentiment from transcript
    const lingualAnalysis = this.analyzeLinguistic(transcript);
    
    // Analyze voice characteristics if available
    const voiceAnalysis = voiceData ? this.analyzeVoiceCharacteristics(voiceData) : null;
    
    // Combine analyses
    for (const [emotion, config] of Object.entries(this.emotions)) {
      let score = 0;
      
      // Linguistic analysis weight: 70%
      const lingualScore = lingualAnalysis[emotion] || 0;
      score += lingualScore * 0.7;
      
      // Voice analysis weight: 30%
      if (voiceAnalysis) {
        const voiceScore = voiceAnalysis[emotion] || 0;
        score += voiceScore * 0.3;
      }
      
      emotionScore[emotion] = Math.min(1, score);
    }
    
    // Find dominant emotion
    let maxEmotion = 'neutral';
    let maxScore = 0;
    
    for (const [emotion, score] of Object.entries(emotionScore)) {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    }
    
    // Boost urgent emotion detection (important for healthcare)
    if (maxScore < 0.3 && this.isUrgentIndicator(transcript)) {
      maxEmotion = 'urgent';
      maxScore = 0.95;
    }
    
    // Store in history for context
    this.recordEmotion(maxEmotion, maxScore, transcript);
    
    return {
      emotion: maxEmotion,
      confidence: Math.round(maxScore * 100),
      intensity: this.emotions[maxEmotion].intensity,
      scores: emotionScore,
      analysis: {
        linguistic: lingualAnalysis,
        voice: voiceAnalysis,
        urgency: this.getUrgencyLevel(maxEmotion, transcript)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Linguistic sentiment analysis
   * Analyzes keywords, negations, and intensity markers
   */
  analyzeLinguistic(transcript) {
    const lower = transcript.toLowerCase().trim();
    const wordList = lower.split(/\s+/);
    
    let emotionScores = {};
    
    // Initialize emotion scores
    for (const emotion of Object.keys(this.emotions)) {
      emotionScores[emotion] = 0;
    }
    
    // Check for negation (e.g., "not happy" = less positive)
    const hasNegation = /not|no|don't|didn't|won't|can't|isn't|aren't|doesn't|hasn't|haven't/i.test(lower);
    
    // Check for intensifiers (e.g., "very", "so", "extremely")
    const hasIntensifier = /very|so|extremely|incredibly|absolutely|totally|completely|absolutely/i.test(lower);
    const intensifierBoost = hasIntensifier ? 1.3 : 1;
    
    // Check for question marks (confusion)
    const questionCount = (lower.match(/\?/g) || []).length;
    
    // Analyze each emotion's keywords
    for (const [emotion, config] of Object.entries(this.emotions)) {
      for (const keyword of config.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lower.match(regex) || [];
        
        let score = matches.length * 0.5; // Each keyword match: 0.5 points
        
        // Apply modifiers
        if (hasNegation && ['happy', 'calm'].includes(emotion)) {
          score *= 0.5; // Reduce positive emotions if negated
        }
        if (hasIntensifier) {
          score *= intensifierBoost;
        }
        
        emotionScores[emotion] = Math.min(1, emotionScores[emotion] + score);
      }
    }
    
    // Questions increase confusion score
    if (questionCount > 0) {
      emotionScores['confused'] = Math.min(1, emotionScores['confused'] + (questionCount * 0.2));
    }
    
    return emotionScores;
  }

  /**
   * Analyze voice characteristics for emotional cues
   * Uses audio frequency analysis
   */
  analyzeVoiceCharacteristics(voiceData) {
    const emotionScores = {
      'happy': 0,
      'sad': 0,
      'angry': 0,
      'urgent': 0,
      'stressed': 0,
      'calm': 0,
      'confused': 0,
      'neutral': 0
    };
    
    if (!voiceData.frequency || !voiceData.volume || !voiceData.speed) {
      return emotionScores; // Return neutral if incomplete data
    }
    
    const freq = voiceData.frequency; // 0-1
    const volume = voiceData.volume;  // 0-1
    const speed = voiceData.speed;    // 0-1 (relative speaking rate)
    
    // Happy: higher pitch, moderate volume, moderate speed
    if (freq > 0.6 && volume > 0.4 && speed > 0.3 && speed < 0.8) {
      emotionScores['happy'] = 0.7;
    }
    
    // Sad: lower pitch, low volume, slow speed
    if (freq < 0.4 && volume < 0.6 && speed < 0.4) {
      emotionScores['sad'] = 0.8;
    }
    
    // Angry: high pitch, high volume, fast speed, sharp attacks
    if (freq > 0.65 && volume > 0.75 && speed > 0.7) {
      emotionScores['angry'] = 0.85;
    }
    
    // Urgent: very high volume, very fast speed
    if (volume > 0.85 && speed > 0.85) {
      emotionScores['urgent'] = 0.95;
    }
    
    // Stressed: high pitch, high volume, variable speed
    if (freq > 0.6 && volume > 0.7 && Math.abs(voiceData.speedVariance || 0) > 0.3) {
      emotionScores['stressed'] = 0.75;
    }
    
    // Calm: low to medium pitch, low to medium volume, slow speed
    if (freq < 0.55 && volume < 0.6 && speed < 0.5) {
      emotionScores['calm'] = 0.8;
    }
    
    // Confused: variable pitch, variable volume, hesitant speed
    if (Math.abs(voiceData.frequencyVariance || 0) > 0.2 && speed < 0.4) {
      emotionScores['confused'] = 0.6;
    }
    
    // Neutral as default
    const maxScore = Math.max(...Object.values(emotionScores));
    if (maxScore < 0.3) {
      emotionScores['neutral'] = 0.5;
    }
    
    return emotionScores;
  }

  /**
   * Check for urgent indicators (medical emergency keywords)
   */
  isUrgentIndicator(transcript) {
    const urgentKeywords = [
      'emergency', 'help', 'immediately', 'now', 'urgent', 'asap',
      'breathing', 'chest pain', 'dying', 'unconscious', 'bleeding',
      'severe', 'critical', 'accident', 'injury', 'overdose',
      'hospital', 'ambulance', 'call doctor', 'poison'
    ];
    
    const lower = transcript.toLowerCase();
    return urgentKeywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Get urgency level based on emotion and content
   */
  getUrgencyLevel(emotion, transcript) {
    if (emotion === 'urgent') return 'CRITICAL';
    if (emotion === 'angry' || emotion === 'stressed') {
      if (this.isUrgentIndicator(transcript)) return 'HIGH';
      return 'MEDIUM';
    }
    if (emotion === 'sad') return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Record emotion in history for context and learning
   */
  recordEmotion(emotion, confidence, transcript) {
    this.emotionHistory.push({
      emotion,
      confidence,
      transcript,
      timestamp: new Date().getTime()
    });
    
    // Keep last 100 emotions in history
    if (this.emotionHistory.length > 100) {
      this.emotionHistory.shift();
    }
    
    this.currentEmotion = emotion;
    this.emotionConfidence = confidence;
  }

  /**
   * Get emotion trend (how user's emotion is changing)
   */
  getEmotionTrend(timeWindowMs = 60000) {
    const now = new Date().getTime();
    const recent = this.emotionHistory.filter(e => (now - e.timestamp) < timeWindowMs);
    
    if (recent.length === 0) return null;
    
    const emotionCounts = {};
    for (const entry of recent) {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    }
    
    return {
      dominant: Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0],
      distribution: emotionCounts,
      trend: recent.length > 1 ? 'stable' : 'unknown',
      timeWindow: timeWindowMs
    };
  }

  /**
   * Get personalized response based on emotion
   */
  getPersonalizedMessage(emotion, baseMessage) {
    const emotionalResponses = {
      'happy': ['Great! ', 'Wonderful! ', 'I\'m glad! '],
      'sad': ['I understand. ', 'Let me help you. ', 'Don\'t worry. '],
      'angry': ['I hear you. ', 'Let me fix this right away. ', 'I\'ll help immediately. '],
      'urgent': ['RIGHT AWAY! ', 'EMERGENCY ACTIVATED! ', 'PRIORITY MODE ON! '],
      'stressed': ['Breathe easy. ', 'Let me help you relax. ', 'I\'ll handle this. '],
      'calm': ['Sounds good. ', 'Perfect. ', 'Understood. '],
      'confused': ['Let me clarify. ', 'Let me explain. ', 'Here\'s how it works: '],
      'neutral': ['Understood. ', 'Got it. ', 'Noted. ']
    };
    
    const prefix = emotionalResponses[emotion][Math.floor(Math.random() * emotionalResponses[emotion].length)];
    return prefix + baseMessage;
  }

  /**
   * Get status of emotion detector
   */
  getStatus() {
    return {
      currentEmotion: this.currentEmotion,
      confidence: this.emotionConfidence,
      historyCount: this.emotionHistory.length,
      trend: this.getEmotionTrend(),
      lastAnalysis: this.emotionHistory[this.emotionHistory.length - 1] || null
    };
  }
}

// Initialize emotion detector globally
let vilgaxEmotionDetector;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgaxEmotionDetector = new VilgaxEmotionDetector();
  });
} else {
  vilgaxEmotionDetector = new VilgaxEmotionDetector();
}
