(function () {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      color-scheme: light;
    }

    body[data-theme='dark'] {
      color-scheme: dark;
      --surface: #111827;
      --bg: #0b1220;
      --bg-secondary: #172033;
      --bg-tertiary: #243047;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --border: rgba(148, 163, 184, 0.2);
      --border-color: rgba(148, 163, 184, 0.2);
      --card-bg: #111827;
      --dark-bg: #0b1220;
      --text-white: #f8fafc;
      --text-light: #cbd5e1;
      --primary-dark: #0f766e;
      --primary-light: #ccfbf1;
    }

    body[data-theme='dark'], body.dark {
      background-color: #0b1220 !important;
      color: #f8fafc;
    }

    body[data-theme='dark'] .card,
    body[data-theme='dark'] .record-card,
    body[data-theme='dark'] .upload-section,
    body[data-theme='dark'] .modal-content,
    body[data-theme='dark'] .panel,
    body[data-theme='dark'] .container-card,
    body.dark .card,
    body.dark .record-card,
    body.dark .upload-section {
      background-color: #111827 !important;
      color: #f8fafc;
      border-color: rgba(148, 163, 184, 0.2);
    }

    body[data-theme='dark'] input,
    body[data-theme='dark'] select,
    body[data-theme='dark'] textarea,
    body.dark input,
    body.dark select,
    body.dark textarea {
      background-color: #0f172a !important;
      color: #f8fafc !important;
      border-color: rgba(148, 163, 184, 0.3) !important;
    }

    body[data-theme='dark'] .navbar,
    body[data-theme='dark'] header,
    body[data-theme='dark'] nav,
    body.dark .navbar,
    body.dark header,
    body.dark nav {
      background-color: rgba(15, 23, 42, 0.96) !important;
      color: #f8fafc;
      border-color: rgba(148, 163, 184, 0.2) !important;
    }

    body[data-theme='dark'] .stats,
    body[data-theme='dark'] .features,
    body[data-theme='dark'] .how,
    body[data-theme='dark'] .testimonials,
    body[data-theme='dark'] .hero,
    body.dark .stats,
    body.dark .features,
    body.dark .how,
    body.dark .testimonials,
    body.dark .hero {
      background: #0b1220 !important;
      color: #f8fafc;
    }

    body[data-theme='dark'] .record-info h4,
    body[data-theme='dark'] .record-info p,
    body[data-theme='dark'] p,
    body[data-theme='dark'] label,
    body.dark .record-info h4,
    body.dark .record-info p,
    body.dark p,
    body.dark label {
      color: #cbd5e1;
    }

    .theme-global-toggle {
      position: fixed;
      top: 16px;
      right: 18px;
      z-index: 2000;
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 999px;
      background: var(--surface, #ffffff);
      color: var(--text-primary, #09090b);
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.16);
      cursor: pointer;
      font-size: 18px;
      transition: transform 150ms ease, background 250ms ease, color 250ms ease;
    }

    .theme-global-toggle:hover {
      transform: translateY(-1px);
    }

    @media (max-width: 600px) {
      .theme-global-toggle { top: 12px; right: 12px; }
    }
  `;
  document.head.appendChild(style);

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.body.dataset.theme = isDark ? 'dark' : 'light';
    document.body.classList.toggle('dark', isDark);
    const toggle = document.getElementById('themeToggle') || document.querySelector('.theme-global-toggle');
    if (toggle) {
      toggle.textContent = isDark ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    localStorage.setItem('careTheme', isDark ? 'dark' : 'light');
  };

  const savedTheme = localStorage.getItem('careTheme');
  const preferredTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const initialTheme = savedTheme || preferredTheme;

  const setup = () => {
    let toggle = document.getElementById('themeToggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'theme-global-toggle';
      toggle.id = 'themeToggle';
      toggle.setAttribute('aria-label', 'Toggle light and dark mode');
      document.body.appendChild(toggle);
    }

    applyTheme(initialTheme);
    if (!toggle.dataset.themeBound) {
      toggle.addEventListener('click', () => {
        applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
      });
      toggle.dataset.themeBound = 'true';
    }
  };

  if (document.body) setup();
  else document.addEventListener('DOMContentLoaded', setup, { once: true });
})();
