/**
 * Medical Analysis Engine
 * Extracts patient information from natural language and maps to appropriate specialists
 * Implements clinical intake, symptom analysis, and specialist recommendation
 */

class MedicalAnalyzer {
  constructor() {
    this.symptoms = new Set();
    this.patientInfo = {
      name: null,
      age: null,
      gender: null,
      location: null,
      symptoms: [],
      duration: null,
      severity: 'moderate',
      otherInfo: []
    };
    
    this.initSymptomDatabase();
    this.initSpecialtyMapping();
  }

  /**
   * Initialize comprehensive symptom database
   */
  initSymptomDatabase() {
    // Comprehensive symptom registry with variants
    this.symptomKeywords = {
      // Fever & Temperature
      'fever': ['fever', 'temperature', 'hot', 'burning', 'high temp', 'body heat'],
      'chills': ['chills', 'shivering', 'cold', 'trembling'],
      
      // GI Symptoms
      'vomit': ['vomit', 'vomiting', 'threw up', 'nausea', 'nauseous', 'feel sick'],
      'diarrhea': ['diarrhea', 'dysentery', 'loose stools', 'diarrhoea', 'gastro', 'digestive'],
      'constipation': ['constipation', 'blocked', 'cant pass stool'],
      'abdominal_pain': ['stomach pain', 'abdominal pain', 'belly pain', 'tummy ache', 'cramps'],
      'heartburn': ['heartburn', 'acidity', 'acid reflux', 'gerd'],
      
      // Respiratory
      'cough': ['cough', 'coughing', 'dry cough', 'persistent cough', 'chest cough'],
      'cold': ['cold', 'common cold', 'runny nose', 'nasal congestion', 'stuffy nose'],
      'breathing': ['breathing difficulty', 'shortness of breath', 'wheezing', 'asthma', 'dyspnea'],
      'sore_throat': ['sore throat', 'throat pain', 'throat infection', 'pharyngitis'],
      
      // Neurological
      'headache': ['headache', 'migraine', 'head pain', 'head ache', 'migrain'],
      'dizziness': ['dizziness', 'dizzy', 'vertigo', 'lightheaded', 'giddiness'],
      'weakness': ['weakness', 'weak', 'fatigue', 'tired', 'exhausted', 'lethargy'],
      'numbness': ['numbness', 'tingling', 'pins and needles', 'paresthesia'],
      
      // Cardiac
      'chest_pain': ['chest pain', 'chest discomfort', 'angina', 'heart pain'],
      'palpitations': ['palpitations', 'heart racing', 'irregular heartbeat', 'arrhythmia'],
      
      // Dermatological
      'rash': ['rash', 'skin rash', 'itching', 'itchy', 'urticaria', 'hives'],
      'acne': ['acne', 'pimples', 'spots', 'zits'],
      'wound': ['wound', 'cut', 'injury', 'sore', 'lesion'],
      'skin_infection': ['skin infection', 'boil', 'abscess', 'infected'],
      
      // Orthopedic
      'joint_pain': ['joint pain', 'knee pain', 'shoulder pain', 'joint ache', 'arthritis'],
      'back_pain': ['back pain', 'backache', 'spine pain', 'lower back'],
      'fracture': ['fracture', 'break', 'broken', 'sprain', 'injury'],
      
      // Eye
      'eye_problem': ['eye pain', 'vision problem', 'blurred vision', 'eye infection'],
      
      // Mental Health
      'anxiety': ['anxiety', 'anxious', 'worried', 'panic', 'stress'],
      'depression': ['depression', 'depressed', 'sad', 'low mood'],
      'insomnia': ['insomnia', 'sleep problem', 'cant sleep', 'sleeplessness'],
      
      // Allergic
      'allergy': ['allergy', 'allergic', 'allergies'],
      
      // Infectious
      'infection': ['infection', 'infected', 'infectious'],
      'worms': ['worms', 'parasites'],
    };

    // Convert to map with lowercase keys
    this.symptoms = new Map();
    for (const [symptom, keywords] of Object.entries(this.symptomKeywords)) {
      this.symptoms.set(symptom, keywords);
    }
  }

