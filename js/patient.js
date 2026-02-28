import { auth, db } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Protect page
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
  else {
    loadAppointments();
    loadEHR();
    initCharts();
  }
});

// Panel switching
window.switchPanel = function(panelId) {
  document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-link').forEach(m => m.classList.remove('active'));
  
  document.getElementById(panelId).classList.add('active');
  document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
};

// Setup menu links
document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const panelId = link.getAttribute('data-panel');
    switchPanel(panelId);
  });
});

// Logout Function
window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

// Show Alert Message
function showAlert(message, type = "success") {
  const alertDiv = document.getElementById("alerts");
  alertDiv.innerHTML = `<p style="margin: 0;">${message}</p>`;
  alertDiv.className = `alerts show ${type === 'success' ? 'success' : ''}`;
  setTimeout(() => alertDiv.classList.remove("show"), 5000);
}

// Book Appointment
window.bookAppointment = async function () {
  const doctor = document.getElementById("doctorSelect").value;
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;
  const reason = document.getElementById("visitReason").value;

  if (!doctor || !date || !time || !reason) {
    showAlert("Please fill all fields", "warning");
    return;
  }

  try {
    await addDoc(collection(db, "appointments"), {
      patientId: auth.currentUser.uid,
      patientEmail: auth.currentUser.email,
      patientName: auth.currentUser.displayName || "Patient",
      doctor,
      date,
      time,
      reason,
      status: "pending",
      createdAt: new Date()
    });

    showAlert("✅ Appointment booked successfully!", "success");
    document.getElementById("appointmentForm").reset();
    loadAppointments();
  } catch (error) {
    showAlert("❌ Error booking appointment: " + error.message, "warning");
  }
};

// Load Appointments
async function loadAppointments() {
  if (!auth.currentUser) return;

  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const list = document.getElementById("appointmentsList");
    list.innerHTML = "";

    let count = 0;
    querySnapshot.forEach((doc) => {
      count++;
      const data = doc.data();
      const appointmentDate = new Date(data.date).toLocaleDateString();
      list.innerHTML += `
        <div class="record-item">
          <strong>👨‍⚕️ ${data.doctor}</strong>
          <p>📅 ${appointmentDate} at ${data.time}</p>
          <p>📝 ${data.reason}</p>
          <p>Status: <span style="background: #fff3cd; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${data.status}</span></p>
          <button class="btn-secondary" onclick="cancelAppointment('${doc.id}')" style="margin-top: 8px;">Cancel</button>
        </div>
      `;
    });

    if (count === 0) {
      list.innerHTML = '<p style="color: #999; text-align: center;">No appointments yet</p>';
    }

    document.getElementById("appointmentsCount").textContent = count;
  } catch (error) {
    console.error("Error loading appointments:", error);
  }
}

// Cancel Appointment
window.cancelAppointment = async function (docId) {
  if (!confirm("Are you sure?")) return;
  try {
    await deleteDoc(doc(db, "appointments", docId));
    showAlert("✅ Appointment cancelled", "success");
    loadAppointments();
  } catch (error) {
    showAlert("❌ Error cancelling appointment", "warning");
  }
};

// Load EHR/Medical Records
async function loadEHR() {
  if (!auth.currentUser) return;

  try {
    const querySnapshot = await getDocs(collection(db, "ehr"));
    const list = document.getElementById("ehrList");
    list.innerHTML = "";

    let count = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.patientId === auth.currentUser.email || data.patientId === auth.currentUser.uid) {
        count++;
        list.innerHTML += `
          <div class="record-item">
            <strong>💉 Diagnosis:</strong> ${data.diagnosis}
            <p><strong>💊 Prescription:</strong> ${data.prescription}</p>
            ${data.dosage ? `<p><strong>📊 Dosage:</strong> ${data.dosage}</p>` : ''}
            <p style="color: #999; font-size: 12px;"><strong>📅 Date:</strong> ${data.date}</p>
          </div>
        `;
      }
    });

    if (count === 0) {
      list.innerHTML = '<p style="color: #999; text-align: center;">No medical records yet</p>';
    }
    document.getElementById("recordsCount").textContent = count;
  } catch (error) {
    console.error("Error loading EHR:", error);
  }
}

