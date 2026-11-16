/**
 * main.js
 * Shared UI helpers: navigation toggle, toast notifications, confirmation dialogs, and homepage interactions.
 */

/**
 * Displays a temporary toast notification.
 * @param {string} message
 * @param {"success"|"error"|"warning"|"info"} type
 */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const iconMap = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info"
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : type === "warning" ? "toast-warning" : ""}`;

  const icon = document.createElement("i");
  icon.className = `fa-solid ${iconMap[type] || iconMap.info}`;

  const text = document.createElement("span");
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 260);
  }, 3400);
}

/**
 * Shows a reusable confirmation modal dialog.
 * @param {string} title
 * @param {string} message
 * @param {Function} onConfirm
 */
function showConfirmModal(title, message, onConfirm) {
  let backdrop = document.getElementById("global-confirm-modal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "global-confirm-modal";
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <div class="modal-header">
          <h3 id="confirm-modal-title"></h3>
          <button type="button" class="modal-close" id="confirm-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <p id="confirm-modal-message" style="color: var(--text-main); font-size: 0.95rem;"></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="confirm-modal-cancel">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirm-modal-ok">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  }

  document.getElementById("confirm-modal-title").textContent = title;
  document.getElementById("confirm-modal-message").textContent = message;

  const close = () => backdrop.classList.remove("open");

  const okBtn = document.getElementById("confirm-modal-ok");
  const cancelBtn = document.getElementById("confirm-modal-cancel");
  const closeBtn = document.getElementById("confirm-modal-close");

  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);

  newOkBtn.addEventListener("click", () => {
    close();
    if (typeof onConfirm === "function") onConfirm();
  });

  cancelBtn.onclick = close;
  closeBtn.onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };

  backdrop.classList.add("open");
}

function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

/**
 * Extracts a drug code whether the scanned/entered value is a raw code or a verify.html?code=... URL.
 */
function extractAuthCode(rawValue) {
  const trimmed = (rawValue || "").trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("code=")) {
      const url = new URL(trimmed, window.location.origin);
      const param = url.searchParams.get("code");
      if (param) return param.trim().toUpperCase();
    }
  } catch {
    // Fallback to raw trimmed string
  }
  return trimmed.toUpperCase();
}

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  // Hero Quick Verification Form (on index.html)
  const heroVerifyForm = document.getElementById("hero-verify-form");
  if (heroVerifyForm) {
    heroVerifyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("hero-auth-code");
      const code = extractAuthCode(input ? input.value : "");
      if (!code) {
        showToast("Please enter a drug authentication code.", "warning");
        return;
      }
      window.location.href = `verify.html?code=${encodeURIComponent(code)}`;
    });
  }

  // Sample code chips (on index.html and verify.html)
  document.querySelectorAll("[data-sample-code]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const code = chip.getAttribute("data-sample-code");
      const heroInput = document.getElementById("hero-auth-code");
      const verifyInput = document.getElementById("verify-code-input");
      if (heroInput) {
        heroInput.value = code;
        heroInput.focus();
      }
      if (verifyInput) {
        verifyInput.value = code;
        if (typeof window.runDrugVerification === "function") {
          window.runDrugVerification(code, "Manual");
        }
      }
    });
  });

  // Update Hero live stats if present on index.html
  const statDrugs = document.getElementById("hero-stat-drugs");
  const statVerifications = document.getElementById("hero-stat-verifications");
  if (statDrugs && typeof getDrugs === "function") {
    statDrugs.textContent = getDrugs().length;
  }
  if (statVerifications && typeof getVerifications === "function") {
    statVerifications.textContent = getVerifications().length;
  }
});

