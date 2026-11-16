/**
 * admin.js
 * Administrator Dashboard Controller (admin.html)
 */

function getVerificationBadge(result) {
  switch (result) {
    case "Valid":
      return `<span class="badge badge-success">Valid</span>`;
    case "Previously Used":
      return `<span class="badge badge-info">Previously Used</span>`;
    case "Suspended":
    case "Expired":
      return `<span class="badge badge-warning">${escapeHtml(result)}</span>`;
    default:
      return `<span class="badge badge-danger">${escapeHtml(result || "Invalid")}</span>`;
  }
}

function refreshDashboardStats() {
  const drugs = getDrugs();
  const verifications = getVerifications();
  const reports = getReports();

  const totalDrugs = drugs.length;
  const totalVerifications = verifications.length;
  const successfulVerifications = verifications.filter(
    (v) => v.result === "Valid" || v.result === "Previously Used"
  ).length;
  const invalidVerifications = verifications.filter((v) => v.result === "Invalid").length;
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "Pending").length;

  const setStat = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setStat("stat-total-drugs", totalDrugs);
  setStat("stat-total-verifications", totalVerifications);
  setStat("stat-successful-verifications", successfulVerifications);
  setStat("stat-invalid-verifications", invalidVerifications);
  setStat("stat-total-reports", totalReports);
  setStat("stat-pending-reports", pendingReports);

  // Recent verifications on Dashboard overview
  const recentVerBody = document.getElementById("dashboard-recent-verifications");
  if (recentVerBody) {
    const recent = verifications.slice(0, 5);
    if (recent.length === 0) {
      recentVerBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1.25rem;">No verification attempts yet.</td></tr>`;
    } else {
      recentVerBody.innerHTML = recent
        .map(
          (v) => `
          <tr>
            <td><code>${escapeHtml(v.authCode)}</code></td>
            <td>${escapeHtml(v.drugName)}</td>
            <td>${escapeHtml(formatDateTime(v.timestamp))}</td>
            <td>${getVerificationBadge(v.result)}</td>
          </tr>
        `
        )
        .join("");
    }
  }
}

function renderVerificationHistoryTable() {
  const tbody = document.getElementById("history-table-body");
  if (!tbody) return;

  const searchTerm = (document.getElementById("history-search-input")?.value || "").trim().toLowerCase();
  const resultFilter = document.getElementById("history-result-filter")?.value || "ALL";

  const logs = getVerifications().filter((v) => {
    const matchesSearch =
      !searchTerm ||
      (v.authCode || "").toLowerCase().includes(searchTerm) ||
      (v.drugName || "").toLowerCase().includes(searchTerm);
    const matchesResult = resultFilter === "ALL" || v.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No verification history records match your filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs
    .map(
      (v) => `
      <tr>
        <td><code style="font-weight: 600;">${escapeHtml(v.authCode)}</code></td>
        <td>${escapeHtml(v.drugName || "Unknown")}</td>
        <td>${escapeHtml(formatDateTime(v.timestamp))}</td>
        <td>${escapeHtml(v.method || "Manual")}</td>
        <td>${getVerificationBadge(v.result)}</td>
      </tr>
    `
    )
    .join("");
}

function switchAdminSection(sectionId, pageTitle, pageSubtitle) {
  document.querySelectorAll(".admin-section").forEach((sec) => {
    sec.classList.remove("active");
  });
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".sidebar-link[data-section]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-section") === sectionId);
  });

  const titleEl = document.getElementById("topbar-page-title");
  const subEl = document.getElementById("topbar-page-subtitle");
  if (titleEl && pageTitle) titleEl.textContent = pageTitle;
  if (subEl && pageSubtitle) subEl.textContent = pageSubtitle;

  // Refresh dynamic tables on tab switch
  refreshDashboardStats();
  if (typeof renderDrugsTable === "function") renderDrugsTable();
  if (typeof renderReportsTables === "function") renderReportsTables();
  renderVerificationHistoryTable();

  // Close mobile sidebar if open
  document.getElementById("admin-sidebar")?.classList.remove("open");
  document.getElementById("sidebar-overlay")?.classList.remove("open");
}

window.switchAdminSection = switchAdminSection;

document.addEventListener("DOMContentLoaded", () => {
  // Protect dashboard route
  if (!requireAdminAuth()) return;

  const session = getAdminSession();
  const userNameEl = document.getElementById("admin-user-name");
  if (userNameEl && session) {
    userNameEl.textContent = session.fullName || session.username;
  }

  // Sidebar navigation clicks
  document.querySelectorAll(".sidebar-link[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchAdminSection(
        btn.getAttribute("data-section"),
        btn.getAttribute("data-title"),
        btn.getAttribute("data-subtitle")
      );
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebar-toggle-btn");
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebarToggle && sidebar && overlay) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("open");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    });
  }

  // Logout button
  document.getElementById("admin-logout-btn")?.addEventListener("click", () => {
    showConfirmModal(
      "Confirm Logout",
      "Are you sure you want to end your administrator session?",
      logoutAdmin
    );
  });

  // Modal close handlers
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close-modal");
      document.getElementById(modalId)?.classList.remove("open");
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("open");
    });
  });

  // Verification History Search & Filter
  document.getElementById("history-search-input")?.addEventListener("input", renderVerificationHistoryTable);
  document.getElementById("history-result-filter")?.addEventListener("change", renderVerificationHistoryTable);

  // Settings Actions
  document.getElementById("btn-reset-demo-data")?.addEventListener("click", () => {
    showConfirmModal(
      "Reset Default Records",
      "This will restore the default drug records, verification logs, and reports. Continue?",
      () => {
        resetAllDemoData();
        refreshDashboardStats();
        renderDrugsTable();
        renderReportsTables();
        renderVerificationHistoryTable();
        showToast("Default records restored successfully.", "success");
      }
    );
  });

  document.getElementById("btn-clear-history")?.addEventListener("click", () => {
    showConfirmModal(
      "Clear Verification History",
      "Are you sure you want to clear all verification history logs?",
      () => {
        saveVerifications([]);
        refreshDashboardStats();
        renderVerificationHistoryTable();
        showToast("Verification history cleared.", "success");
      }
    );
  });

  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      drugs: getDrugs(),
      verifications: getVerifications(),
      reports: getReports()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ndlea-hadejia-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("System data exported as JSON.", "success");
  });

  // Initialize modules
  if (typeof initDrugModule === "function") initDrugModule();
  if (typeof initAdminReportsModule === "function") initAdminReportsModule();
  refreshDashboardStats();
  renderVerificationHistoryTable();
});