// Comprehensive Medicine Database
const medicineDatabase = {
  aspirin: {
    name: "Aspirin",
    brandNames: "Disprin, Ecotrin",
    uses: "Pain relief, fever reduction, blood thinner, prevent heart attacks and strokes",
    dosage: "500mg tablets, typically 1-2 tablets every 4-6 hours",
    sideEffects: "Stomach upset, heartburn, nausea, allergic reactions, increased bleeding",
    precautions: "Avoid if allergic to aspirin, during pregnancy, or if on blood thinners",
    type: "Analgesic & Anti-inflammatory"
  },
  paracetamol: {
    name: "Paracetamol",
    brandNames: "Tylenol, Calpol, Dolo",
    uses: "Pain relief, fever reduction, mild to moderate pain",
    dosage: "500mg tablets, 1-2 tablets every 4-6 hours (max 4g per day)",
    sideEffects: "Rare liver damage with overdose, allergic reactions, rash",
    precautions: "Avoid overdose, use caution with liver disease",
    type: "Analgesic & Antipyretic"
  },
  ibuprofen: {
    name: "Ibuprofen",
    brandNames: "Brufen, Advil, Combiflam",
    uses: "Pain relief, inflammation reduction, fever reduction, arthritis",
    dosage: "200-400mg tablets, 1 tablet every 4-6 hours as needed",
    sideEffects: "Stomach upset, heartburn, ulcers, dizziness, allergic reactions",
    precautions: "Take with food, avoid if ulcers or stomach issues, not for long-term use",
    type: "NSAID (Non-Steroidal Anti-Inflammatory)"
  },
  amoxicillin: {
    name: "Amoxicillin",
    brandNames: "Amoxil, Acillin",
    uses: "Antibiotic for bacterial infections (ear, throat, urinary tract, respiratory)",
    dosage: "500mg tablets, typically 1 tablet 3 times daily for 7-10 days",
    sideEffects: "Allergic reactions (rash), diarrhea, stomach upset, nausea",
    precautions: "Complete full course, avoid if allergic to penicillin, inform doctor of allergies",
    type: "Antibiotic (Penicillin)"
  },
  cetirizine: {
    name: "Cetirizine",
    brandNames: "Allergan, Avil",
    uses: "Allergy relief, itching, hives, allergic rhinitis, hay fever",
    dosage: "10mg tablet once daily, can be increased to 20mg if needed",
    sideEffects: "Drowsiness, dry mouth, headache, dizziness",
    precautions: "May cause drowsiness, avoid driving, use caution with kidney disease",
    type: "Antihistamine"
  },
  omeprazole: {
    name: "Omeprazole",
    brandNames: "Losec, Gastroloc",
    uses: "Acid reflux, heartburn, GERD, ulcers, stomach protection",
    dosage: "20-40mg capsule once daily, usually before breakfast",
    sideEffects: "Headache, diarrhea, nausea, stomach pain, long-term risks",
    precautions: "Take 30-60 minutes before food, not for long-term use without doctor supervision",
    type: "Proton Pump Inhibitor"
  },
  metformin: {
    name: "Metformin",
    brandNames: "Glucophage, Diabage",
    uses: "Type 2 diabetes management, blood sugar control, PCOS",
    dosage: "500mg tablets, typically 500-1000mg twice daily with meals",
    sideEffects: "Stomach upset, diarrhea, nausea, metallic taste, vitamin B12 deficiency",
    precautions: "Take with food, avoid with kidney disease, may need monitoring",
    type: "Antidiabetic"
  },
  atorvastatin: {
    name: "Atorvastatin",
    brandNames: "Lipitor, Lipicure",
    uses: "Cholesterol reduction, heart disease prevention, cardiovascular health",
    dosage: "10-80mg tablet once daily, usually at night",
    sideEffects: "Muscle pain, weakness, liver damage (rare), headache, nausea",
    precautions: "Regular liver tests needed, avoid grapefruit juice, inform doctor of muscle pain",
    type: "Statin (Cholesterol-lowering)"
  }
};

