/**
 * verification.js
 * Drug Authentication & QR Scanning Module (verify.html)
 */

let html5QrInstance = null;
let isScannerRunning = false;

/**
 * Verifies a drug authentication code against localStorage records and logs the attempt.
 * @param {string} rawInput
 * @param {"Manual"|"QR Scan"} method
 */
function runDrugVerification(rawInput, method = "Manual") {
  const code = extractAuthCode(rawInput);
  const resultContainer = document.getElementById("verification-result-container");
  if (!resultContainer) return;

  if (!code) {
    showToast("Please enter a valid authentication code.", "warning");
    return;
  }

  const drugs = getDrugs();
  const drugIndex = drugs.findIndex(
    (d) => (d.authCode || "").toUpperCase() === code.toUpperCase()
  );

  let statusKey = "invalid";
  let resultLabel = "Invalid";
  let bannerTitle = "Authentication Code Not Found";
  let bannerSubtitle = "No matching record exists in the system database.";
  let bannerIcon = "fa-circle-xmark";
  let matchedDrug = null;

  if (drugIndex !== -1) {
    matchedDrug = drugs[drugIndex];
    const todayStr = new Date().toISOString().split("T")[0];
    const isExpired = matchedDrug.expiryDate && matchedDrug.expiryDate < todayStr;

    if (matchedDrug.status === "Suspended") {
      statusKey = "suspended";
      resultLabel = "Suspended";
      bannerTitle = "Suspended Drug Record";
      bannerSubtitle = "This drug record has been suspended by the administrator.";
      bannerIcon = "fa-ban";
    } else if (isExpired) {
      statusKey = "expired";
      resultLabel = "Expired";
      bannerTitle = "Expired Product Record";
      bannerSubtitle = `This product record expired on ${formatDate(matchedDrug.expiryDate)}.`;
      bannerIcon = "fa-calendar-xmark";
    } else if ((matchedDrug.verificationCount || 0) >= 1) {
      statusKey = "used";
      resultLabel = "Previously Used";
      bannerTitle = "Previously Verified Code";
      bannerSubtitle = `Record found, but this code has already been verified ${matchedDrug.verificationCount} time(s).`;
      bannerIcon = "fa-triangle-exclamation";
    } else {
      statusKey = "valid";
      resultLabel = "Valid";
      bannerTitle = "Record Verified in Database";
      bannerSubtitle = "Matching active drug record found.";
      bannerIcon = "fa-circle-check";
    }

    // Increment verification count for matched record
    drugs[drugIndex].verificationCount = (matchedDrug.verificationCount || 0) + 1;
    saveDrugs(drugs);
  }

  // Save verification attempt to history
  const verifications = getVerifications();
  verifications.unshift({
    id: "VER-" + Date.now().toString().slice(-6),
    authCode: code,
    drugName: matchedDrug ? matchedDrug.drugName : "Unknown / Unregistered",
    result: resultLabel,
    method: method,
    timestamp: new Date().toISOString()
  });
  saveVerifications(verifications);

  renderVerificationResult(resultContainer, {
    statusKey,
    resultLabel,
    bannerTitle,
    bannerSubtitle,
    bannerIcon,
    code,
    drug: matchedDrug
  });
}

function renderVerificationResult(container, info) {
  const { statusKey, bannerTitle, bannerSubtitle, bannerIcon, code, drug } = info;

  let detailsHtml = "";
  if (drug) {
    detailsHtml = `
      <div class="detail-grid">
        <div class="detail-item">
          <span>Authentication Code</span>
          <strong style="font-family: monospace;">${escapeHtml(drug.authCode)}</strong>
        </div>
        <div class="detail-item">
          <span>Drug Name</span>
          <strong>${escapeHtml(drug.drugName)}</strong>
        </div>
        <div class="detail-item">
          <span>Generic Name</span>
          <strong>${escapeHtml(drug.genericName || "N/A")}</strong>
        </div>
        <div class="detail-item">
          <span>Manufacturer</span>
          <strong>${escapeHtml(drug.manufacturer)}</strong>
        </div>
        <div class="detail-item">
          <span>Batch Number</span>
          <strong>${escapeHtml(drug.batchNumber)}</strong>
        </div>
        <div class="detail-item">
          <span>Drug Category</span>
          <strong>${escapeHtml(drug.category || "N/A")}</strong>
        </div>
        <div class="detail-item">
          <span>Manufacturing Date</span>
          <strong>${escapeHtml(formatDate(drug.manufactureDate))}</strong>
        </div>
        <div class="detail-item">
          <span>Expiry Date</span>
          <strong>${escapeHtml(formatDate(drug.expiryDate))}</strong>
        </div>
        <div class="detail-item">
          <span>Registration Reference</span>
          <strong>${escapeHtml(drug.registrationRef)}</strong>
        </div>
        <div class="detail-item">
          <span>Record Status</span>
          <strong>${escapeHtml(drug.status)} (Checks: ${escapeHtml(drug.verificationCount)})</strong>
        </div>
      </div>
    `;
  } else {
    detailsHtml = `
      <div class="detail-grid">
        <div class="detail-item">
          <span>Submitted Code</span>
          <strong style="font-family: monospace;">${escapeHtml(code)}</strong>
        </div>
        <div class="detail-item">
          <span>Verification Result</span>
          <strong>Not Found in System Database</strong>
        </div>
      </div>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
        The submitted code does not match any registered drug record. If you suspect a counterfeit product, you may log a suspicious drug report.
      </p>
      <a href="report.html?drug=${encodeURIComponent(code)}" class="btn btn-danger btn-sm">
        <i class="fa-solid fa-flag"></i> Report Suspicious Product
      </a>
    `;
  }

  container.innerHTML = `
    <div class="result-card">
      <div class="result-banner status-${escapeHtml(statusKey)}">
        <div class="result-banner-icon">
          <i class="fa-solid ${escapeHtml(bannerIcon)}"></i>
        </div>
        <div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.15rem;">${escapeHtml(bannerTitle)}</h3>
          <p style="font-size: 0.86rem; opacity: 0.92; margin: 0;">${escapeHtml(bannerSubtitle)}</p>
        </div>
      </div>
      <div class="result-body">
        ${detailsHtml}
        <div class="alert alert-info" style="margin-top: 1rem; margin-bottom: 0;">
          <i class="fa-solid fa-circle-info"></i>
          <div>
            <strong>Verification Notice:</strong> A matching record confirms that this product identifier exists in the system registry. It does not replace laboratory chemical analysis of the medicine.
          </div>
        </div>
      </div>
    </div>
  `;
}

