function goLogin() {
  window.location.href = "login.html";
}

function goRegister() {
  window.location.href = "register.html";
}

function goadmin() {
  console.log("Admin button clicked - navigating to admin.html");
  const targetUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/admin.html';
  console.log("Target URL:", targetUrl);
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

if (reveals.length > 0) {
  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
}

// COUNTER ANIMATION
const counters = document.querySelectorAll(".counter");

if (counters.length > 0) {
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
}
// FADE IN ON LOAD
window.addEventListener("load", () => {
  document.body.classList.add("fade-in");
});
// AUTO TESTIMONIAL SLIDER
const testimonials = document.querySelectorAll(".testimonial");
let currentTestimonial = 0;

if (testimonials.length > 0) {
  setInterval(() => {
    if (testimonials[currentTestimonial]) {
      testimonials[currentTestimonial].classList.remove("active");
    }
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    if (testimonials[currentTestimonial]) {
      testimonials[currentTestimonial].classList.add("active");
    }
  }, 4000);
}
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
// MAGNETIC BUTTON EFFECT
const buttons = document.querySelectorAll(".btn-solid, .btn-outline");

if (buttons.length > 0) {
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
}

// Note: Firebase is initialized on individual pages (index.html, login.html, admin.html, etc.)
// Not globally here to avoid conflicts

// PASSWORD SHOW / HIDE - Only runs if elements exist
const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (toggle && passwordInput) {
  toggle.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });
}

// FORM VALIDATION + LOGIN - Only runs if form exists
const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (email && password) {
      if (!email.value.includes("@")) {
        email.classList.add("invalid");
        return;
      }

      if (password.value.length < 6) {
        password.classList.add("invalid");
        return;
      }

      // Firebase auth will be handled by login.html's own script
      alert("Use the modular Firebase setup on login.html");
    }
  });
}