// Search Medicine
window.searchMedicine = function () {
  const input = document.getElementById("medicineSearch").value.toLowerCase().trim();
  const resultDiv = document.getElementById("medicineResult");

  if (!input) {
    resultDiv.innerHTML = "";
    return;
  }

  let found = false;
  for (let key in medicineDatabase) {
    if (key.includes(input) || medicineDatabase[key].name.toLowerCase().includes(input) || medicineDatabase[key].brandNames.toLowerCase().includes(input)) {
      displayMedicineInfo(medicineDatabase[key]);
      found = true;
      break;
    }
  }

  if (!found) {
    resultDiv.innerHTML = `<div style="background: #f8d7da; color: #842029; padding: 15px; border-radius: 8px;"><strong>⚠️ Medicine Not Found</strong><p style="margin: 5px 0 0 0;">The medicine you're looking for is not in our database. Please consult a doctor or pharmacist for more information.</p></div>`;
  }

  resultDiv.scrollIntoView({ behavior: 'smooth' });
};

// Show Medicine
window.showMedicine = function(medicineName) {
  const medicine = medicineDatabase[medicineName.toLowerCase()];
  if (medicine) {
    displayMedicineInfo(medicine);
    switchPanel('medicine');
  }
};

// Display Medicine Info
function displayMedicineInfo(medicine) {
  const resultDiv = document.getElementById("medicineResult");
  resultDiv.innerHTML = `
    <div class="medicine-result">
      <h3>💊 ${medicine.name}</h3>
      
      <div class="medicine-detail">
        <strong>Brand Names:</strong>
        <p>${medicine.brandNames}</p>
      </div>

      <div class="medicine-detail">
        <strong>Type:</strong>
        <p>${medicine.type}</p>
      </div>

      <div class="medicine-detail">
        <strong>Uses / What is it for:</strong>
        <p>${medicine.uses}</p>
      </div>

      <div class="medicine-detail">
        <strong>Dosage / How to take:</strong>
        <p>${medicine.dosage}</p>
      </div>

      <div class="medicine-detail">
        <strong>Side Effects / Risks:</strong>
        <p>${medicine.sideEffects}</p>
      </div>

      <div class="medicine-detail">
        <strong>⚠️ Precautions & Warnings:</strong>
        <p>${medicine.precautions}</p>
      </div>

      <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #ffc107;">
        <strong>📌 Important Note:</strong> This information is for educational purposes only. Always consult a doctor or pharmacist before taking any medicine.
      </div>
    </div>
  `;
}

