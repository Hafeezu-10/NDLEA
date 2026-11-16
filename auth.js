/**
 * auth.js
 * Academic prototype administrator authentication and session management (localStorage).
 * NOTE: Client-side authentication is for academic demonstration only, not production security.
 */

const DEMO_ADMINS = [
  {
    username: "AUWAL ADAMU",
    password: "AUWAL2026",
    fullName: "AUWAL ADAMU (Administrator)",
    role: "Administrator"
  },
  {
    username: "officer",
    password: "Ndlea@2026",
    fullName: "Hadejia Verification Officer",
    role: "Verification Officer"
  }
];

function getAdminSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isAdminAuthenticated() {
  const session = getAdminSession();
  return Boolean(session && session.username && session.loggedInAt);
}

function requireAdminAuth() {
  if (!isAdminAuthenticated()) {
    window.location.replace("login.html");
    return false;
  }
  return true;
}

function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("admin-login-form");
  const passwordInput = document.getElementById("login-password");
  const toggleBtn = document.getElementById("toggle-password-btn");
  const errorBox = document.getElementById("login-error");

  // If already logged in on login.html, redirect to admin.html
  if (loginForm && isAdminAuthenticated()) {
    window.location.replace("admin.html");
    return;
  }

  // Password visibility toggle
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
      }
      toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    });
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = "none";

      const username = (document.getElementById("login-username").value || "").trim();
      const password = passwordInput ? passwordInput.value : "";

      if (!username || !password) {
        if (errorBox) {
          errorBox.querySelector("span").textContent = "Please enter both username and password.";
          errorBox.style.display = "flex";
        }
        return;
      }

      const matched = DEMO_ADMINS.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (!matched) {
        if (errorBox) {
          errorBox.querySelector("span").textContent = "Invalid username or password.";
          errorBox.style.display = "flex";
        }
        return;
      }

      const session = {
        username: matched.username,
        fullName: matched.fullName,
        role: matched.role,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      showToast("Login successful. Redirecting to dashboard...", "success");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 450);
    });
  }
});

