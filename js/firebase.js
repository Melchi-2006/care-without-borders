// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBMHhwzdjBEr9GaMNnhxugg0K71WrPN0n4",
  authDomain: "care-without-borders-789dd.firebaseapp.com",
  projectId: "care-without-borders-789dd",
  storageBucket: "care-without-borders-789dd.firebasestorage.app",
  messagingSenderId: "736136702535",
  appId: "1:736136702535:web:c862ef87108bd027bb9f62",
  measurementId: "G-9PLWT8WHC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);