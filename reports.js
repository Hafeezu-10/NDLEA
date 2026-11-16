/**
 * reports.js
 * Suspicious Drug Reporting (Public report.html & Admin management in admin.html)
 */

function getReportStatusBadge(status) {
  switch (status) {
    case "Resolved":
      return `<span class="badge badge-success">Resolved</span>`;
    case "Under Investigation":
      return `<span class="badge badge-info">Under Investigation</span>`;
    default:
      return `<span class="badge badge-warning">Pending</span>`;
  }
}

function renderReportsTables() {
  const manageBody = document.getElementById("manage-reports-table-body");
  const overviewBody = document.getElementById("suspicious-reports-table-body");

  const searchTerm = (document.getElementById("reports-search-input")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("reports-status-filter")?.value || "ALL";

  const allReports = getReports();

  if (overviewBody) {
    if (allReports.length === 0) {
      overviewBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No suspicious drug reports recorded.</td></tr>`;
    } else {
      overviewBody.innerHTML = allReports
        .map(
          (r) => `
          <tr>
            <td><strong>${escapeHtml(r.id)}</strong></td>
            <td>${escapeHtml(r.drugName)}</td>
            <td>${escapeHtml(r.location)}</td>
            <td>${escapeHtml(r.reporterName || "Anonymous")}</td>
            <td>${escapeHtml(formatDateTime(r.createdAt))}</td>
            <td>${getReportStatusBadge(r.status)}</td>
          </tr>
        `
        )
        .join("");
    }
  }

  if (manageBody) {
    const filtered = allReports.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        (r.id || "").toLowerCase().includes(searchTerm) ||
        (r.drugName || "").toLowerCase().includes(searchTerm) ||
        (r.location || "").toLowerCase().includes(searchTerm) ||
        (r.description || "").toLowerCase().includes(searchTerm);
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      manageBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No reports match your search or status filter.
          </td>
        </tr>
      `;
      return;
    }

    manageBody.innerHTML = filtered
      .map(
        (r) => `
        <tr>
          <td><code style="font-weight: 600;">${escapeHtml(r.id)}</code></td>
          <td><strong>${escapeHtml(r.drugName)}</strong></td>
          <td>${escapeHtml(r.location)}</td>
          <td>${escapeHtml(r.reporterName || "Anonymous")}</td>
          <td>${escapeHtml(formatDateTime(r.createdAt))}</td>
          <td>${getReportStatusBadge(r.status)}</td>
          <td>
            <div class="action-btns">
              <button type="button" class="icon-btn" title="Review & Update Status" onclick="openReviewReportModal('${escapeHtml(r.id)}')">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button type="button" class="icon-btn danger" title="Delete Report" onclick="confirmDeleteReport('${escapeHtml(r.id)}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
      )
      .join("");
  }
}

window.openReviewReportModal = function (reportId) {
  const report = getReports().find((r) => r.id === reportId);
  if (!report) return;

  document.getElementById("review-report-id").value = report.id;
  document.getElementById("review-ref-display").textContent = report.id;
  document.getElementById("review-drug-display").textContent = report.drugName;
  document.getElementById("review-location-display").textContent = report.location;
  document.getElementById("review-reporter-display").textContent = `${report.reporterName || "Anonymous"} (${report.contact || "No contact"})`;
  document.getElementById("review-date-display").textContent = formatDateTime(report.createdAt);
  document.getElementById("review-description-display").textContent = report.description;
  document.getElementById("review-status-select").value = report.status || "Pending";
  document.getElementById("review-remarks-input").value = report.adminRemarks || "";

  document.getElementById("review-report-modal").classList.add("open");
};

window.confirmDeleteReport = function (reportId) {
  showConfirmModal(
    "Delete Suspicious Drug Report",
    `Are you sure you want to delete report ${reportId}?`,
    () => {
      const updated = getReports().filter((r) => r.id !== reportId);
      saveReports(updated);
      renderReportsTables();
      if (typeof refreshDashboardStats === "function") refreshDashboardStats();
      showToast("Report deleted successfully.", "success");
    }
  );
};

function initAdminReportsModule() {
  const reviewForm = document.getElementById("review-report-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const reportId = document.getElementById("review-report-id").value;
      const status = document.getElementById("review-status-select").value;
      const remarks = document.getElementById("review-remarks-input").value.trim();

      const reports = getReports();
      const idx = reports.findIndex((r) => r.id === reportId);
      if (idx === -1) return;

      reports[idx].status = status;
      reports[idx].adminRemarks = remarks;
      saveReports(reports);

      document.getElementById("review-report-modal").classList.remove("open");
      renderReportsTables();
      if (typeof refreshDashboardStats === "function") refreshDashboardStats();
      showToast(`Report ${reportId} updated to "${status}".`, "success");
    });
  }

  document.getElementById("reports-search-input")?.addEventListener("input", renderReportsTables);
  document.getElementById("reports-status-filter")?.addEventListener("change", renderReportsTables);

  renderReportsTables();
}

// Public report.html handler
document.addEventListener("DOMContentLoaded", () => {
  const publicReportForm = document.getElementById("public-report-form");
  if (!publicReportForm) return;

  // Pre-fill drug field if ?drug= is passed from verify.html
  const params = new URLSearchParams(window.location.search);
  const prefillDrug = params.get("drug");
  if (prefillDrug) {
    const drugInput = document.getElementById("report-drug-name");
    if (drugInput) drugInput.value = `Code / Product: ${prefillDrug}`;
  }

  publicReportForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const drugName = document.getElementById("report-drug-name").value.trim();
    const location = document.getElementById("report-location").value.trim();
    const description = document.getElementById("report-description").value.trim();
    const reporterName = document.getElementById("report-reporter-name").value.trim() || "Anonymous";
    const contact = document.getElementById("report-contact").value.trim() || "Not provided";

    if (!drugName || !location || !description) {
      showToast("Please fill in Drug Name, Location, and Description of Suspicion.", "warning");
      return;
    }

    const reports = getReports();
    let ref = generateReportRef();
    while (reports.some((r) => r.id === ref)) {
      ref = generateReportRef();
    }

    const newReport = {
      id: ref,
      drugName,
      location,
      description,
      reporterName,
      contact,
      status: "Pending",
      adminRemarks: "",
      createdAt: new Date().toISOString()
    };

    reports.unshift(newReport);
    saveReports(reports);

    const confirmationBox = document.getElementById("report-success-box");
    const refEl = document.getElementById("generated-report-ref");
    if (refEl) refEl.textContent = ref;
    if (confirmationBox) confirmationBox.style.display = "block";

    publicReportForm.reset();
    showToast(`Report submitted! Reference: ${ref}`, "success");
  });
});

