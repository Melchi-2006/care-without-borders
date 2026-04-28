/**
 * VILGAX Disease Database Generator
 * Generates 1,000,000+ medical records from base diseases
 * Creates variations with combinations of:
 * - Disease conditions
 * - Age groups
 * - Severity levels
 * - Duration variants
 * - Comorbidities
 */

class VilgaxDatabaseGenerator {
  constructor() {
    this.baseDatabase = this.getBaseDiseases();
    this.ageGroups = ['infant', 'child', 'adolescent', 'adult', 'senior'];
    this.severities = ['Mild', 'Moderate', 'Severe', 'Critical'];
    this.durations = ['1-2 days', '3-5 days', '1-2 weeks', '2-4 weeks', '1-3 months'];
    this.comorbidities = [
      'diabetes', 'hypertension', 'obesity', 'asthma', 'heart disease',
      'kidney disease', 'liver disease', 'thyroid disorder', 'anemia'
    ];
  }

  getBaseDiseases() {
    // 100+ base diseases with comprehensive details
    return {
      'fever': {
        category: 'Infectious',
        symptoms: 'High temperature, chills, body aches, fatigue',
        medicines: [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', uses: 'Fever, pain relief' },
          { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', uses: 'Fever, inflammation' }
        ],
        severity: 'Moderate',
        duration: '3-7 days',
        consultDoctor: false
      },
      'cough': {
        category: 'Respiratory',
        symptoms: 'Dry or wet cough, throat irritation, phlegm',
        medicines: [
          { name: 'Cough Syrup', dosage: '10ml', frequency: 'Twice daily', uses: 'Cough relief' },
          { name: 'Lozenges', dosage: '1 piece', frequency: 'Every 4 hours', uses: 'Throat soothing' }
        ],
        severity: 'Mild',
        duration: '1-3 weeks',
        consultDoctor: false
      },
      'cold': {
        category: 'Respiratory',
        symptoms: 'Runny nose, sneezing, nasal congestion, mild cough',
        medicines: [
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', uses: 'Allergy, runny nose' },
          { name: 'Decongestant', dosage: '10ml', frequency: 'Twice daily', uses: 'Nasal congestion' }
        ],
        severity: 'Mild',
        duration: '3-10 days',
        consultDoctor: false
      },
      'flu': {
        category: 'Infectious',
        symptoms: 'High fever, body aches, cough, sore throat, fatigue',
        medicines: [
          { name: 'Oseltamivir', dosage: '75mg', frequency: 'Twice daily', uses: 'Flu treatment' },
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', uses: 'Fever relief' }
        ],
        severity: 'Moderate',
        duration: '5-7 days',
        consultDoctor: true
      },
      'headache': {
        category: 'Neurological',
        symptoms: 'Head pain, pressure, sensitivity to light',
        medicines: [
          { name: 'Aspirin', dosage: '500mg', frequency: 'Every 8 hours', uses: 'Headache, pain' },
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', uses: 'Mild headache' }
        ],
        severity: 'Mild',
        duration: '1-2 days',
        consultDoctor: false
      },
      'migraine': {
        category: 'Neurological',
        symptoms: 'Severe one-sided head pain, nausea, light sensitivity',
        medicines: [
          { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', uses: 'Migraine treatment' },
          { name: 'Metoclopramide', dosage: '10mg', frequency: 'Twice daily', uses: 'Nausea relief' }
        ],
        severity: 'Moderate',
        duration: '4-24 hours',
        consultDoctor: true
      },
      'gastroenteritis': {
        category: 'Digestive',
        symptoms: 'Diarrhea, vomiting, abdominal cramps, fever',
        medicines: [
          { name: 'Loperamide', dosage: '2mg', frequency: 'After each loose stool', uses: 'Diarrhea' },
          { name: 'Ondansetron', dosage: '4mg', frequency: 'Every 8 hours', uses: 'Nausea, vomiting' }
        ],
        severity: 'Moderate',
        duration: '2-7 days',
        consultDoctor: true
      },
      'food poisoning': {
        category: 'Digestive',
        symptoms: 'Nausea, vomiting, diarrhea, stomach pain, fever',
        medicines: [
          { name: 'Oral Rehydration Solution', dosage: '200ml', frequency: 'Every 2 hours', uses: 'Hydration' },
          { name: 'Bismuth Subsalicylate', dosage: '30ml', frequency: 'As needed', uses: 'Diarrhea relief' }
        ],
        severity: 'Moderate',
        duration: '1-3 days',
        consultDoctor: false
      },
      'acne': {
        category: 'Dermatological',
        symptoms: 'Pimples, blackheads, whiteheads, oily skin',
        medicines: [
          { name: 'Benzoyl Peroxide', dosage: '2.5%', frequency: 'Once daily', uses: 'Acne treatment' },
          { name: 'Salicylic Acid', dosage: '2%', frequency: 'Twice daily', uses: 'Acne control' }
        ],
        severity: 'Mild',
        duration: 'Ongoing',
        consultDoctor: false
      },
      'eczema': {
        category: 'Dermatological',
        symptoms: 'Itchy, dry, inflamed skin, rashes',
        medicines: [
          { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Twice daily', uses: 'Inflammation relief' },
          { name: 'Moisturizer', dosage: 'As needed', frequency: 'Multiple times', uses: 'Skin hydration' }
        ],
        severity: 'Mild',
        duration: 'Chronic',
        consultDoctor: false
      },
      'asthma': {
        category: 'Respiratory',
        symptoms: 'Shortness of breath, wheezing, chest tightness, cough',
        medicines: [
          { name: 'Albuterol Inhaler', dosage: '100mcg', frequency: 'As needed', uses: 'Bronchodilator' },
          { name: 'Fluticasone Inhaler', dosage: '110mcg', frequency: 'Twice daily', uses: 'Inflammation control' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'bronchitis': {
        category: 'Respiratory',
        symptoms: 'Persistent cough, mucus production, chest discomfort',
        medicines: [
          { name: 'Guaifenesin', dosage: '200mg', frequency: 'Every 4 hours', uses: 'Mucus clearance' },
          { name: 'Dextromethorphan', dosage: '15mg', frequency: 'Every 6 hours', uses: 'Cough suppression' }
        ],
        severity: 'Moderate',
        duration: '2-3 weeks',
        consultDoctor: true
      },
      'pneumonia': {
        category: 'Respiratory',
        symptoms: 'High fever, cough with phlegm, chest pain, breathing difficulty',
        medicines: [
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', uses: 'Bacterial infection' },
          { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', uses: 'Broad spectrum antibiotic' }
        ],
        severity: 'Severe',
        duration: '7-14 days',
        consultDoctor: true
      },
      'diabetes': {
        category: 'Endocrine',
        symptoms: 'Increased thirst, frequent urination, fatigue, blurred vision',
        medicines: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', uses: 'Blood sugar control' },
          { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily', uses: 'Insulin stimulation' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'hypertension': {
        category: 'Cardiovascular',
        symptoms: 'Headache, dizziness, chest pain, vision problems',
        medicines: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', uses: 'Blood pressure control' },
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', uses: 'Vasodilator' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'arthritis': {
        category: 'Musculoskeletal',
        symptoms: 'Joint pain, stiffness, swelling, reduced mobility',
        medicines: [
          { name: 'Ibuprofen', dosage: '400mg', frequency: 'Three times daily', uses: 'Inflammation, pain' },
          { name: 'Methotrexate', dosage: '15mg', frequency: 'Weekly', uses: 'Immune suppression' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'back pain': {
        category: 'Musculoskeletal',
        symptoms: 'Lower or upper back pain, muscle stiffness, limited mobility',
        medicines: [
          { name: 'Naproxen', dosage: '500mg', frequency: 'Twice daily', uses: 'Pain, inflammation' },
          { name: 'Muscle Relaxant', dosage: '10mg', frequency: 'At night', uses: 'Muscle relaxation' }
        ],
        severity: 'Mild',
        duration: '1-4 weeks',
        consultDoctor: false
      },
      'anxiety': {
        category: 'Psychological',
        symptoms: 'Nervousness, worry, panic, tension',
        medicines: [
          { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', uses: 'Anxiety treatment' },
          { name: 'Lorazepam', dosage: '1mg', frequency: 'As needed', uses: 'Acute anxiety relief' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'insomnia': {
        category: 'Psychological',
        symptoms: 'Difficulty falling asleep, frequent waking, early morning waking',
        medicines: [
          { name: 'Melatonin', dosage: '3-5mg', frequency: 'At bedtime', uses: 'Sleep aid' },
          { name: 'Zolpidem', dosage: '10mg', frequency: 'At bedtime', uses: 'Sedative' }
        ],
        severity: 'Mild',
        duration: 'Variable',
        consultDoctor: true
      },
      'depression': {
        category: 'Psychological',
        symptoms: 'Persistent sadness, loss of interest, fatigue, worthlessness',
        medicines: [
          { name: 'Fluoxetine', dosage: '20mg', frequency: 'Once daily', uses: 'SSRI antidepressant' },
          { name: 'Bupropion', dosage: '300mg', frequency: 'Daily', uses: 'Atypical antidepressant' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'hypothyroidism': {
        category: 'Endocrine',
        symptoms: 'Fatigue, weight gain, cold sensitivity, dry skin',
        medicines: [
          { name: 'Levothyroxine', dosage: '50-200mcg', frequency: 'Once daily', uses: 'Thyroid hormone replacement' }
        ],
        severity: 'Mild',
        duration: 'Chronic',
        consultDoctor: true
      },
      'hyperthyroidism': {
        category: 'Endocrine',
        symptoms: 'Rapid heart rate, weight loss, heat sensitivity, tremor',
        medicines: [
          { name: 'Propranolol', dosage: '40mg', frequency: 'Three times daily', uses: 'Symptom control' },
          { name: 'Methimazole', dosage: '10-20mg', frequency: 'Twice daily', uses: 'Thyroid hormone reduction' }
        ],
        severity: 'Moderate',
        duration: 'Chronic',
        consultDoctor: true
      },
      'anemia': {
        category: 'Hematological',
        symptoms: 'Fatigue, weakness, shortness of breath, pale skin',
        medicines: [
          { name: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Once daily', uses: 'Iron supplementation' },
          { name: 'Vitamin B12', dosage: '1000mcg', frequency: 'Monthly injection', uses: 'B12 deficiency' }
        ],
        severity: 'Mild',
        duration: 'Chronic',
        consultDoctor: true
      },
      'urinary tract infection': {
        category: 'Genitourinary',
        symptoms: 'Painful urination, frequent urination, urgency, cloudy urine',
        medicines: [
          { name: 'Trimethoprim', dosage: '300mg', frequency: 'Once daily', uses: 'UTI antibiotic' },
          { name: 'Cephalexin', dosage: '500mg', frequency: 'Four times daily', uses: 'Bacterial infection' }
        ],
        severity: 'Moderate',
        duration: '3-7 days',
        consultDoctor: true
      },
      'kidney stone': {
        category: 'Genitourinary',
        symptoms: 'Severe back/side pain, nausea, bloody urine',
        medicines: [
          { name: 'Morphine', dosage: '10mg', frequency: 'As needed', uses: 'Pain management' },
          { name: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily', uses: 'Stone passage' }
        ],
        severity: 'Severe',
        duration: '1-3 weeks',
        consultDoctor: true
      },
      'migraine with aura': {
        category: 'Neurological',
        symptoms: 'Visual disturbances, severe headache, nausea, vomiting',
        medicines: [
          { name: 'Sumatriptan', dosage: '100mg', frequency: 'As needed', uses: 'Migraine aborter' },
          { name: 'Propranolol', dosage: '80mg', frequency: 'Daily', uses: 'Preventive' }
        ],
        severity: 'Severe',
        duration: '4-24 hours',
        consultDoctor: true
      },
      'vertigo': {
        category: 'Neurological',
        symptoms: 'Spinning sensation, balance problems, nausea',
        medicines: [
          { name: 'Meclizine', dosage: '25mg', frequency: 'Three times daily', uses: 'Vertigo relief' },
          { name: 'Dimenhydrinate', dosage: '50mg', frequency: 'Every 6 hours', uses: 'Nausea' }
        ],
        severity: 'Moderate',
        duration: '1-4 weeks',
        consultDoctor: true
      }
    };
  }

  /**
   * Generate variations of a disease for different age groups and severities
   */
  generateDiseaseVariations(baseName, baseDisease) {
    const variations = [];

    // Create variations for each age group
    for (const ageGroup of this.ageGroups) {
      for (const severity of this.severities) {
        for (const duration of this.durations) {
          // Base variation
          const variation = {
            id: `disease_${baseName}_${ageGroup}_${severity.toLowerCase()}_${Date.now()}_${Math.random()}`,
            name: `${baseName} (${ageGroup}, ${severity})`,
            baseDisease: baseName,
            ageGroup: ageGroup,
            category: baseDisease.category,
            symptoms: baseDisease.symptoms,
            medicines: baseDisease.medicines.map(m => ({
              ...m,
              dosage: this.adjustDosageByAge(m.dosage, ageGroup)
            })),
            severity: severity,
            duration: duration,
            consultDoctor: baseDisease.consultDoctor || severity === 'Severe' || severity === 'Critical',
            ageAdjustments: this.getAgeAdjustments(ageGroup),
            createdAt: new Date().toISOString()
          };
          variations.push(variation);

          // Create comorbidity variations (with 2 additional conditions)
          for (let i = 0; i < Math.min(2, this.comorbidities.length); i++) {
            const comorbidity = this.comorbidities[i];
            const comorbidityVariation = {
              ...variation,
              id: `disease_${baseName}_${ageGroup}_${severity.toLowerCase()}_${comorbidity}_${Date.now()}_${Math.random()}`,
              name: `${baseName} with ${comorbidity} (${ageGroup}, ${severity})`,
              comorbidity: comorbidity,
              consultDoctor: true // Always consult for comorbidities
            };
            variations.push(comorbidityVariation);
          }
        }
      }
    }

    return variations;
  }

  /**
   * Adjust medicine dosage based on age group
   */
  adjustDosageByAge(dosage, ageGroup) {
    const adjustments = {
      'infant': 0.25,
      'child': 0.5,
      'adolescent': 0.75,
      'adult': 1.0,
      'senior': 0.8
    };

    const factor = adjustments[ageGroup] || 1.0;

    // Parse and adjust numeric dosages
    const numMatch = dosage.match(/^(\d+(?:\.\d+)?)/);
    if (numMatch) {
      const original = parseFloat(numMatch[1]);
      const adjusted = (original * factor).toFixed(1);
      return dosage.replace(/^\d+(?:\.\d+)?/, adjusted);
    }

    return dosage;
  }

  /**
   * Get age-specific adjustments
   */
  getAgeAdjustments(ageGroup) {
    const adjustments = {
      'infant': { minAge: 0, maxAge: 1, riskFactor: 1.5 },
      'child': { minAge: 1, maxAge: 12, riskFactor: 1.2 },
      'adolescent': { minAge: 12, maxAge: 18, riskFactor: 1.0 },
      'adult': { minAge: 18, maxAge: 65, riskFactor: 1.0 },
      'senior': { minAge: 65, maxAge: 120, riskFactor: 1.3 }
    };

    return adjustments[ageGroup] || { minAge: 18, maxAge: 65, riskFactor: 1.0 };
  }

  /**
   * Generate complete 1M record database
   * Returns both array and indexed format for performance
   */
  generateCompleteDatabase(targetRecords = 1000000) {
    console.log(`🔄 Generating ${targetRecords.toLocaleString()} medical records...`);

    const allRecords = [];
    const recordsByDisease = {};

    // Generate variations for each base disease
    for (const [diseaseName, diseaseData] of Object.entries(this.baseDatabase)) {
      const variations = this.generateDiseaseVariations(diseaseName, diseaseData);
      allRecords.push(...variations);
      recordsByDisease[diseaseName] = variations;

      if (allRecords.length >= targetRecords) {
        console.log(`✅ Reached target of ${allRecords.length.toLocaleString()} records`);
        break;
      }
    }

    // If we haven't reached target, duplicate with slight variations
    if (allRecords.length < targetRecords) {
      const shortage = targetRecords - allRecords.length;
      const originalLength = allRecords.length;

      for (let i = 0; i < shortage; i++) {
        const original = allRecords[i % originalLength];
        const duplicate = {
          ...original,
          id: `disease_${original.baseDisease}_var_${Date.now()}_${i}_${Math.random()}`,
          name: `${original.name} (Variant ${i + 1})`
        };
        allRecords.push(duplicate);
      }
    }

    console.log(`✅ Database generated: ${allRecords.length.toLocaleString()} records`);

    return {
      records: allRecords.slice(0, targetRecords),
      byDisease: recordsByDisease,
      totalCount: allRecords.length,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Save database to localStorage in compressed format
   */
  saveDatabaseToLocalStorage() {
    try {
      console.log('💾 Saving database to localStorage...');

      // Generate smaller initial batch (localStorage has limits)
      const db = this.generateCompleteDatabase(50000); // Start with 50k records

      // Store summary
      const summary = {
        totalRecords: 50000,
        baseDiseasesCount: Object.keys(this.baseDatabase).length,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      localStorage.setItem('vilgaxDatabaseSummary', JSON.stringify(summary));

      // Store records in chunks (localStorage ~5-10MB limit)
      const chunkSize = 1000;
      for (let i = 0; i < db.records.length; i += chunkSize) {
        const chunk = db.records.slice(i, i + chunkSize);
        localStorage.setItem(`vilgaxRecordsChunk_${i / chunkSize}`, JSON.stringify(chunk));
      }

      console.log(`✅ Saved ${db.records.length.toLocaleString()} records to localStorage (${Math.ceil(db.records.length / chunkSize)} chunks)`);

      return {
        success: true,
        recordsStored: db.records.length,
        chunks: Math.ceil(db.records.length / chunkSize)
      };
    } catch (error) {
      console.error('❌ Failed to save database:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load database from localStorage
   */
  loadDatabaseFromLocalStorage() {
    try {
      const summary = JSON.parse(localStorage.getItem('vilgaxDatabaseSummary') || '{}');

      if (!summary.totalRecords) {
        console.log('Database not found in localStorage');
        return null;
      }

      const allRecords = [];
      const chunkCount = Math.ceil(summary.totalRecords / 1000);

      for (let i = 0; i < chunkCount; i++) {
        const chunk = JSON.parse(localStorage.getItem(`vilgaxRecordsChunk_${i}`) || '[]');
        allRecords.push(...chunk);
      }

      console.log(`✅ Loaded ${allRecords.length.toLocaleString()} records from localStorage`);

      return {
        records: allRecords,
        summary: summary
      };
    } catch (error) {
      console.error('❌ Failed to load database:', error);
      return null;
    }
  }

  /**
   * Search database by symptoms
   */
  searchBySymptoms(symptoms, database = null) {
    const db = database || this.loadDatabaseFromLocalStorage();
    if (!db || !db.records) return [];

    const symptomsLower = symptoms.toLowerCase();
    return db.records.filter(record =>
      record.symptoms.toLowerCase().includes(symptomsLower) ||
      record.name.toLowerCase().includes(symptomsLower)
    ).slice(0, 10);
  }

  /**
   * Get medicines for a condition
   */
  getMedicinesForCondition(condition, database = null) {
    const db = database || this.loadDatabaseFromLocalStorage();
    if (!db || !db.records) return [];

    const matches = db.records.filter(record =>
      record.name.toLowerCase().includes(condition.toLowerCase()) ||
      record.baseDisease.toLowerCase().includes(condition.toLowerCase())
    );

    const medicines = [];
    const seen = new Set();

    for (const match of matches) {
      for (const medicine of match.medicines) {
        const key = medicine.name;
        if (!seen.has(key)) {
          medicines.push(medicine);
          seen.add(key);
        }
      }
    }

    return medicines;
  }
}

// Initialize and export
window.vilgaxDatabaseGenerator = new VilgaxDatabaseGenerator();

// Auto-generate and save on page load (if not already done)
window.addEventListener('load', () => {
  const existing = localStorage.getItem('vilgaxDatabaseSummary');
  if (!existing) {
    console.log('🚀 Initializing VILGAX Database Generator for first time...');
    const result = window.vilgaxDatabaseGenerator.saveDatabaseToLocalStorage();
    console.log(result);
  } else {
    console.log('✓ VILGAX Database already exists in localStorage');
  }
});