// Chat functionality with improved AI responses
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Comprehensive AI Response System
const aiSymptomResponses = {
  fever: {
    keywords: ["fever", "temperature", "hot", "burning", "high temp"],
    response: "Fever is your body's way of fighting infection. Here are some tips:\n\n✓ Stay hydrated - drink 8-10 glasses of water daily\n✓ Rest - get 7-9 hours of sleep\n✓ Cool compress - apply to forehead\n✓ Take paracetamol (500mg) if temperature > 101°F\n\n⚠️ Seek emergency care if: fever > 104°F, severe difficulty breathing, confusion, or symptoms persist > 5 days"
  },
  cough: {
    keywords: ["cough", "coughing", "throat", "phlegm", "mucus"],
    response: "Cough management tips:\n\n✓ Stay hydrated - warm liquids help\n✓ Honey & lemon - soothing home remedy\n✓ Use cough drops or lozenges\n✓ Avoid smoking & pollution\n✓ Elevate your head while sleeping\n\n⚠️ Consult doctor if: cough lasts >2 weeks, you cough blood, severe chest pain, or breathing difficulty"
  },
  headache: {
    keywords: ["headache", "head pain", "migraine", "head ache"],
    response: "Headache relief strategies:\n\n✓ Rest in a quiet, dark room\n✓ Apply cold compress for 15 minutes\n✓ Stay hydrated - dehydration is a common cause\n✓ Massage neck and shoulders\n✓ Try aspirin/paracetamol (500mg)\n\n⚠️ Seek doctor if: sudden severe pain, pain with vision changes, fever, or confusion"
  },
  cold: {
    keywords: ["cold", "common cold", "viral", "sneezing", "runny nose"],
    response: "Common Cold Management:\n\n✓ Rest for 3-5 days\n✓ Vitamin C - citrus fruits, berries\n✓ Honey - excellent for coughs\n✓ Warm fluids - tea with ginger\n✓ Saline nasal drops\n\nMost colds resolve in 7-10 days naturally. Antibiotics don't work for viral colds."
  },
  flu: {
    keywords: ["flu", "influenza", "grippe"],
    response: "Flu (Influenza) Management:\n\n✓ Rest immediately - critical\n✓ Antiviral medication - start within 48 hours\n✓ Pain relief - paracetamol/ibuprofen\n✓ Stay hydrated - drink fluids regularly\n✓ Isolate to prevent spread (contagious for 7 days)\n\n⚠️ Seek emergency care if: severe breathing difficulty, chest pain, confusion, or high fever (>104°F)"
  },
  stomachache: {
    keywords: ["stomach", "belly", "abdomen", "pain", "ache", "cramps"],
    response: "Stomach Ache Management:\n\n✓ Rest - avoid physical activity\n✓ Light diet - bread, rice, banana, plain foods\n✓ Hydration - sip water slowly\n✓ Ginger tea - helps digestion\n\n⚠️ See doctor if: pain lasts >2 days, accompanied by vomiting/blood, or severe fever"
  },
  allergy: {
    keywords: ["allergy", "allergic", "itching", "itch", "hives", "rash"],
    response: "Allergy Management:\n\n✓ Identify trigger - avoid allergen\n✓ Antihistamines - cetirizine 10mg daily\n✓ Moisturize - for dry skin\n✓ Avoid scratching - use cool compress\n✓ Clean surroundings - reduce dust\n\n⚠️ Emergency if: severe swelling, throat closure, or difficulty breathing"
  },
  insomnia: {
    keywords: ["sleep", "insomnia", "sleep problem", "can't sleep", "sleepless"],
    response: "Better Sleep Habits:\n\n✓ Sleep schedule - consistent bedtime\n✓ Avoid caffeine - after 3 PM\n✓ Exercise - but not before bed\n✓ Cool room - 65-68°F is ideal\n✓ Meditation - relaxation techniques\n✓ No screens - 1 hour before bed\n\nIf insomnia persists >2 weeks, consult a doctor."
  },
  bloodpressure: {
    keywords: ["blood pressure", "bp", "high pressure", "hypertension", "low pressure"],
    response: "Blood Pressure Management:\n\n✓ Reduce salt intake\n✓ Regular exercise - 30 min daily\n✓ Stress management - meditation\n✓ Weight management - if overweight\n✓ Limit alcohol\n✓ Monitor regularly - get checked monthly\n\nNormal BP: <120/80. Consult doctor for management plan."
  }
};

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("You", message);
  chatInput.value = "";
  
  // Create AI message element with loading indicator
  const aiMessageId = "ai-message-" + Date.now();
  const chatDiv = document.createElement("div");
  chatDiv.className = "message ai-msg";
  chatDiv.id = aiMessageId;
  chatDiv.innerHTML = `<strong>AI Doctor:</strong> <span class="typing-indicator"><span></span><span></span><span></span></span>`;
  chatMessages.appendChild(chatDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let response = null;

  // Try API first (PRIMARY SOURCE)
  try {
    const apiResponse = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      response = data.reply || data.response || data.answer; // Try multiple response fields
      console.log("✅ API Response:", response);
    } else {
      console.warn("API returned non-ok status:", apiResponse.status);
      response = null;
    }
  } catch (error) {
    console.warn("API call failed, using offline responses:", error.message);
    response = null;
  }

  // Fallback to offline AI if API fails
  if (!response) {
    response = getOfflineAIResponse(message);
    if (response) {
      console.log("💾 Using offline response");
    }
  }

  // Final fallback to general response
  if (!response) {
    response = getGeneralAIResponse();
  }

  // Update message with actual response
  updateMessage(chatDiv, "AI Doctor", response);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getOfflineAIResponse(userMessage) {
  const messageLower = userMessage.toLowerCase();

  // Check symptom categories
  for (let category in aiSymptomResponses) {
    const keywords = aiSymptomResponses[category].keywords;
    for (let keyword of keywords) {
      if (messageLower.includes(keyword)) {
        return aiSymptomResponses[category].response;
      }
    }
  }

  // General questions
  if (messageLower.includes("medicine") || messageLower.includes("drug")) {
    return "I can help you find medicine information. Try searching for specific medicines in the Medicine Search section or ask about: Aspirin, Paracetamol, Ibuprofen, Amoxicillin, Cetirizine, Omeprazole, Metformin, or Atorvastatin.";
  }

  if (messageLower.includes("appointment") || messageLower.includes("doctor")) {
    return "You can book appointments with available doctors through the Appointments section. Choose your preferred doctor, date, time, and reason for the visit.";
  }

  if (messageLower.includes("emergency") || messageLower.includes("urgent") || messageLower.includes("911")) {
    return "🚨 IF THIS IS A MEDICAL EMERGENCY:\n\n✓ Call Emergency Services (911 in US, 100 in India)\n✓ Go to nearest hospital immediately\n✓ Do NOT wait for response\n\nI can provide guidance for non-emergency situations only.";
  }

  return null; // Return null if no match to trigger general response
}

