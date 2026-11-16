# Online Drug Authentication System
### Case Study: National Drug Law Enforcement Agency (NDLEA), Hadejia Branch

An undergraduate final-year academic project prototype built as a **static, responsive web application** using **HTML5, CSS3, and Vanilla JavaScript (ES6+)** with browser `localStorage` persistence. Designed to be deployed directly on **GitHub Pages**.

> **Academic Prototype Disclaimer:**  
> This application is an undergraduate academic demonstration prototype for Polytechnic Hadejia. It is **not** an officially commissioned NDLEA system, does **not** use real NDLEA/NAFDAC approval records, and a matching code only confirms that a demonstration record exists in browser `localStorage`—it does **not** scientifically verify the physical contents or quality of any medicine.

---

## Project Objectives
1. Provide a web-based interface for checking drug authentication codes against a structured demonstration registry.
2. Support both manual code entry and browser-based QR code scanning/generation.
3. Maintain a verification audit trail logging code checks, timestamps, methods, and results.
4. Provide a public suspicious-drug reporting form with unique reference number generation.
5. Offer a protected demonstration Administrator Dashboard for managing drug records, reviewing reports, and monitoring statistics.

---

## Technologies Used
- **HTML5** — Semantic page structure across public and administrative views.
- **CSS3** — Custom responsive layout, government/security-inspired green-and-white theme, modals, and dashboard sidebar.
- **Vanilla JavaScript (ES6+)** — Client-side routing guards, form validation, `localStorage` persistence, and safe DOM rendering.
- **Font Awesome 6 (CDN)** — Consistent UI icons.
- **QRCode.js (CDN)** — Client-side QR code generation and PNG download for registered drug records.
- **html5-qrcode (CDN)** — Browser-based camera QR scanning and QR image file decoding.

---

## System Modules
1. **Public Homepage (`index.html`):** System overview, quick drug verification form, sample test codes, workflow guide, features, and reporting call-to-action.
2. **Drug Authentication & QR Scanner (`verify.html`):** Verifies codes as *Valid*, *Previously Used*, *Suspended*, *Expired*, or *Invalid/Not Found*, with camera/image QR scanning and manual fallback.
3. **Suspicious Drug Reporting (`report.html`):** Public form that generates a unique reference (`RPT-YYYY-XXXX`) and stores reports in `localStorage`. *(Note: Submitting a report here does not automatically notify NDLEA.)*
4. **Administrator Login (`login.html`):** Demonstration login with password visibility toggle and session persistence.
5. **Administrator Dashboard (`admin.html`):**
   - Dynamic statistics cards (Total Drugs, Total Verifications, Successful, Invalid, Total Reports, Pending Reports)
   - Drug Registration with auto-generated unique codes & live QR preview
   - Manage Drugs (search, filter, view/download QR, edit, suspend/reactivate, delete)
   - Verification History (search & filter by result)
   - Suspicious Reports & Manage Reports (review details, update status to *Pending*, *Under Investigation*, or *Resolved*, delete)
   - Settings (export JSON backup, clear verification history, reset default demo data)

---

## Demonstration Login Credentials
> **Security Notice:** These credentials are hardcoded for **academic demonstration only** and are **not** secure production credentials.

| Role | Username | Password |
| :--- | :--- | :--- |
| Administrator (Demo) | `AUWAL ADAMU` | `AUWAL2026` |
| Verification Officer (Demo) | `officer` | `Ndlea@2026` |

### Sample Drug Authentication Codes (Pre-loaded)
- `NDLEA-HDJ-102938AB` — **Valid** (Active, not yet verified)
- `NDLEA-HDJ-445566CD` — **Previously Used** (Active, already verified)
- `NDLEA-HDJ-778899EF` — **Suspended**
- `NDLEA-HDJ-332211GH` — **Expired**
- Any other code (e.g., `FAKE-999999XX`) — **Invalid / Not Found**

---

## How to Run Locally
1. Download or clone the `drug-authentication-system` folder.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox), **or** serve the folder with a local static server (recommended for camera QR scanning, as browsers require `localhost` or `https://` for camera access):
   - Using VS Code **Live Server** extension, or
   - Using any static HTTP server pointing to `drug-authentication-system/`.

---

## How to Deploy on GitHub Pages
1. Create a new repository on GitHub (e.g., `ndlea-hadejia-drug-auth`).
2. Upload/push the contents of `drug-authentication-system/` so `index.html` is at the root of the repository.
3. In your GitHub repository, go to **Settings → Pages**.
4. Under **Source**, select **Deploy from a branch**, choose `main` (and `/ (root)`), and click **Save**.
5. Wait 1–2 minutes for GitHub Pages to build, then share the generated `https://<username>.github.io/<repo-name>/` link.

---

## Limitations of the Frontend-Only Implementation
- **Browser-Scoped Storage:** Data is stored in `localStorage`, meaning records and reports exist only in the user's current browser and are not shared across different devices.
- **Client-Side Authentication:** Because there is no backend server or database, administrator authentication is strictly for academic demonstration.
- **No Real Agency Integration:** Verification results and suspicious drug reports do not connect to live NDLEA or NAFDAC databases.

