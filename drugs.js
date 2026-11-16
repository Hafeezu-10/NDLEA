/**
 * drugs.js
 * Drug Registration, QR Code Generation, and Record Management (admin.html)
 */

/**
 * Generates a QR code inside a target element.
 * Encodes a URL to verify.html?code=... when hosted over http(s), or the code itself.
 */
function renderQrCodeToElement(containerId, authCode, size = 150) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";

  if (typeof QRCode === "undefined") {
    el.textContent = authCode;
    return;
  }

  let qrPayload = authCode;
  try {
    if (window.location.protocol.startsWith("http")) {
      const base = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
      qrPayload = `${base}verify.html?code=${encodeURIComponent(authCode)}&source=qr`;
    }
  } catch {
    qrPayload = authCode;
  }

  new QRCode(el, {
    text: qrPayload,
    width: size,
    height: size,
    colorDark: "#063b25",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

function downloadQrFromContainer(containerId, filename) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const canvas = container.querySelector("canvas");
  const img = container.querySelector("img");

  let dataUrl = "";
  if (canvas) {
    dataUrl = canvas.toDataURL("image/png");
  } else if (img && img.src) {
    dataUrl = img.src;
  }

  if (!dataUrl) {
    showToast("QR code image is not ready yet.", "warning");
    return;
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function renderDrugsTable() {
  const tbody = document.getElementById("drugs-table-body");
  if (!tbody) return;

  const searchTerm = (document.getElementById("drugs-search-input")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("drugs-status-filter")?.value || "ALL";

  const drugs = getDrugs().filter((drug) => {
    const matchesSearch =
      !searchTerm ||
      (drug.drugName || "").toLowerCase().includes(searchTerm) ||
      (drug.genericName || "").toLowerCase().includes(searchTerm) ||
      (drug.manufacturer || "").toLowerCase().includes(searchTerm) ||
      (drug.batchNumber || "").toLowerCase().includes(searchTerm) ||
      (drug.authCode || "").toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || drug.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (drugs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No drug records match your current search or filter.
        </td>
      </tr>
    `;
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];

  tbody.innerHTML = drugs
    .map((drug) => {
      const isExpired = drug.expiryDate && drug.expiryDate < todayStr;
      let statusBadge = `<span class="badge badge-success">Active</span>`;
      if (drug.status === "Suspended") {
        statusBadge = `<span class="badge badge-danger">Suspended</span>`;
      } else if (isExpired) {
        statusBadge = `<span class="badge badge-warning">Expired</span>`;
      }

      const toggleIcon = drug.status === "Suspended" ? "fa-circle-check" : "fa-ban";
      const toggleTitle = drug.status === "Suspended" ? "Reactivate Record" : "Suspend Record";

      return `
        <tr>
          <td>
            <strong>${escapeHtml(drug.drugName)}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(drug.genericName)}</div>
          </td>
          <td>${escapeHtml(drug.manufacturer)}</td>
          <td>${escapeHtml(drug.batchNumber)}</td>
          <td><code style="font-size: 0.82rem; font-weight: 600;">${escapeHtml(drug.authCode)}</code></td>
          <td>${escapeHtml(formatDate(drug.expiryDate))}</td>
          <td>${statusBadge}</td>
          <td>${escapeHtml(drug.verificationCount || 0)}</td>
          <td>
            <div class="action-btns">
              <button type="button" class="icon-btn" title="View QR Code" onclick="openQrModal('${escapeHtml(drug.id)}')">
                <i class="fa-solid fa-qrcode"></i>
              </button>
              <button type="button" class="icon-btn" title="Edit Drug" onclick="openEditDrugModal('${escapeHtml(drug.id)}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" class="icon-btn warning" title="${toggleTitle}" onclick="toggleDrugStatus('${escapeHtml(drug.id)}')">
                <i class="fa-solid ${toggleIcon}"></i>
              </button>
              <button type="button" class="icon-btn danger" title="Delete Record" onclick="confirmDeleteDrug('${escapeHtml(drug.id)}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

window.openQrModal = function (drugId) {
  const drug = getDrugs().find((d) => d.id === drugId);
  if (!drug) return;

  const modal = document.getElementById("qr-view-modal");
  const titleEl = document.getElementById("qr-modal-drug-name");
  const codeEl = document.getElementById("qr-modal-code");
  const downloadBtn = document.getElementById("qr-modal-download-btn");

  if (titleEl) titleEl.textContent = drug.drugName;
  if (codeEl) codeEl.textContent = drug.authCode;
  renderQrCodeToElement("qr-modal-canvas", drug.authCode, 180);

  if (downloadBtn) {
    downloadBtn.onclick = () =>
      downloadQrFromContainer("qr-modal-canvas", `${drug.authCode}.png`);
  }

  if (modal) modal.classList.add("open");
};

window.openEditDrugModal = function (drugId) {
  const drug = getDrugs().find((d) => d.id === drugId);
  if (!drug) return;

  document.getElementById("edit-drug-id").value = drug.id;
  document.getElementById("edit-drug-name").value = drug.drugName;
  document.getElementById("edit-generic-name").value = drug.genericName;
  document.getElementById("edit-manufacturer").value = drug.manufacturer;
  document.getElementById("edit-batch-number").value = drug.batchNumber;
  document.getElementById("edit-category").value = drug.category;
  document.getElementById("edit-mfg-date").value = drug.manufactureDate;
  document.getElementById("edit-exp-date").value = drug.expiryDate;
  document.getElementById("edit-reg-ref").value = drug.registrationRef;
  document.getElementById("edit-auth-code").value = drug.authCode;

  document.getElementById("edit-drug-modal").classList.add("open");
};

window.toggleDrugStatus = function (drugId) {
  const drugs = getDrugs();
  const idx = drugs.findIndex((d) => d.id === drugId);
  if (idx === -1) return;

  const current = drugs[idx].status;
  drugs[idx].status = current === "Suspended" ? "Active" : "Suspended";
  saveDrugs(drugs);
  renderDrugsTable();
  if (typeof refreshDashboardStats === "function") refreshDashboardStats();
  showToast(`Record status updated to ${drugs[idx].status}.`, "success");
};

window.confirmDeleteDrug = function (drugId) {
  const drug = getDrugs().find((d) => d.id === drugId);
  if (!drug) return;

  showConfirmModal(
    "Delete Drug Record",
    `Are you sure you want to permanently delete "${drug.drugName}" (${drug.authCode})?`,
    () => {
      const updated = getDrugs().filter((d) => d.id !== drugId);
      saveDrugs(updated);
      renderDrugsTable();
      if (typeof refreshDashboardStats === "function") refreshDashboardStats();
      showToast("Drug record deleted.", "success");
    }
  );
};

function initDrugModule() {
  const regForm = document.getElementById("register-drug-form");
  const authCodeInput = document.getElementById("reg-auth-code");
  const genCodeBtn = document.getElementById("generate-code-btn");
  const downloadRegQrBtn = document.getElementById("download-reg-qr-btn");
  const regQrPreview = document.getElementById("reg-qr-preview-box");

  const updateRegQrPreview = () => {
    const code = (authCodeInput?.value || "").trim().toUpperCase();
    if (code && regQrPreview) {
      regQrPreview.style.display = "block";
      renderQrCodeToElement("reg-qr-canvas", code, 140);
      const label = document.getElementById("reg-qr-code-label");
      if (label) label.textContent = code;
    } else if (regQrPreview) {
      regQrPreview.style.display = "none";
    }
  };

  if (genCodeBtn && authCodeInput) {
    genCodeBtn.addEventListener("click", () => {
      let code = generateAuthCode();
      const existing = getDrugs();
      while (existing.some((d) => d.authCode.toUpperCase() === code.toUpperCase())) {
        code = generateAuthCode();
      }
      authCodeInput.value = code;
      updateRegQrPreview();
    });
  }

  if (authCodeInput) {
    authCodeInput.addEventListener("input", updateRegQrPreview);
  }

  if (downloadRegQrBtn) {
    downloadRegQrBtn.addEventListener("click", () => {
      const code = (authCodeInput?.value || "drug-qr").trim().toUpperCase();
      downloadQrFromContainer("reg-qr-canvas", `${code}.png`);
    });
  }

  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const drugName = document.getElementById("reg-drug-name").value.trim();
      const genericName = document.getElementById("reg-generic-name").value.trim();
      const manufacturer = document.getElementById("reg-manufacturer").value.trim();
      const batchNumber = document.getElementById("reg-batch-number").value.trim();
      const category = document.getElementById("reg-category").value.trim();
      const manufactureDate = document.getElementById("reg-mfg-date").value;
      const expiryDate = document.getElementById("reg-exp-date").value;
      const registrationRef = document.getElementById("reg-ref-number").value.trim();
      let authCode = (authCodeInput.value || "").trim().toUpperCase();

      if (!drugName || !genericName || !manufacturer || !batchNumber || !category || !manufactureDate || !expiryDate || !registrationRef) {
        showToast("Please complete all required drug registration fields.", "warning");
        return;
      }

      if (expiryDate <= manufactureDate) {
        showToast("Expiry date must be later than manufacturing date.", "error");
        return;
      }

      if (!authCode) {
        authCode = generateAuthCode();
        authCodeInput.value = authCode;
      }

      const drugs = getDrugs();
      const duplicate = drugs.some(
        (d) => (d.authCode || "").toUpperCase() === authCode.toUpperCase()
      );
      if (duplicate) {
        showToast("Duplicate authentication code! Please generate or enter a unique code.", "error");
        return;
      }

      const newDrug = {
        id: "DRG-" + Date.now().toString().slice(-6),
        drugName,
        genericName,
        manufacturer,
        batchNumber,
        category,
        manufactureDate,
        expiryDate,
        registrationRef,
        authCode,
        status: "Active",
        verificationCount: 0,
        createdAt: new Date().toISOString()
      };

      drugs.unshift(newDrug);
      saveDrugs(drugs);

      updateRegQrPreview();
      renderDrugsTable();
      if (typeof refreshDashboardStats === "function") refreshDashboardStats();

      showToast(`Drug "${drugName}" registered with code ${authCode}.`, "success");
      regForm.reset();
      if (regQrPreview) regQrPreview.style.display = "none";
    });
  }

  // Edit Drug Form
  const editForm = document.getElementById("edit-drug-form");
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-drug-id").value;
      const drugName = document.getElementById("edit-drug-name").value.trim();
      const genericName = document.getElementById("edit-generic-name").value.trim();
      const manufacturer = document.getElementById("edit-manufacturer").value.trim();
      const batchNumber = document.getElementById("edit-batch-number").value.trim();
      const category = document.getElementById("edit-category").value.trim();
      const manufactureDate = document.getElementById("edit-mfg-date").value;
      const expiryDate = document.getElementById("edit-exp-date").value;
      const registrationRef = document.getElementById("edit-reg-ref").value.trim();
      const authCode = document.getElementById("edit-auth-code").value.trim().toUpperCase();

      if (expiryDate <= manufactureDate) {
        showToast("Expiry date must be later than manufacturing date.", "error");
        return;
      }

      const drugs = getDrugs();
      const duplicate = drugs.some(
        (d) => d.id !== id && (d.authCode || "").toUpperCase() === authCode
      );
      if (duplicate) {
        showToast("Another drug already uses this authentication code.", "error");
        return;
      }

      const idx = drugs.findIndex((d) => d.id === id);
      if (idx === -1) return;

      drugs[idx] = {
        ...drugs[idx],
        drugName,
        genericName,
        manufacturer,
        batchNumber,
        category,
        manufactureDate,
        expiryDate,
        registrationRef,
        authCode
      };

      saveDrugs(drugs);
      document.getElementById("edit-drug-modal").classList.remove("open");
      renderDrugsTable();
      if (typeof refreshDashboardStats === "function") refreshDashboardStats();
      showToast("Drug record updated successfully.", "success");
    });
  }

  // Search & Filter listeners
  document.getElementById("drugs-search-input")?.addEventListener("input", renderDrugsTable);
  document.getElementById("drugs-status-filter")?.addEventListener("change", renderDrugsTable);

  renderDrugsTable();
}

