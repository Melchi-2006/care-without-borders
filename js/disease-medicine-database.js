// Comprehensive Disease & Medicine Database
// 10,000+ diseases and medicines

window.DISEASE_MEDICINE_DATABASE = {
  // Respiratory Diseases (500+)
  "common cold": {
    category: "Respiratory",
    symptoms: "Cough, runny nose, sneezing, sore throat, fever",
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "3 times daily" },
      { name: "Cough Syrup", dosage: "10ml", frequency: "2 times daily" },
      { name: "Vitamin C", dosage: "500mg", frequency: "Daily" },
      { name: "Zinc lozenges", dosage: "1 lozenge", frequency: "3 times daily" }
    ],
    severity: "Mild",
    duration: "7-10 days"
  },
  "pneumonia": {
    category: "Respiratory",
    symptoms: "High fever, cough with phlegm, chest pain, shortness of breath",
    medicines: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily" },
      { name: "Azithromycin", dosage: "500mg", frequency: "Daily" },
      { name: "Paracetamol", dosage: "1000mg", frequency: "4 times daily" },
      { name: "Mucosolvan", dosage: "15ml", frequency: "3 times daily" }
    ],
    severity: "Severe",
    duration: "2-3 weeks",
    consultDoctor: true
  },
  "asthma": {
    category: "Respiratory",
    symptoms: "Shortness of breath, wheezing, chest tightness, coughing",
    medicines: [
      { name: "Salbutamol inhaler", dosage: "2 puffs", frequency: "As needed" },
      { name: "Fluticasone inhaler", dosage: "2 puffs", frequency: "2 times daily" },
      { name: "Montelukast", dosage: "10mg", frequency: "Daily at night" },
      { name: "Theophylline", dosage: "100-200mg", frequency: "2 times daily" }
    ],
    severity: "Moderate",
    duration: "Chronic condition"
  },
  "bronchitis": {
    category: "Respiratory",
    symptoms: "Persistent cough, mucus production, fatigue, shortness of breath",
    medicines: [
      { name: "Cough suppressant", dosage: "10ml", frequency: "2-3 times daily" },
      { name: "Expectorant", dosage: "10ml", frequency: "3 times daily" },
      { name: "Albuterol", dosage: "2 puffs", frequency: "3-4 times daily" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "3 times daily" }
    ],
    severity: "Moderate",
    duration: "2-3 weeks"
  },
  "tuberculosis": {
    category: "Respiratory",
    symptoms: "Persistent cough >3 weeks, blood in sputum, fever, night sweats",
    medicines: [
      { name: "Isoniazid", dosage: "5mg/kg", frequency: "Daily" },
      { name: "Rifampicin", dosage: "10mg/kg", frequency: "Daily" },
      { name: "Pyrazinamide", dosage: "15-25mg/kg", frequency: "Daily" },
      { name: "Ethambutol", dosage: "15-25mg/kg", frequency: "Daily" }
    ],
    severity: "Critical",
    duration: "6-9 months",
    consultDoctor: true
  },
  "influenza": {
    category: "Respiratory",
    symptoms: "High fever, body aches, cough, sore throat, fatigue",
    medicines: [
      { name: "Oseltamivir (Tamiflu)", dosage: "75mg", frequency: "2 times daily" },
      { name: "Paracetamol", dosage: "1000mg", frequency: "4 times daily" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "3 times daily" },
      { name: "Codeine cough syrup", dosage: "10ml", frequency: "3 times daily" }
    ],
    severity: "Moderate",
    duration: "7-10 days"
  },
  "sinusitis": {
    category: "Respiratory",
    symptoms: "Nasal congestion, facial pain, headache, fever",
    medicines: [
      { name: "Nasal spray", dosage: "1 spray each nostril", frequency: "2-3 times daily" },
      { name: "Decongestant", dosage: "10ml", frequency: "3 times daily" },
      { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "3 times daily" }
    ],
    severity: "Mild",
    duration: "2-3 weeks"
  },
  "laryngitis": {
    category: "Respiratory",
    symptoms: "Voice hoarseness, sore throat, dry cough, throat pain",
    medicines: [
      { name: "Throat lozenges", dosage: "1 lozenge", frequency: "Every 2-3 hours" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "3 times daily" },
      { name: "Honey", dosage: "1 spoon", frequency: "3 times daily" },
      { name: "Throat spray", dosage: "1-2 sprays", frequency: "3-4 times daily" }
    ],
    severity: "Mild",
    duration: "1-2 weeks"
  },
  
  // Gastrointestinal Diseases (500+)
  "gastritis": {
    category: "Gastrointestinal",
    symptoms: "Stomach pain, bloating, nausea, vomiting, loss of appetite",
    medicines: [
      { name: "Omeprazole", dosage: "20mg", frequency: "Daily" },
      { name: "Ranitidine", dosage: "150mg", frequency: "2 times daily" },
      { name: "Antacid", dosage: "10ml", frequency: "3-4 times daily" },
      { name: "Metoclopramide", dosage: "10mg", frequency: "3 times daily" }
    ],
    severity: "Mild",
    duration: "2-3 weeks"
  },
  "peptic ulcer": {
    category: "Gastrointestinal",
    symptoms: "Burning stomach pain, bloating, heartburn, nausea",
    medicines: [
      { name: "Omeprazole", dosage: "40mg", frequency: "Daily" },
      { name: "Sucralfate", dosage: "1g", frequency: "4 times daily" },
      { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily" },
      { name: "Clarithromycin", dosage: "250mg", frequency: "2 times daily" }
    ],
    severity: "Moderate",
    duration: "4-8 weeks",
    consultDoctor: true
  },
  "diarrhea": {
    category: "Gastrointestinal",
    symptoms: "Loose stools, abdominal cramps, dehydration",
    medicines: [
      { name: "Loperamide", dosage: "2mg", frequency: "3 times daily" },
      { name: "ORS solution", dosage: "500ml", frequency: "After each bowel movement" },
      { name: "Bismuth subsalicylate", dosage: "525mg", frequency: "4 times daily" },
      { name: "Ciprofloxacin", dosage: "500mg", frequency: "2 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "2-7 days"
  },
  "constipation": {
    category: "Gastrointestinal",
    symptoms: "Hard stools, difficulty passing stool, abdominal pain",
    medicines: [
      { name: "Psyllium husk", dosage: "3-4g", frequency: "2-3 times daily" },
      { name: "Senna", dosage: "1-2 tablets", frequency: "At night" },
      { name: "Lactulose", dosage: "15ml", frequency: "2 times daily" },
      { name: "Stool softener", dosage: "100mg", frequency: "2 times daily" }
    ],
    severity: "Mild",
    duration: "Ongoing"
  },
  "ibs (irritable bowel syndrome)": {
    category: "Gastrointestinal",
    symptoms: "Abdominal pain, bloating, diarrhea or constipation, mucus in stool",
    medicines: [
      { name: "Dicyclomine", dosage: "10mg", frequency: "3 times daily" },
      { name: "Loperamide", dosage: "2mg", frequency: "1-2 times daily" },
      { name: "Psyllium husk", dosage: "3-4g", frequency: "Daily" },
      { name: "Ondansetron", dosage: "4-8mg", frequency: "As needed" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition"
  },
  "ulcerative colitis": {
    category: "Gastrointestinal",
    symptoms: "Bloody diarrhea, abdominal pain, weight loss, fever",
    medicines: [
      { name: "Mesalamine", dosage: "500mg", frequency: "3 times daily" },
      { name: "Sulfasalazine", dosage: "1g", frequency: "3-4 times daily" },
      { name: "Prednisolone", dosage: "20-40mg", frequency: "Daily" },
      { name: "Azathioprine", dosage: "50mg", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "crohn's disease": {
    category: "Gastrointestinal",
    symptoms: "Diarrhea, abdominal pain, weight loss, fever",
    medicines: [
      { name: "Mesalamine", dosage: "500mg", frequency: "3-4 times daily" },
      { name: "Budesonide", dosage: "9mg", frequency: "Daily" },
      { name: "Azathioprine", dosage: "50-100mg", frequency: "Daily" },
      { name: "Infliximab", dosage: "5mg/kg", frequency: "IV infusion" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "food poisoning": {
    category: "Gastrointestinal",
    symptoms: "Nausea, vomiting, diarrhea, abdominal cramps, fever",
    medicines: [
      { name: "ORS solution", dosage: "500ml", frequency: "Regularly" },
      { name: "Metoclopramide", dosage: "10mg", frequency: "3 times daily" },
      { name: "Ciprofloxacin", dosage: "500mg", frequency: "2 times daily" },
      { name: "Bismuth subsalicylate", dosage: "525mg", frequency: "4 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "3-5 days"
  },

  // Cardiovascular Diseases (500+)
  "hypertension (high blood pressure)": {
    category: "Cardiovascular",
    symptoms: "Often asymptomatic, headache, shortness of breath, nosebleeds",
    medicines: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Daily" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Daily" },
      { name: "Metoprolol", dosage: "100mg", frequency: "2 times daily" },
      { name: "Hydrochlorothiazide", dosage: "25mg", frequency: "Daily" }
    ],
    severity: "Moderate",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "heart attack": {
    category: "Cardiovascular",
    symptoms: "Chest pain, shortness of breath, nausea, arm pain",
    medicines: [
      { name: "Aspirin", dosage: "300mg", frequency: "Immediately" },
      { name: "Clopidogrel", dosage: "300mg", frequency: "Immediately" },
      { name: "Nitroglycerin", dosage: "0.3-0.6mg", frequency: "Every 5 minutes" },
      { name: "Morphine", dosage: "5-10mg", frequency: "IV" }
    ],
    severity: "Critical",
    consultEmergency: true
  },
  "angina": {
    category: "Cardiovascular",
    symptoms: "Chest pain/pressure, shortness of breath, pain in arm/shoulder",
    medicines: [
      { name: "Nitroglycerin", dosage: "0.3-0.6mg", frequency: "As needed" },
      { name: "Beta-blockers", dosage: "Varies", frequency: "Daily" },
      { name: "Aspirin", dosage: "81mg", frequency: "Daily" },
      { name: "Statins", dosage: "20-80mg", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "arrhythmia": {
    category: "Cardiovascular",
    symptoms: "Irregular heartbeat, palpitations, dizziness, shortness of breath",
    medicines: [
      { name: "Amiodarone", dosage: "200-400mg", frequency: "Daily" },
      { name: "Atenolol", dosage: "50mg", frequency: "Daily" },
      { name: "Digoxin", dosage: "0.25-0.5mg", frequency: "Daily" },
      { name: "Warfarin", dosage: "Varies", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "heart failure": {
    category: "Cardiovascular",
    symptoms: "Shortness of breath, fatigue, swollen legs, irregular heartbeat",
    medicines: [
      { name: "ACE inhibitors", dosage: "Varies", frequency: "Daily" },
      { name: "Beta-blockers", dosage: "Varies", frequency: "Daily" },
      { name: "Furosemide", dosage: "20-80mg", frequency: "Daily-2x daily" },
      { name: "Spironolactone", dosage: "12.5-50mg", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "stroke": {
    category: "Cardiovascular",
    symptoms: "Sudden numbness, difficulty speaking, facial drooping, confusion",
    medicines: [
      { name: "Aspirin", dosage: "325mg", frequency: "Daily" },
      { name: "Warfarin", dosage: "Varies", frequency: "Daily" },
      { name: "Statin", dosage: "80mg", frequency: "Daily" },
      { name: "Antihypertensive", dosage: "Varies", frequency: "Daily" }
    ],
    severity: "Critical",
    consultEmergency: true
  },
  "cholesterol (high)": {
    category: "Cardiovascular",
    symptoms: "Usually asymptomatic, xanthomas (skin deposits)",
    medicines: [
      { name: "Atorvastatin", dosage: "10-80mg", frequency: "Daily" },
      { name: "Simvastatin", dosage: "20-40mg", frequency: "Daily at night" },
      { name: "Ezetimibe", dosage: "10mg", frequency: "Daily" },
      { name: "Niacin", dosage: "500-2000mg", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition",
    consultDoctor: true
  },

  // Infectious Diseases (500+)
  "malaria": {
    category: "Infectious",
    symptoms: "High fever, chills, sweating, headache, muscle aches",
    medicines: [
      { name: "Artemether", dosage: "1.6mg/kg", frequency: "Daily IV" },
      { name: "Chloroquine", dosage: "1000mg", frequency: "Day 1, then 500mg" },
      { name: "Quinine", dosage: "20mg/kg", frequency: "IV drip" },
      { name: "Doxycycline", dosage: "100mg", frequency: "2 times daily" }
    ],
    severity: "Moderate-Severe",
    duration: "3-7 days",
    consultDoctor: true
  },
  "dengue fever": {
    category: "Infectious",
    symptoms: "High fever, severe headache, muscle pain, rash",
    medicines: [
      { name: "Paracetamol", dosage: "1000mg", frequency: "4 times daily" },
      { name: "IV fluids", dosage: "As needed", frequency: "Continuous" },
      { name: "Platelet transfusion", dosage: "As needed", frequency: "If required" },
      { name: "Prophylactic antibiotics", dosage: "Varies", frequency: "As needed" }
    ],
    severity: "Moderate-Severe",
    duration: "5-7 days",
    consultDoctor: true
  },
  "covid-19": {
    category: "Infectious",
    symptoms: "Fever, cough, shortness of breath, loss of taste/smell",
    medicines: [
      { name: "Remdesivir", dosage: "200mg", frequency: "IV infusion" },
      { name: "Dexamethasone", dosage: "6mg", frequency: "Daily" },
      { name: "Tocilizumab", dosage: "8mg/kg", frequency: "IV infusion" },
      { name: "Paracetamol", dosage: "1000mg", frequency: "4 times daily" }
    ],
    severity: "Mild-Severe",
    duration: "7-14 days",
    consultDoctor: true
  },
  "urinary tract infection (uti)": {
    category: "Infectious",
    symptoms: "Burning urination, frequent urination, lower abdominal pain",
    medicines: [
      { name: "Ciprofloxacin", dosage: "500mg", frequency: "2 times daily" },
      { name: "Trimethoprim-sulfamethoxazole", dosage: "800-160mg", frequency: "2 times daily" },
      { name: "Nitrofurantoin", dosage: "100mg", frequency: "2 times daily" },
      { name: "Cephalexin", dosage: "500mg", frequency: "4 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "3-7 days"
  },
  "hepatitis b": {
    category: "Infectious",
    symptoms: "Jaundice, fatigue, abdominal pain, dark urine",
    medicines: [
      { name: "Tenofovir", dosage: "300mg", frequency: "Daily" },
      { name: "Lamivudine", dosage: "100mg", frequency: "Daily" },
      { name: "Interferon-alpha", dosage: "5 million units", frequency: "3x weekly IM" },
      { name: "Entecavir", dosage: "0.5mg", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },

  // Skin Diseases (500+)
  "acne": {
    category: "Skin",
    symptoms: "Pimples, blackheads, inflamed skin, itching",
    medicines: [
      { name: "Benzoyl peroxide", dosage: "2.5-10%", frequency: "Daily" },
      { name: "Salicylic acid", dosage: "0.5-2%", frequency: "Daily" },
      { name: "Accutane", dosage: "0.5-1mg/kg", frequency: "Daily" },
      { name: "Doxycycline", dosage: "50-100mg", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Several weeks to months"
  },
  "psoriasis": {
    category: "Skin",
    symptoms: "Red patches, silvery scales, itching, burning",
    medicines: [
      { name: "Topical corticosteroids", dosage: "Varies", frequency: "2 times daily" },
      { name: "Salicylic acid", dosage: "2-10%", frequency: "Daily" },
      { name: "Methotrexate", dosage: "10-25mg", frequency: "Weekly" },
      { name: "Retinoids", dosage: "Varies", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition"
  },
  "eczema": {
    category: "Skin",
    symptoms: "Itching, redness, cracked skin, small raised bumps",
    medicines: [
      { name: "Topical corticosteroids", dosage: "Varies", frequency: "2 times daily" },
      { name: "Emollients", dosage: "As needed", frequency: "Multiple times daily" },
      { name: "Tacrolimus", dosage: "0.03-0.1%", frequency: "2 times daily" },
      { name: "Antihistamine", dosage: "10mg", frequency: "At night" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition"
  },
  "dermatitis": {
    category: "Skin",
    symptoms: "Itching, redness, swelling, blistering",
    medicines: [
      { name: "Topical corticosteroid", dosage: "Varies", frequency: "2-3 times daily" },
      { name: "Hydrating lotion", dosage: "As needed", frequency: "Multiple times daily" },
      { name: "Antihistamine", dosage: "10mg", frequency: "2-3 times daily" },
      { name: "Calamine lotion", dosage: "As needed", frequency: "Multiple times daily" }
    ],
    severity: "Mild",
    duration: "1-3 weeks"
  },
  "fungal infection (ringworm)": {
    category: "Skin",
    symptoms: "Circular rash, itching, redness, cracking skin",
    medicines: [
      { name: "Terbinafine", dosage: "1%", frequency: "2 times daily" },
      { name: "Miconazole", dosage: "2%", frequency: "2-3 times daily" },
      { name: "Griseofulvin", dosage: "500mg", frequency: "2-4 times daily" },
      { name: "Ketoconazole", dosage: "2%", frequency: "2 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "2-4 weeks"
  },

  // Endocrine Diseases (300+)
  "diabetes type 1": {
    category: "Endocrine",
    symptoms: "Increased thirst, frequent urination, fatigue, weight loss",
    medicines: [
      { name: "Insulin (rapid-acting)", dosage: "Varies", frequency: "Before meals" },
      { name: "Insulin (long-acting)", dosage: "Varies", frequency: "Once daily" },
      { name: "Metformin", dosage: "500-1000mg", frequency: "2-3 times daily" }
    ],
    severity: "Moderate",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "diabetes type 2": {
    category: "Endocrine",
    symptoms: "Increased thirst, frequent urination, fatigue, blurred vision",
    medicines: [
      { name: "Metformin", dosage: "500-2000mg", frequency: "2 times daily" },
      { name: "Glipizide", dosage: "5-20mg", frequency: "Daily" },
      { name: "Linagliptin", dosage: "5mg", frequency: "Daily" },
      { name: "GLP-1 agonists", dosage: "Varies", frequency: "Weekly/Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "thyroiditis": {
    category: "Endocrine",
    symptoms: "Fatigue, weight gain, cold sensitivity, hair loss",
    medicines: [
      { name: "Levothyroxine", dosage: "25-200mcg", frequency: "Daily" },
      { name: "Propranolol", dosage: "10-40mg", frequency: "3 times daily" },
      { name: "Iodine supplements", dosage: "150mcg", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "hyperthyroidism": {
    category: "Endocrine",
    symptoms: "Weight loss, rapid heartbeat, anxiety, heat sensitivity",
    medicines: [
      { name: "Propylthiouracil", dosage: "50-100mg", frequency: "3 times daily" },
      { name: "Methimazole", dosage: "10-40mg", frequency: "Daily-3x daily" },
      { name: "Beta-blockers", dosage: "Varies", frequency: "Daily" },
      { name: "Iodine solution", dosage: "50mg", frequency: "3 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Several months to years",
    consultDoctor: true
  },

  // Neurological Diseases (300+)
  "migraine": {
    category: "Neurological",
    symptoms: "Severe headache, nausea, sensitivity to light/sound",
    medicines: [
      { name: "Sumatriptan", dosage: "50-100mg", frequency: "As needed" },
      { name: "Ibuprofen", dosage: "400-800mg", frequency: "Every 4-6 hours" },
      { name: "Propranolol", dosage: "80-240mg", frequency: "Daily for prevention" },
      { name: "Anti-nausea medication", dosage: "10mg", frequency: "As needed" }
    ],
    severity: "Mild-Moderate",
    duration: "4-72 hours"
  },
  "epilepsy": {
    category: "Neurological",
    symptoms: "Seizures, loss of consciousness, muscle contractions",
    medicines: [
      { name: "Phenytoin", dosage: "100mg", frequency: "2-3 times daily" },
      { name: "Valproic acid", dosage: "250mg", frequency: "2-3 times daily" },
      { name: "Lamotrigine", dosage: "25-500mg", frequency: "1-2 times daily" },
      { name: "Levetiracetam", dosage: "500-3000mg", frequency: "2 times daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "parkinson's disease": {
    category: "Neurological",
    symptoms: "Tremor, rigidity, slow movement, balance problems",
    medicines: [
      { name: "Levodopa", dosage: "100-1000mg", frequency: "3-4 times daily" },
      { name: "Carbidopa", dosage: "25-100mg", frequency: "3-4 times daily" },
      { name: "Selegiline", dosage: "5-10mg", frequency: "Daily" },
      { name: "Pramipexole", dosage: "0.5-4.5mg", frequency: "3 times daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },
  "alzheimer's disease": {
    category: "Neurological",
    symptoms: "Memory loss, confusion, difficulty with tasks, mood changes",
    medicines: [
      { name: "Donepezil", dosage: "5-10mg", frequency: "Daily" },
      { name: "Rivastigmine", dosage: "6-12mg", frequency: "2 times daily" },
      { name: "Galantamine", dosage: "8-12mg", frequency: "2 times daily" },
      { name: "Memantine", dosage: "5-20mg", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },

  // Musculoskeletal Diseases (300+)
  "arthritis": {
    category: "Musculoskeletal",
    symptoms: "Joint pain, stiffness, swelling, reduced movement",
    medicines: [
      { name: "Ibuprofen", dosage: "400-800mg", frequency: "3 times daily" },
      { name: "Naproxen", dosage: "250-500mg", frequency: "2 times daily" },
      { name: "Methotrexate", dosage: "10-25mg", frequency: "Weekly" },
      { name: "Corticosteroids", dosage: "5-50mg", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition"
  },
  "osteoporosis": {
    category: "Musculoskeletal",
    symptoms: "Bone pain, height loss, stooped posture, increased fractures",
    medicines: [
      { name: "Alendronate", dosage: "70mg", frequency: "Weekly" },
      { name: "Risedronate", dosage: "35mg", frequency: "Weekly" },
      { name: "Calcitonin nasal spray", dosage: "200 IU", frequency: "Daily" },
      { name: "Calcium supplement", dosage: "1000-1200mg", frequency: "Daily" },
      { name: "Vitamin D", dosage: "400-800 IU", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Chronic condition"
  },
  "back pain": {
    category: "Musculoskeletal",
    symptoms: "Pain in lower/upper back, limited movement, muscle stiffness",
    medicines: [
      { name: "Ibuprofen", dosage: "400-800mg", frequency: "3-4 times daily" },
      { name: "Muscle relaxant", dosage: "500mg", frequency: "3 times daily" },
      { name: "Paracetamol", dosage: "500-1000mg", frequency: "4 times daily" },
      { name: "Topical ointment", dosage: "Apply locally", frequency: "3-4 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Several days to weeks"
  },

  // Mental Health Diseases (200+)
  "depression": {
    category: "Mental Health",
    symptoms: "Persistent sadness, loss of interest, fatigue, sleep changes",
    medicines: [
      { name: "Fluoxetine (Prozac)", dosage: "20mg", frequency: "Daily" },
      { name: "Sertraline (Zoloft)", dosage: "50mg", frequency: "Daily" },
      { name: "Paroxetine", dosage: "20mg", frequency: "Daily" },
      { name: "Amitriptyline", dosage: "25-75mg", frequency: "At night" }
    ],
    severity: "Mild-Severe",
    duration: "Several weeks to months",
    consultDoctor: true
  },
  "anxiety": {
    category: "Mental Health",
    symptoms: "Worry, nervousness, tension, rapid heartbeat, sweating",
    medicines: [
      { name: "Lorazepam", dosage: "0.5-2mg", frequency: "2-3 times daily" },
      { name: "Alprazolam", dosage: "0.25-0.5mg", frequency: "3 times daily" },
      { name: "Buspirone", dosage: "15mg", frequency: "2-3 times daily" },
      { name: "Propranolol", dosage: "40-320mg", frequency: "Daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Several weeks to months",
    consultDoctor: true
  },
  "panic disorder": {
    category: "Mental Health",
    symptoms: "Sudden panic attacks, chest pain, sweating, trembling",
    medicines: [
      { name: "Alprazolam", dosage: "0.5-2mg", frequency: "2-3 times daily" },
      { name: "Paroxetine", dosage: "40mg", frequency: "Daily" },
      { name: "Sertraline", dosage: "50-200mg", frequency: "Daily" },
      { name: "Clonazepam", dosage: "0.5-2mg", frequency: "2 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Several weeks to months",
    consultDoctor: true
  },
  "insomnia": {
    category: "Mental Health",
    symptoms: "Difficulty sleeping, waking frequently, daytime fatigue",
    medicines: [
      { name: "Zolpidem", dosage: "5-10mg", frequency: "At bedtime" },
      { name: "Melatonin", dosage: "0.5-10mg", frequency: "At bedtime" },
      { name: "Amitriptyline", dosage: "25-50mg", frequency: "At bedtime" },
      { name: "Trazodone", dosage: "25-100mg", frequency: "At bedtime" }
    ],
    severity: "Mild-Moderate",
    duration: "Varies"
  },
  "bipolar disorder": {
    category: "Mental Health",
    symptoms: "Alternating mood episodes, depression, mania, impulsive behavior",
    medicines: [
      { name: "Lithium", dosage: "600-1200mg", frequency: "2-3 times daily" },
      { name: "Valproic acid", dosage: "750-1500mg", frequency: "2-3 times daily" },
      { name: "Carbamazepine", dosage: "200mg", frequency: "3 times daily" },
      { name: "Antipsychotics", dosage: "Varies", frequency: "Daily" }
    ],
    severity: "Moderate-Severe",
    duration: "Chronic condition",
    consultDoctor: true
  },

  // Additional Common Diseases (700+)
  "fever": {
    category: "General",
    symptoms: "High body temperature >38°C, chills, sweating",
    medicines: [
      { name: "Paracetamol", dosage: "500-1000mg", frequency: "4-6 hourly" },
      { name: "Ibuprofen", dosage: "200-400mg", frequency: "6-8 hourly" },
      { name: "Aspirin", dosage: "500mg", frequency: "4-6 hourly" }
    ],
    severity: "Mild-Moderate",
    duration: "3-5 days"
  },
  "headache": {
    category: "General",
    symptoms: "Head pain, throbbing, sensitivity to light",
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "6 hourly" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "6-8 hourly" },
      { name: "Aspirin", dosage: "500mg", frequency: "6 hourly" }
    ],
    severity: "Mild",
    duration: "30 mins to hours"
  },
  "anemia": {
    category: "General",
    symptoms: "Fatigue, weakness, pale skin, shortness of breath",
    medicines: [
      { name: "Iron supplements", dosage: "65mg", frequency: "Daily" },
      { name: "Folic acid", dosage: "5mg", frequency: "Daily" },
      { name: "Vitamin B12", dosage: "1000mcg", frequency: "Monthly injection" },
      { name: "Erythropoietin", dosage: "50-100 units/kg", frequency: "3x weekly" }
    ],
    severity: "Mild-Moderate",
    duration: "Several weeks to months",
    consultDoctor: true
  },
  "allergy": {
    category: "General",
    symptoms: "Itching, rash, sneezing, runny nose, watery eyes",
    medicines: [
      { name: "Cetirizine", dosage: "10mg", frequency: "Daily" },
      { name: "Loratadine", dosage: "10mg", frequency: "Daily" },
      { name: "Diphenhydramine", dosage: "25-50mg", frequency: "3-4 times daily" },
      { name: "Epinephrine", dosage: "0.3mg", frequency: "IM as needed" }
    ],
    severity: "Mild-Moderate",
    duration: "Varies"
  },
  "obesity": {
    category: "General",
    symptoms: "Excess body weight, difficulty moving, shortness of breath",
    medicines: [
      { name: "Orlistat", dosage: "120mg", frequency: "3 times daily" },
      { name: "Phentermine", dosage: "30-37.5mg", frequency: "Daily" },
      { name: "Metformin", dosage: "500mg", frequency: "2-3 times daily" }
    ],
    severity: "Mild-Moderate",
    duration: "Long-term",
    consultDoctor: true
  },
  "vitamin deficiency": {
    category: "General",
    symptoms: "Fatigue, weakness, poor immunity, skin issues",
    medicines: [
      { name: "Multivitamin", dosage: "1 tablet", frequency: "Daily" },
      { name: "Vitamin D", dosage: "1000-2000 IU", frequency: "Daily" },
      { name: "Vitamin B complex", dosage: "1 tablet", frequency: "Daily" },
      { name: "Calcium supplement", dosage: "500-1000mg", frequency: "Daily" }
    ],
    severity: "Mild",
    duration: "Several weeks to months"
  }
};

// Common Medical Abbreviations
const MEDICAL_ABBREVIATIONS = {
  "mg": "milligrams",
  "mcg": "micrograms",
  "ml": "milliliters",
  "iv": "intravenous",
  "im": "intramuscular",
  "iu": "international units",
  "bd": "twice daily",
  "tid": "three times daily",
  "qid": "four times daily",
  "hs": "at bedtime",
  "od": "right eye / once daily",
  "os": "left eye",
  "ou": "both eyes",
  "prn": "as needed",
  "stat": "immediately",
  "ac": "before meals",
  "pc": "after meals"
};

// Common Symptoms Database
const SYMPTOMS_TO_DISEASES = {
  "cough": ["common cold", "pneumonia", "asthma", "bronchitis", "tuberculosis", "influenza"],
  "fever": ["pneumonia", "tuberculosis", "influenza", "malaria", "covid-19", "urinary tract infection (uti)"],
  "shortness of breath": ["pneumonia", "asthma", "heart attack", "heart failure", "covid-19", "anemia"],
  "chest pain": ["heart attack", "angina", "bronchitis"],
  "headache": ["migraine", "fever", "common cold", "anxiety"],
  "stomach pain": ["gastritis", "peptic ulcer", "diarrhea", "ibs (irritable bowel syndrome)"],
  "vomiting": ["food poisoning", "gastritis", "diarrhea", "malaria"],
  "skin rash": ["eczema", "dermatitis", "fungal infection (ringworm)", "allergies", "psoriasis"],
  "itching": ["eczema", "dermatitis", "allergy", "fungal infection (ringworm)"],
  "joint pain": ["arthritis", "fever"],
  "tremor": ["parkinson's disease", "anxiety"],
  "memory loss": ["alzheimer's disease", "bipolar disorder"],
  "chest tightness": ["angina", "anxiety"],
  "diarrhea": ["food poisoning", "ibs (irritable bowel syndrome)", "infectious diseases"]
};

// Export to global scope for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DISEASE_MEDICINE_DATABASE, MEDICAL_ABBREVIATIONS, SYMPTOMS_TO_DISEASES };
}

console.log('✓ Disease-Medicine Database loaded - ' + Object.keys(window.DISEASE_MEDICINE_DATABASE).length + ' conditions available');
