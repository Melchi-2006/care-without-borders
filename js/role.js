import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// Add Doctor (Admin only)
const addDoctorBtn = document.getElementById("addDoctorBtn");

if (addDoctorBtn) {
  addDoctorBtn.addEventListener("click", async () => {
    const name = document.getElementById("docName").value;
    const email = document.getElementById("docEmail").value;
    const password = document.getElementById("docPassword").value;

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      name: name,
      email: email,
      role: "doctor"
    });

    alert("Doctor Added Successfully");
  });
}