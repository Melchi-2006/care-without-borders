import { auth, db } from "./firebase.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

// Protect page
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

// Load appointments
async function loadAppointments() {
  const querySnapshot = await getDocs(collection(db, "appointments"));
  const container = document.getElementById("appointmentsList");
  container.innerHTML = "";

  if (querySnapshot.empty) {
    container.innerHTML = "<p>No appointments yet.</p>";
    return;
  }

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    container.innerHTML += `
      <div style="border:1px solid #ddd;padding:10px;margin-bottom:5px;">
        <strong>Patient:</strong> ${data.patientName || "Unknown"} <br>
        <strong>Date:</strong> ${data.date} <br>
        <strong>Status:</strong> ${data.status}
      </div>
    `;
  });
}

loadAppointments();

// Jitsi Video
window.startCall = function () {
  const roomName = document.getElementById("roomName").value;

  const domain = "meet.jit.si";
  const options = {
    roomName: roomName,
    width: "100%",
    height: 400,
    parentNode: document.querySelector("#jitsiContainer")
  };

  new JitsiMeetExternalAPI(domain, options);
};

// Save EHR
document.getElementById("saveEhrBtn").addEventListener("click", async () => {
  const patientId = document.getElementById("patientId").value;
  const diagnosis = document.getElementById("diagnosis").value;
  const prescription = document.getElementById("prescription").value;

  await addDoc(collection(db, "ehr"), {
    patientId,
    diagnosis,
    prescription,
    date: new Date().toLocaleDateString()
  });

  alert("EHR Saved!");
});