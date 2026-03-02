function goLogin() {
  window.location.href = "login.html";
}

function goRegister() {
  window.location.href = "register.html";
}

function goadmin() {
  window.location.href = "admin.html";
}

function goDoctorLogin() {
  window.location.href = "doctor-login.html";
}

// SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// COUNTER ANIMATION
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
  counter.innerText = "0";

  const updateCounter = () => {
    const target = +counter.getAttribute("data-target");
    const current = +counter.innerText;

    const increment = target / 100;

    if (current < target) {
      counter.innerText = Math.ceil(current + increment);
      setTimeout(updateCounter, 20);
    } else {
      counter.innerText = target.toLocaleString() + "+";
    }
  };

  updateCounter();
});
// FADE IN ON LOAD
window.addEventListener("load", () => {
  document.body.classList.add("fade-in");
});
// AUTO TESTIMONIAL SLIDER
const testimonials = document.querySelectorAll(".testimonial");
let currentTestimonial = 0;

setInterval(() => {
  testimonials[currentTestimonial].classList.remove("active");
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  testimonials[currentTestimonial].classList.add("active");
}, 4000);
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
// MAGNETIC BUTTON EFFECT
const buttons = document.querySelectorAll(".btn-solid, .btn-outline");

buttons.forEach(btn => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translate(0, 0)";
  });
});
// 🔥 FIREBASE CONFIG (REPLACE WITH YOURS)
const firebaseConfig = {
  apiKey: "AIzaSyBMHhwzdjBEr9GaMNnhxugg0K71WrPN0n4",
  authDomain: "care-without-borders-789dd.firebaseapp.com",
  projectId: "care-without-borders-789dd",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// PASSWORD SHOW / HIDE
const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (toggle && passwordInput) {
  toggle.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });
}

// FORM VALIDATION + LOGIN
const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!email.value.includes("@")) {
      email.classList.add("invalid");
      return;
    }

    if (password.value.length < 6) {
      password.classList.add("invalid");
      return;
    }

    auth.signInWithEmailAndPassword(email.value, password.value)
      .then(() => {
        alert("Login Successful!");
        window.location.href = "dashboard.html";
      })
      .catch(error => alert(error.message));
  });
}

// GOOGLE LOGIN
const googleLoginBtn = document.getElementById("googleLogin");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
      .then(() => {
        window.location.href = "dashboard.html";
      })
      .catch(error => alert(error.message));
  });
}