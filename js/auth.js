import { auth, db, googleProvider, googleSignIn } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword")?.value || password;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      alert("❌ Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("❌ Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile
      await updateProfile(userCred.user, { displayName: name });

      // Create Firestore record
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: name,
        email: email,
        role: "patient",
        createdAt: new Date()
      });

      alert("✅ Registered Successfully! Please login.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        alert("❌ Email already registered");
      } else if (error.code === 'auth/weak-password') {
        alert("❌ Password is too weak");
      } else {
        alert(`❌ Registration failed: ${error.message}`);
      }
    }
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("❌ Please enter email and password");
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      const docSnap = await getDoc(doc(db, "users", userCred.user.uid));

      if (!docSnap.exists()) {
        // Create user record if doesn't exist
        await setDoc(doc(db, "users", userCred.user.uid), {
          name: userCred.user.displayName || email.split('@')[0],
          email: email,
          role: "patient",
          createdAt: new Date()
        });
      }

      const role = docSnap.exists() ? docSnap.data().role : "patient";

      alert(`✅ Welcome ${userCred.user.displayName || 'Patient'}!`);
      
      if (role === "admin") window.location.href = "admin.html";
      else if (role === "doctor") window.location.href = "doctor.html";
      else window.location.href = "patient.html";
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.code === 'auth/user-not-found') {
        alert("❌ Email not registered");
      } else if (error.code === 'auth/wrong-password') {
        alert("❌ Incorrect password");
      } else {
        alert(`❌ Login failed: ${error.message}`);
      }
    }
  });
}

// Google Login Handler
export async function handleGoogleLogin() {
  try {
    googleProvider.setCustomParameters({ 'prompt': 'select_account' });
    
    const result = await googleSignIn(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Create new patient record
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        role: "patient",
        photoURL: user.photoURL || "",
        loginMethod: "Google",
        createdAt: new Date()
      });
    }

    alert(`✅ Welcome ${user.displayName || 'Patient'}!`);
    window.location.href = "patient.html";
  } catch (error) {
    console.error("Google Login Error:", error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.log("User cancelled Google login");
      return;
    }
    
    alert(`❌ Google Login failed: ${error.message}`);
  }
}

// Export auth state listener
export { onAuthStateChanged, signOut };