function getGeneralAIResponse() {
  return "I'm your AI Health Assistant. I can help with:\n\n✓ Common symptoms (fever, cough, headache, cold, flu, etc.)\n✓ Medicine information (uses, dosage, side effects)\n✓ Health tips and general guidance\n✓ Appointment information\n\nFor serious concerns or specific medical advice, please consult a doctor. What would you like to know?";
}

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  const className = sender === "You" ? "user-msg" : "ai-msg";
  msgDiv.className = `message ${className}`;
  msgDiv.id = sender === "You" ? "" : "ai-message-" + Date.now();
  
  // Add loading animation if from AI
  if (sender === "AI Doctor") {
    msgDiv.innerHTML = `<strong>${sender}:</strong> <span class="typing-indicator"><span></span><span></span><span></span></span>`;
  } else {
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  }
  
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return msgDiv;
}

// Update message content
function updateMessage(element, sender, text) {
  element.innerHTML = `<strong>${sender}:</strong> ${text}`;
}

// Jitsi Video Call
window.startCall = function () {
  const roomName = document.getElementById("roomName").value || "patient-" + Date.now();
  
  if (!window.JitsiMeetExternalAPI) {
    alert("Video service not loaded. Please refresh page.");
    return;
  }

  const domain = "meet.jit.si";
  const options = {
    roomName: roomName,
    width: "100%",
    height: 400,
    parentNode: document.querySelector("#jitsiContainer"),
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      disableModeratorIndicator: true
    }
  };

  try {
    new JitsiMeetExternalAPI(domain, options);
  } catch (error) {
    alert("Error starting video call: " + error.message);
  }
};

// Initialize Charts
function initCharts() {
  const ctxBP = document.getElementById("bpChart");
  if (ctxBP) {
    new Chart(ctxBP, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Systolic",
          data: [120, 122, 118, 121, 119, 120, 118],
          borderColor: "#0f766e",
          borderWidth: 2,
          tension: 0.4,
          fill: false
        }, {
          label: "Diastolic",
          data: [80, 82, 78, 81, 79, 80, 78],
          borderColor: "#14b8a6",
          borderWidth: 2,
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: false, min: 70, max: 130 } }
      }
    });
  }

  const ctxHealth = document.getElementById("healthChart");
  if (ctxHealth) {
    new Chart(ctxHealth, {
      type: "bar",
      data: {
        labels: ["Last Week", "This Week"],
        datasets: [{
          label: "Health Score (out of 100)",
          data: [82, 85],
          backgroundColor: "#0f766e"
        }]
      },
      options: {
        responsive: true,
        scales: { y: { max: 100, beginAtZero: true } }
      }
    });
  }
}