  /**
   * Initialize specialty mapping based on symptoms
   */
  initSpecialtyMapping() {
    this.specialtyMap = {
      // General Practice - first line, common symptoms
      'General Practice': [
        'fever', 'cold', 'cough', 'sore_throat', 'weakness', 
        'infection', 'common illness', 'checkup'
      ],

      // Gastroenterology - digestive system
      'Gastroenterology': [
        'vomit', 'diarrhea', 'constipation', 'abdominal_pain', 
        'heartburn', 'digestion'
      ],

      // Cardiology - heart and circulation
      'Cardiology': [
        'chest_pain', 'palpitations', 'high blood pressure', 
        'heart', 'cardiac'
      ],

      // Neurology - nervous system
      'Neurology': [
        'headache', 'migraine', 'dizziness', 'numbness', 'seizure',
        'neurological', 'nerve pain'
      ],

      // Dermatology - skin
      'Dermatology': [
        'rash', 'acne', 'skin_infection', 'wound', 'allergy',
        'skin problem'
      ],

      // Orthopedics - bones and joints
      'Orthopedics': [
        'joint_pain', 'back_pain', 'fracture', 'sports injury',
        'knee', 'shoulder'
      ],

      // Psychiatry - mental health
      'Psychiatry': [
        'anxiety', 'depression', 'insomnia', 'mental health',
        'stress disorder', 'panic'
      ],

      // ENT (Ear, Nose, Throat)
      'ENT': [
        'sore_throat', 'cold', 'ear pain', 'hearing loss',
        'nasal congestion'
      ],

      // Pulmonology - respiratory
      'Pulmonology': [
        'cough', 'breathing', 'asthma', 'chest pain',
        'respiratory'
      ],

      // Ophthalmology - eyes
      'Ophthalmology': [
        'eye_problem', 'vision', 'eye pain', 'eye infection'
      ]
    };
  }

  /**
   * Extract patient information from natural language
   * E.g., "I am Melchi from Erode, 32 years old male, fever for 2 days with vomit and dysentery"
   */
  extractPatientInfo(input) {
    const text = input.toLowerCase();
    const info = { ...this.patientInfo };

    // Extract Name (look for "I am [Name]" or similar patterns)
    const nameMatch = text.match(/(?:i am|my name is|i'm|i\'m|call me)\s+([a-z]+)/i);
    if (nameMatch) {
      info.name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // Extract Age (look for "32", "32 years old", etc)
    const ageMatch = text.match(/(\d{1,3})\s*(?:years?\s*old|yr|yrs)?/);
    if (ageMatch) {
      info.age = parseInt(ageMatch[1]);
    }

    // Extract Gender
    if (text.includes('male') || text.includes('man') || text.includes('boy')) {
      info.gender = 'Male';
    } else if (text.includes('female') || text.includes('woman') || text.includes('girl')) {
      info.gender = 'Female';
    } else if (text.includes('non-binary') || text.includes('other')) {
      info.gender = 'Other';
    }

    // Extract Location (look for "from [City]")
    const locationMatch = text.match(/from\s+([a-z]+)/i);
    if (locationMatch) {
      info.location = locationMatch[1].charAt(0).toUpperCase() + locationMatch[1].slice(1);
    }

    // Extract Symptoms
    const foundSymptoms = this.extractSymptoms(text);
    info.symptoms = foundSymptoms;

    // Extract Duration (e.g., "2 days", "1 week", "3 months")
    const durationMatch = text.match(/(?:for\s+)?(\d+)\s*(day|week|month|hour|days|weeks|months|hours)/i);
    if (durationMatch) {
      const num = durationMatch[1];
      const unit = durationMatch[2].toLowerCase().replace(/s$/, ''); // Remove plural
      info.duration = `${num} ${unit}${num !== '1' ? 's' : ''}`;
    }

    // Extract other relevant info
    this.extractSeverity(text, info);
    this.extractAdditionalInfo(text, info);

    return info;
  }

  /**
   * Extract symptoms from text
   */
  extractSymptoms(text) {
    const found = [];

    for (const [symptom, keywords] of this.symptoms) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          found.push(symptom);
          break; // Don't add same symptom twice
        }
      }
    }

    return found;
  }

