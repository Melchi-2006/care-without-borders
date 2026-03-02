import { auth, db } from "./firebase.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Protect page - with fallback for demo/testing
let isAuthenticated = false;
try {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Allow page to display in demo mode
      console.log("Doctor not authenticated - running in demo mode");
      isAuthenticated = false;
    } else {
      isAuthenticated = true;
      loadAppointments();
      loadEHR();
      initCharts();
    }
  });
} catch (error) {
  console.log("Firebase auth error - running in demo mode:", error);
  isAuthenticated = false;
}

// Logout Function
window.logout = async function () {
  try {
    await signOut(auth);
  } catch (error) {
    console.log("Logout error:", error);
  }
  localStorage.removeItem('doctorLoggedIn');
  window.location.href = "login.html";
};

// Show Alert Message
function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === "success" ? "#28a745" : "#ffc107"};
    color: white;
    border-radius: 8px;
    z-index: 9999;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

// Load Appointments
async function loadAppointments() {
  try {
    const list = document.getElementById("appointmentsList");
    if (!list) return; // Element doesn't exist yet
    
    const querySnapshot = await getDocs(collection(db, "appointments"));
    list.innerHTML = "";

    let todayCount = 0;
    let pendingCount = 0;
    const today = new Date().toISOString().split('T')[0];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.date === today) todayCount++;
      if (data.status === "pending") pendingCount++;

      const appointmentDate = new Date(data.date).toLocaleDateString();
      const statusClass = `status-${data.status}`;

      list.innerHTML += `
        <div class="appointment-item">
          <div class="appointment-info">
            <strong>${data.patientName || data.patientEmail}</strong>
            <p>📅 ${appointmentDate} at ${data.time}</p>
            <p>Reason: ${data.reason}</p>
            <span class="status-badge status-${data.status}">${data.status}</span>
          </div>
          <div class="appointment-actions">
            <button class="btn-secondary" onclick="confirmAppointment('${doc.id}')">Confirm</button>
            <button class="btn-secondary" onclick="completeAppointment('${doc.id}')">Complete</button>
            <button class="btn-danger" onclick="cancelAppointment('${doc.id}')">Cancel</button>
          </div>
        </div>
      `;
    });

    if (list.innerHTML === "") {
      list.innerHTML = '<p style="color: #999; text-align: center;">No appointments yet</p>';
    }

    const todayCountEl = document.getElementById("todayAppointments");
    const pendingCountEl = document.getElementById("pendingAppointments");
    if (todayCountEl) todayCountEl.textContent = todayCount;
    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
  } catch (error) {
    console.error("Error loading appointments:", error);
  }
}

// Confirm Appointment
window.confirmAppointment = async function (docId) {
  try {
    await updateDoc(doc(db, "appointments", docId), {
      status: "confirmed"
    });
    showAlert("Appointment confirmed");
    loadAppointments();
  } catch (error) {
    showAlert("Error confirming appointment", "warning");
  }
};

// Complete Appointment
window.completeAppointment = async function (docId) {
  try {
    await updateDoc(doc(db, "appointments", docId), {
      status: "completed"
    });
    showAlert("Appointment marked as completed");
    loadAppointments();
  } catch (error) {
    showAlert("Error completing appointment", "warning");
  }
};

// Cancel Appointment
window.cancelAppointment = async function (docId) {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;
  try {
    await updateDoc(doc(db, "appointments", docId), {
      status: "cancelled"
    });
    showAlert("Appointment cancelled");
    loadAppointments();
  } catch (error) {
    showAlert("Error cancelling appointment", "warning");
  }
};

// Save EHR
window.saveEHR = async function () {
  const patientId = document.getElementById("patientId").value;
  const diagnosis = document.getElementById("diagnosis").value;
  const prescription = document.getElementById("prescription").value;
  const dosage = document.getElementById("dosage").value;
  const followUpDate = document.getElementById("followUpDate").value;

  if (!patientId || !diagnosis || !prescription) {
    showAlert("Please fill required fields", "warning");
    return;
  }

  try {
    await addDoc(collection(db, "ehr"), {
      patientId,
      diagnosis,
      prescription,
      dosage,
      followUpDate,
      doctorId: auth.currentUser.uid,
      doctorEmail: auth.currentUser.email,
      date: new Date().toLocaleDateString()
    });

    showAlert("Patient record saved successfully");
    document.getElementById("ehrForm").reset();
    loadEHR();
  } catch (error) {
    showAlert("Error saving EHR: " + error.message, "warning");
  }
};

// Load EHR Records
async function loadEHR() {
  try {
    const list = document.getElementById("ehrList");
    if (!list) return; // Element doesn't exist yet

    const querySnapshot = await getDocs(collection(db, "ehr"));
    list.innerHTML = "";

    let count = 0;
    querySnapshot.forEach((doc) => {
      count++;
      const data = doc.data();
      list.innerHTML += `
        <div class="record-item">
          <strong>Patient:</strong> ${data.patientId}
          <p><strong>Diagnosis:</strong> ${data.diagnosis}</p>
          <p><strong>Prescription:</strong> ${data.prescription}</p>
          ${data.dosage ? `<p><strong>Dosage:</strong> ${data.dosage}</p>` : ''}
          ${data.followUpDate ? `<p><strong>Follow-up:</strong> ${data.followUpDate}</p>` : ''}
          <p style="color: #999; font-size: 12px;"><strong>Date:</strong> ${data.date}</p>
        </div>
      `;
    });

    if (count === 0) {
      list.innerHTML = '<p style="color: #999; text-align: center;">No patient records yet</p>';
    }

    const totalRecordsEl = document.getElementById("totalRecords");
    const totalPatientsEl = document.getElementById("totalPatients");
    if (totalRecordsEl) totalRecordsEl.textContent = count;
    if (totalPatientsEl) totalPatientsEl.textContent = new Set([...querySnapshot.docs.map(d => d.data().patientId)]).size;
  } catch (error) {
    console.error("Error loading EHR:", error);
  }
}

// Search Patient
window.searchPatient = async function () {
  const searchTerm = document.getElementById("patientSearchInput").value.toLowerCase();
  const resultsDiv = document.getElementById("searchResults");

  if (!searchTerm) {
    resultsDiv.innerHTML = "";
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "ehr"));
    resultsDiv.innerHTML = "";
    let found = false;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.patientId.toLowerCase().includes(searchTerm)) {
        found = true;
        resultsDiv.innerHTML += `
          <div class="record-item">
            <strong>${data.patientId}</strong>
            <p><strong>Diagnosis:</strong> ${data.diagnosis}</p>
            <p><strong>Prescription:</strong> ${data.prescription}</p>
            <p style="color: #999; font-size: 12px;"><strong>Last Update:</strong> ${data.date}</p>
          </div>
        `;
      }
    });

    if (!found) {
      resultsDiv.innerHTML = '<p style="color: #999;">No records found</p>';
    }
  } catch (error) {
    resultsDiv.innerHTML = '<p style="color: red;">Error searching records</p>';
  }
};

// Jitsi Video Call
window.startCall = function () {
  const roomName = document.getElementById("roomName").value || "doctor-" + Date.now();
  
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
  const chartCanvas = document.getElementById("consultationChart");
  if (chartCanvas) {
    new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: ["This Month", "Last Month", "2 Months Ago"],
        datasets: [
          {
            label: "Completed Consultations",
            data: [12, 19, 8],
            backgroundColor: "#0f766e"
          },
          {
            label: "Pending Consultations",
            data: [3, 2, 1],
            backgroundColor: "#14b8a6"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Consultation Analytics" }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}