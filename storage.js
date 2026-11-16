/**
 * storage.js
 * LocalStorage persistence, safe DOM escaping, ID generators, and demonstration seed data.
 * Academic Prototype - Online Drug Authentication System (NDLEA Hadejia Branch Case Study)
 */

const STORAGE_KEYS = {
  DRUGS: "ndlea_demo_drugs_v1",
  VERIFICATIONS: "ndlea_demo_verifications_v1",
  REPORTS: "ndlea_demo_reports_v1",
  SESSION: "ndlea_demo_admin_session_v1",
  SEEDED: "ndlea_demo_seeded_v1"
};

/**
 * Escapes HTML special characters to prevent HTML injection / XSS when rendering dynamic data.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generates a unique drug authentication code (e.g., NDLEA-HDJ-849201).
 */
function generateAuthCode() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const suffix =
    chars.charAt(Math.floor(Math.random() * chars.length)) +
    chars.charAt(Math.floor(Math.random() * chars.length));
  return `NDLEA-HDJ-${randomDigits}${suffix}`;
}

/**
 * Generates a unique report reference number (e.g., RPT-2026-4821).
 */
function generateReportRef() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RPT-${year}-${randomNum}`;
}

/**
 * Returns default fictional demonstration drug records.
 * Clearly labelled as sample demonstration data, not actual NDLEA/NAFDAC approvals.
 */
function getSeedDrugs() {
  return [
    {
      id: "DRG-1001",
      drugName: "Amoxil 500mg Capsules",
      genericName: "Amoxicillin Trihydrate",
      manufacturer: "Hadejia Valley Pharmaceuticals Ltd",
      batchNumber: "BCH-2026-014",
      category: "Antibiotic",
      manufactureDate: "2026-01-15",
      expiryDate: "2028-01-14",
      registrationRef: "REG-HDJ-0412",
      authCode: "NDLEA-HDJ-102938AB",
      status: "Active",
      verificationCount: 0,
      createdAt: "2026-02-01T09:30:00Z"
    },
    {
      id: "DRG-1002",
      drugName: "Coartem 20/120mg",
      genericName: "Artemether / Lumefantrine",
      manufacturer: "Northern MedCare Industries",
      batchNumber: "BCH-2026-089",
      category: "Antimalarial",
      manufactureDate: "2026-02-10",
      expiryDate: "2028-02-09",
      registrationRef: "REG-HDJ-0589",
      authCode: "NDLEA-HDJ-445566CD",
      status: "Active",
      verificationCount: 2,
      createdAt: "2026-02-12T11:15:00Z"
    },
    {
      id: "DRG-1003",
      drugName: "Paracetamol Extra 500mg",
      genericName: "Paracetamol",
      manufacturer: "Jigawa HealthFormulations Plc",
      batchNumber: "BCH-2025-211",
      category: "Analgesic",
      manufactureDate: "2025-05-01",
      expiryDate: "2027-05-01",
      registrationRef: "REG-HDJ-0290",
      authCode: "NDLEA-HDJ-778899EF",
      status: "Suspended",
      verificationCount: 1,
      createdAt: "2025-05-10T14:00:00Z"
    },
    {
      id: "DRG-1004",
      drugName: "Ciproflox 500mg Tablets",
      genericName: "Ciprofloxacin Hydrochloride",
      manufacturer: "Savannah BioLabs Ltd",
      batchNumber: "BCH-2023-042",
      category: "Antibiotic",
      manufactureDate: "2023-06-01",
      expiryDate: "2025-06-01",
      registrationRef: "REG-HDJ-0118",
      authCode: "NDLEA-HDJ-332211GH",
      status: "Active",
      verificationCount: 0,
      createdAt: "2023-06-15T10:00:00Z"
    },
    {
      id: "DRG-1005",
      drugName: "Lisinopril 10mg",
      genericName: "Lisinopril",
      manufacturer: "Hadejia Valley Pharmaceuticals Ltd",
      batchNumber: "BCH-2026-105",
      category: "Antihypertensive",
      manufactureDate: "2026-03-20",
      expiryDate: "2028-03-19",
      registrationRef: "REG-HDJ-0641",
      authCode: "NDLEA-HDJ-908070JK",
      status: "Active",
      verificationCount: 0,
      createdAt: "2026-03-25T08:45:00Z"
    }
  ];
}

function getSeedVerifications() {
  return [
    {
      id: "VER-5001",
      authCode: "NDLEA-HDJ-445566CD",
      drugName: "Coartem 20/120mg",
      result: "Valid",
      method: "Manual",
      timestamp: "2026-11-15T10:15:00Z"
    },
    {
      id: "VER-5002",
      authCode: "NDLEA-HDJ-445566CD",
      drugName: "Coartem 20/120mg",
      result: "Previously Used",
      method: "QR Scan",
      timestamp: "2026-11-15T14:22:00Z"
    },
    {
      id: "VER-5003",
      authCode: "NDLEA-HDJ-000000XX",
      drugName: "Unknown / Unregistered",
      result: "Invalid",
      method: "Manual",
      timestamp: "2026-11-16T09:05:00Z"
    },
    {
      id: "VER-5004",
      authCode: "NDLEA-HDJ-778899EF",
      drugName: "Paracetamol Extra 500mg",
      result: "Suspended",
      method: "Manual",
      timestamp: "2026-11-16T11:40:00Z"
    }
  ];
}

function getSeedReports() {
  return [
    {
      id: "RPT-2026-1042",
      drugName: "Unlabelled Pain Relief Pack",
      location: "Hadejia Central Market Stall B14",
      description: "Packaging print appears blurry and the authentication code failed verification on the portal.",
      reporterName: "Musa Abdullahi",
      contact: "0803-000-0101",
      status: "Pending",
      adminRemarks: "",
      createdAt: "2026-11-15T16:30:00Z"
    },
    {
      id: "RPT-2026-1088",
      drugName: "Paracetamol Extra 500mg",
      location: "Kasuwar Kofa Pharmacy Area, Hadejia",
      description: "Code returned suspended status during routine check.",
      reporterName: "Anonymous",
      contact: "Not provided",
      status: "Under Investigation",
      adminRemarks: "Flagged for field inspection by Hadejia verification team.",
      createdAt: "2026-11-16T08:50:00Z"
    },
    {
      id: "RPT-2026-1019",
      drugName: "Suspected Cough Syrup Bottle",
      location: "Malam Madori Road Junction",
      description: "Seal appeared tampered with; batch number unreadable.",
      reporterName: "Amina Yusuf",
      contact: "amina.yusuf@example.com",
      status: "Resolved",
      adminRemarks: "Inspection review completed and logged.",
      createdAt: "2026-11-12T13:10:00Z"
    }
  ];
}

/**
 * Ensures demonstration data is seeded in localStorage on first visit.
 */
function ensureSeedData() {
  if (!localStorage.getItem(STORAGE_KEYS.SEEDED)) {
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(getSeedDrugs()));
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(getSeedVerifications()));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(getSeedReports()));
    localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
  }
}

function getDrugs() {
  ensureSeedData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRUGS)) || [];
  } catch {
    return [];
  }
}

function saveDrugs(drugs) {
  localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
}

function getVerifications() {
  ensureSeedData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFICATIONS)) || [];
  } catch {
    return [];
  }
}

function saveVerifications(verifications) {
  localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verifications));
}

function getReports() {
  ensureSeedData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  } catch {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
}

function resetAllDemoData() {
  localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(getSeedDrugs()));
  localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(getSeedVerifications()));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(getSeedReports()));
  localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
}

// Initialize seed data immediately when script loads
ensureSeedData();

