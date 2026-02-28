import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

// Book appointment
document.getElementById("bookBtn").addEventListener("click", () => {
  alert("Appointment Requested!");
});

// Jitsi Call
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

// Simple chatbot
window.chatBot = function () {
  const input = document.getElementById("chatInput").value.toLowerCase();
  let response = "Please consult a doctor.";

  if (input.includes("fever")) response = "You may have an infection.";
  if (input.includes("cough")) response = "It might be a respiratory issue.";
  if (input.includes("headache")) response = "Ensure hydration and rest.";

  document.getElementById("chatResponse").innerText = response;
};

// Disease Graph
const ctx = document.getElementById("diseaseChart");
new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{
      label: "Flu Cases",
      data: [10, 20, 15, 30, 25],
      borderWidth: 2
    }]
  }
});
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("You", message);
  chatInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (response.ok) {
      appendMessage("AI Doctor", data.reply);
    } else {
      appendMessage("System", "Error: " + data.error);
    }

  } catch (error) {
    appendMessage("System", "Server error.");
  }
}

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}