  /**
   * Extract severity indicators
   */
  extractSeverity(text, info) {
    if (text.includes('severe') || text.includes('very bad') || text.includes('emergency')) {
      info.severity = 'severe';
    } else if (text.includes('mild') || text.includes('slight') || text.includes('little')) {
      info.severity = 'mild';
    } else {
      info.severity = 'moderate';
    }
  }

  /**
   * Extract additional medical information
   */
  extractAdditionalInfo(text, info) {
    if (text.includes('allergic') || text.includes('allergy')) {
      info.otherInfo.push('Patient reported allergies');
    }
    if (text.includes('pregnant')) {
      info.otherInfo.push('Patient is pregnant');
    }
    if (text.includes('diabetic') || text.includes('diabetes')) {
      info.otherInfo.push('Diabetic patient');
    }
    if (text.includes('blood pressure') || text.includes('hypertension')) {
      info.otherInfo.push('Has blood pressure issues');
    }
  }

  /**
   * Recommend best specialist based on symptoms
   */
  recommendSpecialty(symptoms) {
    if (!symptoms || symptoms.length === 0) {
      return 'General Practice'; // Default to GP
    }

    const scores = {};

    // Calculate scores for each specialty
    for (const [specialty, specialtySymptoms] of Object.entries(this.specialtyMap)) {
      let matches = 0;
      for (const symptom of symptoms) {
        if (specialtySymptoms.includes(symptom)) {
          matches++;
        }
      }
      if (matches > 0) {
        scores[specialty] = matches;
      }
    }

    // Return specialty with highest score, or GP as default
    const bestSpecialty = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b, 'General Practice'
    );

    return bestSpecialty;
  }

  /**
   * Get severity level for urgency
   */
  getSeverityLevel(severity) {
    const levels = {
      'severe': 'URGENT',
      'moderate': 'STANDARD',
      'mild': 'ROUTINE'
    };
    return levels[severity] || 'STANDARD';
  }

  /**
   * Format patient intake summary
   */
  formatIntakeSummary(patientInfo) {
    let summary = [];

    if (patientInfo.name) summary.push(`👤 Patient: ${patientInfo.name}`);
    if (patientInfo.age && patientInfo.gender) {
      summary.push(`📋 Age: ${patientInfo.age} years, ${patientInfo.gender}`);
    }
    if (patientInfo.location) summary.push(`📍 Location: ${patientInfo.location}`);
    if (patientInfo.symptoms.length > 0) {
      summary.push(`🏥 Symptoms: ${this.formatSymptoms(patientInfo.symptoms)}`);
    }
    if (patientInfo.duration) summary.push(`⏱️ Duration: ${patientInfo.duration}`);
    if (patientInfo.severity) {
      summary.push(`⚠️ Severity: ${patientInfo.severity.toUpperCase()}`);
    }

    return summary.join('\n');
  }

  /**
   * Format symptom list for display
   */
  formatSymptoms(symptoms) {
    return symptoms.map(s => s.replace(/_/g, ' ')).join(', ');
  }

  /**
   * Reset patient info
   */
  reset() {
    this.patientInfo = {
      name: null,
      age: null,
      gender: null,
      location: null,
      symptoms: [],
      duration: null,
      severity: 'moderate',
      otherInfo: []
    };
  }
}

// Initialize globally
const medicalAnalyzer = new MedicalAnalyzer();
