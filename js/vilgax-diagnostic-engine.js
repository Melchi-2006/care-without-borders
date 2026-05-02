/**
 * VILGAX Diagnostic Engine
 * Advanced symptom analysis and disease matching for complex medical cases
 * Handles multi-symptom analysis, severity assessment, and personalized recommendations
 * Version: 1.0
 */

class VilgaxDiagnosticEngine {
  constructor() {
    this.diseaseDatabase = window.DISEASE_MEDICINE_DATABASE || {};
    this.symptomPatterns = window.SYMPTOM_PATTERNS || {};
    this.symptomKeywords = this.initializeSymptomKeywords();
  }

  /**
   * Initialize comprehensive symptom keywords for NLP
   */
  initializeSymptomKeywords() {
    return {
      // Fever and Temperature
      fever: ['fever', 'high temperature', 'temperature', 'degree celsius', 'degree c', 'celsius', 'hot', 'feverish', '101', '102', '103', '104', '105', '106', '40 degree', '38 degree', '39 degree'],
      high_fever: ['high fever', 'very high temperature', 'high temp', '102 degree', '103 degree', '104 degree', '40 celsius', '41 celsius', '42 celsius'],
      
      // Respiratory
      cough: ['cough', 'coughing', 'persistent cough', 'dry cough', 'wet cough', 'hacking cough', 'constant cough', 'severe cough'],
      sore_throat: ['sore throat', 'throat pain', 'throat ache', 'throat infection', 'pharyngitis'],
      shortness_of_breath: ['shortness of breath', 'breathlessness', 'difficulty breathing', 'dyspnea', 'short of breath', 'can\'t breathe', 'gasping', 'difficulty breathing'],
      runny_nose: ['runny nose', 'nasal congestion', 'congestion', 'stuffy nose', 'nasal discharge'],
      sneezing: ['sneezing', 'sneezes', 'frequent sneezing', 'continuous sneezing'],
      chest_pain: ['chest pain', 'chest ache', 'chest discomfort', 'thoracic pain', 'chest tightness'],
      
      // Digestive
      vomiting: ['vomiting', 'vomit', 'throwing up', 'nausea and vomiting', 'gagging', 'retching'],
      nausea: ['nausea', 'feeling sick', 'queasy', 'nauseating', 'feeling nauseous'],
      diarrhea: ['diarrhea', 'diarrhoea', 'loose stools', 'loose motion', 'bowel movement', 'runs', 'loose'],
      abdominal_pain: ['abdominal pain', 'stomach pain', 'belly pain', 'gut pain', 'stomach ache', 'cramps', 'cramping'],
      loss_of_appetite: ['loss of appetite', 'no appetite', 'can\'t eat', 'anorexia', 'appetite loss'],
      constipation: ['constipation', 'constipated', 'no bowel movement', 'hard stools'],
      
      // Neurological
      dizziness: ['dizziness', 'dizzy', 'vertigo', 'lightheaded', 'giddy', 'spinning head', 'unsteady', 'lightness', 'spinning sensation'],
      headache: ['headache', 'head pain', 'migraine', 'tension headache', 'throbbing head', 'splitting head'],
      confusion: ['confusion', 'confused', 'disorientation', 'cannot think clearly', 'mental confusion'],
      body_aches: ['body aches', 'muscle aches', 'myalgia', 'joint pain', 'arthralgia', 'limb pain', 'aching'],
      weakness: ['weakness', 'weak', 'fatigue', 'tired', 'lethargy', 'exhaustion', 'energy loss'],
      
      // Skin
      rash: ['rash', 'skin rash', 'eruption', 'hives', 'skin lesion', 'skin outbreak'],
      itching: ['itching', 'itchy', 'pruritus', 'scratching', 'itchy skin'],
      
      // Eyes and General
      watery_eyes: ['watery eyes', 'eye discharge', 'conjunctivitis', 'red eyes', 'eye watering'],
      chills: ['chills', 'shivering', 'cold shivers', 'shakes'],
      sweating: ['sweating', 'excessive sweating', 'night sweats', 'perspiration'],
      
      // Severe/Critical indicators
      severe: ['severe', 'extreme', 'very severe', 'critical', 'life-threatening', 'very bad', 'terrible'],
      difficulty: ['difficulty', 'hard time', 'unable to', 'can\'t', 'cannot']
    };
  }

