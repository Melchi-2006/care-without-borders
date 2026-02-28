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

// Logout Function
window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

// Show Alert Message
function showAlert(message, type = "success") {
  const alertDiv = document.getElementById("alerts");
  alertDiv.innerHTML = `<p>${message}</p>`;
  alertDiv.className = `alerts show ${type}`;
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

    showAlert("Appointment booked successfully!", "success");
    document.getElementById("appointmentForm").reset();
    loadAppointments();
  } catch (error) {
    showAlert("Error booking appointment: " + error.message, "warning");
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
          <strong>${data.doctor}</strong>
          <p>📅 ${appointmentDate} at ${data.time}</p>
          <p>Reason: ${data.reason}</p>
          <p>Status: <span class="status-badge-${data.status}">${data.status}</span></p>
          <button class="btn-secondary" onclick="cancelAppointment('${doc.id}')" style="margin-top: 8px;">Cancel</button>
        </div>
      `;
    });

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
    showAlert("Appointment cancelled", "success");
    loadAppointments();
  } catch (error) {
    showAlert("Error cancelling appointment", "warning");
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
            <strong>Diagnosis:</strong> ${data.diagnosis}
            <p><strong>Prescription:</strong> ${data.prescription}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            ${data.dosage ? `<p><strong>Dosage:</strong> ${data.dosage}</p>` : ''}
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

// Search Medicine
window.searchMedicine = function () {
  const input = document.getElementById("medicineSearch").value.toLowerCase();
  const resultDiv = document.getElementById("medicineResult");

  if (!input) {
    resultDiv.style.display = "none";
    return;
  }

  // Sample medicine database
  const medicines = {
    aspirin: {
      name: "Aspirin",
      uses: "Pain relief, fever reduction, blood thinner",
      dosage: "500mg tablets",
      sideEffects: "Stomach upset, allergic reactions"
    },
    paracetamol: {
      name: "Paracetamol",
      uses: "Pain relief, fever reduction",
      dosage: "500mg tablets",
      sideEffects: "Rare liver issues with overdose"
    },
    ibuprofen: {
      name: "Ibuprofen",
      uses: "Pain relief, inflammation reduction",
      dosage: "200-400mg tablets",
      sideEffects: "Stomach upset, headache"
    },
    amoxicillin: {
      name: "Amoxicillin",
      uses: "Antibiotic for infections",
      dosage: "500mg tablets",
      sideEffects: "Allergic reactions, stomach issues"
    }
  };

  let found = false;
  for (let key in medicines) {
    if (key.includes(input)) {
      const med = medicines[key];
      resultDiv.innerHTML = `
        <strong>${med.name}</strong>
        <p><strong>Uses:</strong> ${med.uses}</p>
        <p><strong>Dosage:</strong> ${med.dosage}</p>
        <p><strong>Side Effects:</strong> ${med.sideEffects}</p>
      `;
      resultDiv.style.display = "block";
      found = true;
      break;
    }
  }

  if (!found) {
    resultDiv.innerHTML = '<p style="color: #999;">Medicine not found in database</p>';
    resultDiv.style.display = "block";
  }
};

// Chat functionality
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("You", message);
  chatInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      appendMessage("AI Doctor", data.reply);
    } else {
      appendMessage("System", "Unable to reach AI service. Please consult a doctor.");
    }
  } catch (error) {
    // Fallback responses for offline mode
    const aiResponses = {
      fever: "Fever can indicate infection. Stay hydrated, rest, and take paracetamol. If it persists beyond 3 days, consult a doctor.",
      cough: "A cough might be due to cold, flu, or respiratory issues. Try warm liquids and rest. Seek medical help if it lasts more than 2 weeks.",
      headache: "For headaches, try rest, hydration, and over-the-counter pain relief. If severe or persistent, consult a doctor.",
      cold: "Common cold symptoms: rest, fluids, vitamin C. Most resolve in 7-10 days.",
      flu: "Flu can be serious. Rest, hydration, and antiviral medication may help. Get medical advice.",
      default: "I'm an AI health assistant. For serious concerns, please consult a doctor immediately. Tell me your symptoms for general guidance."
    };

    let response = aiResponses.default;
    for (let key in aiResponses) {
      if (message.toLowerCase().includes(key)) {
        response = aiResponses[key];
        break;
      }
    }
    appendMessage("AI Doctor", response);
  }
}

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  const className = sender === "You" ? "user-msg" : "ai-msg";
  msgDiv.className = `message ${className}`;
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
          tension: 0.4
        }, {
          label: "Diastolic",
          data: [80, 82, 78, 81, 79, 80, 78],
          borderColor: "#14b8a6",
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: false } }
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
          label: "Health Score",
          data: [82, 85],
          backgroundColor: "#0f766e"
        }]
      },
      options: {
        responsive: true,
        scales: { y: { max: 100 } }
      }
    });
  }
}