async function startQrCameraScanner() {
  const readerEl = document.getElementById("qr-reader");
  const startBtn = document.getElementById("start-qr-btn");
  const stopBtn = document.getElementById("stop-qr-btn");
  const statusEl = document.getElementById("qr-scanner-status");

  if (!readerEl || typeof Html5Qrcode === "undefined") {
    if (statusEl) {
      statusEl.textContent = "QR scanner library could not be loaded. Please use manual code entry.";
    }
    return;
  }

  if (isScannerRunning) return;

  try {
    if (!html5QrInstance) {
      html5QrInstance = new Html5Qrcode("qr-reader");
    }
    if (statusEl) statusEl.textContent = "Requesting camera access...";

    await html5QrInstance.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        const extracted = extractAuthCode(decodedText);
        const input = document.getElementById("verify-code-input");
        if (input) input.value = extracted;
        stopQrCameraScanner();
        showToast("QR code scanned successfully!", "success");
        runDrugVerification(extracted, "QR Scan");
      },
      () => {
        // Ignore frame-by-frame scan misses
      }
    );

    isScannerRunning = true;
    if (startBtn) startBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";
    if (statusEl) statusEl.textContent = "Camera active. Point at a drug QR code.";
  } catch (err) {
    isScannerRunning = false;
    if (statusEl) {
      statusEl.textContent =
        "Camera access denied or unavailable. Please use manual code entry or upload a QR image below.";
    }
    showToast("Camera unavailable. Use manual entry or QR image upload.", "warning");
  }
}

async function stopQrCameraScanner() {
  const startBtn = document.getElementById("start-qr-btn");
  const stopBtn = document.getElementById("stop-qr-btn");
  const statusEl = document.getElementById("qr-scanner-status");

  if (html5QrInstance && isScannerRunning) {
    try {
      await html5QrInstance.stop();
    } catch {
      // Ignore stop errors
    }
  }
  isScannerRunning = false;
  if (startBtn) startBtn.style.display = "inline-flex";
  if (stopBtn) stopBtn.style.display = "none";
  if (statusEl) statusEl.textContent = "Camera scanner stopped.";
}

window.runDrugVerification = runDrugVerification;

document.addEventListener("DOMContentLoaded", () => {
  const verifyForm = document.getElementById("verify-form");
  const codeInput = document.getElementById("verify-code-input");
  const startBtn = document.getElementById("start-qr-btn");
  const stopBtn = document.getElementById("stop-qr-btn");
  const qrFileInput = document.getElementById("qr-file-input");

  if (verifyForm && codeInput) {
    verifyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      runDrugVerification(codeInput.value, "Manual");
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", startQrCameraScanner);
  }
  if (stopBtn) {
    stopBtn.addEventListener("click", stopQrCameraScanner);
  }

  // Scan QR from uploaded image file (great fallback if no webcam during defense!)
  if (qrFileInput) {
    qrFileInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (typeof Html5Qrcode === "undefined") {
        showToast("QR library unavailable. Please enter the code manually.", "error");
        return;
      }
      try {
        if (!html5QrInstance) {
          html5QrInstance = new Html5Qrcode("qr-reader");
        }
        const decodedText = await html5QrInstance.scanFile(file, true);
        const extracted = extractAuthCode(decodedText);
        if (codeInput) codeInput.value = extracted;
        showToast("QR image decoded!", "success");
        runDrugVerification(extracted, "QR Scan");
      } catch {
        showToast("Could not detect a valid QR code in that image.", "error");
      } finally {
        qrFileInput.value = "";
      }
    });
  }

  // Auto-run verification if ?code= is present in URL
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get("code");
  if (urlCode && codeInput) {
    const clean = extractAuthCode(urlCode);
    codeInput.value = clean;
    runDrugVerification(clean, params.get("source") === "qr" ? "QR Scan" : "Manual");
  }
});