  /**
   * Extract symptoms from user input using NLP
   * @param {string} input - User's health description
   * @returns {Array} Array of detected symptoms
   */
  extractSymptoms(input) {
    const lowerInput = input.toLowerCase();
    const detectedSymptoms = new Set();

    // Check each symptom keyword
    for (const [symptomName, keywords] of Object.entries(this.symptomKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          detectedSymptoms.add(symptomName.replace(/_/g, ' '));
          break;
        }
      }
    }

    return Array.from(detectedSymptoms);
  }

  /**
   * Analyze symptoms and suggest possible diseases
   * @param {string} input - User's health description
   * @returns {Object} Analysis results with diseases and medicines
   */
  analyzeSymptoms(input) {
    const symptoms = this.extractSymptoms(input);
    
    if (symptoms.length === 0) {
      return {
        success: false,
        message: "I couldn't identify specific symptoms. Please describe your symptoms more clearly. For example: fever, cough, sore throat, etc.",
        symptoms: [],
        possibleDiseases: [],
        recommendations: "Please provide more details about your symptoms."
      };
    }

    // Score diseases based on symptom match
    const diseaseScores = this.scoreDiseases(symptoms, input);
    
    // Get top 3-5 possible diseases
    const topDiseases = Object.entries(diseaseScores)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 5)
      .map(([disease, data]) => ({
        disease,
        score: data.score,
        matchedSymptoms: data.matchedSymptoms,
        ...this.diseaseDatabase[disease]
      }));

    return {
      success: true,
      symptoms,
      possibleDiseases: topDiseases,
      detectedSymptomCount: symptoms.length,
      recommendations: this.generateRecommendations(symptoms, topDiseases, input)
    };
  }

  /**
   * Score diseases based on symptom matches
   * @private
   */
  scoreDiseases(symptoms, input) {
    const diseaseScores = {};

    for (const [disease, data] of Object.entries(this.diseaseDatabase)) {
      const diseaseSymptoms = (data.symptoms || '').toLowerCase().split(',').map(s => s.trim());
      
      // Count matched symptoms
      let matchCount = 0;
      let matchedSymptoms = [];
      
      for (const symptom of symptoms) {
        for (const diseaseSymptom of diseaseSymptoms) {
          if (diseaseSymptom.includes(symptom) || symptom.includes(diseaseSymptom)) {
            matchCount++;
            matchedSymptoms.push(symptom);
            break;
          }
        }
      }

      // Calculate score
      if (matchCount > 0) {
        const matchPercentage = matchCount / Math.max(symptoms.length, diseaseSymptoms.length);
        const score = matchCount * 10 + matchPercentage * 20;
        
        diseaseScores[disease] = {
          score,
          matchCount,
          matchedSymptoms,
          totalSymptoms: diseaseSymptoms.length
        };
      }
    }

    return diseaseScores;
  }

  /**
   * Generate personalized health recommendations
   * @private
   */
  generateRecommendations(symptoms, diseases, input) {
    let recommendations = [];

    // Check for emergency indicators
    const emergencyKeywords = ['chest pain', 'shortness of breath', 'difficulty breathing', 'heart attack', 'stroke', 'severe'];
    const isEmergency = emergencyKeywords.some(keyword => input.toLowerCase().includes(keyword));

    if (isEmergency) {
      recommendations.push({
        type: 'EMERGENCY',
        message: '🚨 Based on your symptoms, this appears to be an emergency. Please call your local emergency number (911 in USA, 112 in India) immediately.'
      });
    }

    // Check for symptoms that require doctor consultation
    if (diseases.length > 0 && diseases[0].consultDoctor) {
      recommendations.push({
        type: 'DOCTOR_CONSULTATION',
        message: `⚠️ IMPORTANT: Your symptoms suggest ${diseases[0].disease}. Please consult a doctor for proper diagnosis and treatment.`
      });
    }

    // Hydration recommendation for certain symptoms
    if (symptoms.some(s => ['diarrhea', 'vomiting', 'fever', 'sweating'].includes(s))) {
      recommendations.push({
        type: 'HYDRATION',
        message: '💧 Drink plenty of water and electrolyte solutions (like ORS) to prevent dehydration.'
      });
    }

    // Rest recommendation
    if (symptoms.some(s => ['fever', 'fatigue', 'weakness', 'body aches'].includes(s))) {
      recommendations.push({
        type: 'REST',
        message: '😴 Get adequate rest. Your body needs energy to fight the infection/illness.'
      });
    }

    // Medicine recommendations
    if (diseases.length > 0) {
      recommendations.push({
        type: 'MEDICINES',
        message: `💊 Common medicines for ${diseases[0].disease}:`,
        medicines: diseases[0].medicines || []
      });
    }

    // Follow-up recommendation
    if (symptoms.length > 3 || (diseases.length > 0 && diseases[0].severity && ['Moderate', 'Severe', 'Critical'].some(s => diseases[0].severity.includes(s)))) {
      recommendations.push({
        type: 'FOLLOWUP',
        message: '🏥 If symptoms persist or worsen after 2-3 days, please consult a healthcare provider.'
      });
    }

    return recommendations;
  }

  /**
   * Process complex health descriptions
   * Handles multi-sentence, natural language descriptions
   */
  processHealthDescription(description) {
    const analysis = this.analyzeSymptoms(description);

    if (!analysis.success) {
      return {
        type: 'info',
        title: 'Symptom Analysis',
        message: analysis.message,
        severity: 'low'
      };
    }

    // Build comprehensive response
    let response = {
      type: 'analysis',
      detected_symptoms: analysis.symptoms,
      possible_conditions: analysis.possibleDiseases.map((d, idx) => ({
        rank: idx + 1,
        disease: d.disease,
        category: d.category,
        severity: d.severity || 'Not specified',
        matchedSymptoms: [...new Set(d.matchedSymptoms)],
        medicines: d.medicines,
        duration: d.duration,
        consultDoctor: d.consultDoctor || false
      })),
      recommendations: analysis.recommendations,
      urgency: this.determineSeverity(analysis)
    };

    return response;
  }

  /**
   * Determine severity based on symptoms
   * @private
   */
  determineSeverity(analysis) {
    const emergencySymptoms = ['chest pain', 'shortness of breath', 'difficulty breathing'];
    const severeSymptoms = ['high fever', 'severe', 'unconscious', 'confusion'];

    if (analysis.symptoms.some(s => emergencySymptoms.includes(s))) {
      return 'EMERGENCY - Seek immediate medical attention';
    }

    if (analysis.symptoms.some(s => severeSymptoms.includes(s))) {
      return 'SEVERE - Consult doctor immediately';
    }

    if (analysis.symptoms.length > 4) {
      return 'MODERATE - Should see doctor within 24 hours';
    }

    return 'MILD - Monitor symptoms, see doctor if worsens';
  }

  /**
   * Get comprehensive disease information
   */
  getDiseaseInfo(diseaseName) {
    const disease = this.diseaseDatabase[diseaseName.toLowerCase()];
    if (!disease) {
      return null;
    }

    return {
      name: diseaseName,
      category: disease.category,
      symptoms: disease.symptoms,
      medicines: disease.medicines,
      severity: disease.severity,
      duration: disease.duration,
      consultDoctor: disease.consultDoctor,
      complications: disease.complications,
      prevention: disease.prevention
    };
  }

  /**
   * Find similar diseases based on symptoms
   */
  findSimilarDiseases(symptoms) {
    const scoreMap = {};

    for (const [disease, data] of Object.entries(this.diseaseDatabase)) {
      const diseaseSymptoms = (data.symptoms || '').toLowerCase().split(',');
      let score = 0;

      for (const symptom of symptoms) {
        if (diseaseSymptoms.some(ds => ds.includes(symptom.toLowerCase()))) {
          score += 10;
        }
      }

      if (score > 0) {
        scoreMap[disease] = score;
      }
    }

    return Object.entries(scoreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([disease, score]) => ({
        disease,
        score,
        ...this.diseaseDatabase[disease]
      }));
  }
}

// Initialize globally
window.VilgaxDiagnosticEngine = VilgaxDiagnosticEngine;

// Create instance if database is available
if (window.DISEASE_MEDICINE_DATABASE) {
  window.diagnosticEngine = new VilgaxDiagnosticEngine();
  console.log('✅ VILGAX Diagnostic Engine initialized');
} else {
  console.warn('⚠️ Database not loaded yet. Diagnostic Engine will initialize when database is ready.');
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VilgaxDiagnosticEngine;
}
