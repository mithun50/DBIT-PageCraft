# DBIT PageCraft

A beautiful, responsive, fully client-side web app that generates pristine, academically-formatted A4 documents for Don Bosco Institute of Technology (DBIT), Visvesvaraya Technological University (VTU) — assignment front pages, major-project reports, and lab/project **Activity Book** covers — exportable as PDF, PNG, or **editable Word** files.

No installs, no logins for end users, no backend rendering — everything runs in the browser.

## Features

- **Three templates in one place**
  - **Assignment Front Page** — official DBIT/VTU layout with double border and Times New Roman typography
  - **Project Report** — Title Page, Certificate, Declaration & Acknowledgement for major projects (4 pages, selectable)
  - **Activity Book covers** — *Innovation and Design Thinking Lab (B25IDTL18)* and *Interdisciplinary Project Based Learning (B25PRJ28)*
- **Live exact preview** — see the page render in real time as you type, with zoom controls
- **Export options** — `.pdf`, high-resolution `.png`, and **editable `.doc` / `.docx`** (Microsoft Word)
- **PDF merge** — attach your assignment/report PDF and download one combined file
- **Auto-save** — your form data is remembered on the device (survives refresh / navigation)
- **Email capture** — first export asks for an email (then remembered), logged for analytics
- **Admin dashboard** — secured analytics with charts, a generation log, and a dedicated **Email List** with CSV export
- **Smart field pickers** — dropdowns for degree/branch/semester with a manual "Other" fallback
- **URL parameters API** — pre-fill fields and auto-download via query string
- **Sleek, responsive UI** — glassmorphism-inspired sidebar, works on desktop and mobile

## Tech Stack

- **HTML5 & CSS3** — application UI and the exact A4 layout templates
- **Vanilla JavaScript** — real-time DOM data-binding, zero framework overhead
- **[html2canvas](https://html2canvas.hertzen.com/)** — high-fidelity HTML→canvas snapshot (PDF/PNG)
- **[jsPDF](https://github.com/parallax/jsPDF)** — assembles snapshots into A4 PDFs
- **[pdf-lib](https://pdf-lib.js.org/)** — client-side PDF merging
- **[html-docx-js](https://github.com/evidenceprime/html-docx-js)** + **[JSZip](https://stuk.github.io/jszip/)** — editable `.docx` generation (A4-patched)
- **[Supabase](https://supabase.com/)** — analytics database + admin authentication (email/password)
- **[Chart.js](https://www.chartjs.org/)** — admin dashboard charts

## Project Structure

```
index.html                  Assignment Front Page + Activity Book generator
project-report.html         4-page Project Report generator
admin.html                  Secured analytics dashboard (self-contained)
schema.sql                  Supabase table + RLS policies
vercel.json                 Clean-URL config for Vercel
css/
  styles.css                Front-page UI + A4 templates (assignment + activity book)
  project-report-styles.css Report UI + 4-page A4 templates
js/
  script.js                 Front-page logic (binding, capture, exports, templates, cache)
  project-report-script.js  Report logic (students, pages, exports, cache)
  word-export.js            Shared .doc/.docx builder (MHTML + html-docx-js, A4)
  form-cache.js             localStorage auto-save helper
  email-gate.js             Email prompt + cache + export click gate
assets/
  dblogo.png, VTU.png, wayanamac.jpg   Logos
```

## Templates & Export Formats

### Templates
Switch templates from the **Template** dropdown at the top of the front-page sidebar:

| Template | Fields |
|----------|--------|
| Assignment Front Page | topic, subject, code, degree, branch, student, USN, semester, section, guide |
| Activity Book — IDTL | student, USN, branch, section, semester, academic year, team name/strength, mentor |
| Activity Book — Project | same as IDTL, with *Name of the Guide* instead of *Mentor* |

The Project Report (separate page) lets you choose which of the 4 pages to export via checkboxes.

### Export formats
- **PDF / PNG** — rasterized snapshot of the live page (pixel-perfect to the preview).
- **Word (`.docx`)** — real OOXML produced by html-docx-js and **re-packaged to A4**; fully **editable** in Microsoft Word. Logos are embedded.
- **Word (`.doc`)** — packaged as MHTML so logos render and text stays **editable** in Word.

> Note: the Word files are genuinely editable (not an image). Decorative borders are simplified versions of the on-screen design, since Word can't reproduce rounded/corner-square borders. `.docx` is built for Microsoft Word; very old LibreOffice/Google Docs versions may render the embedded content imperfectly.

## Saved Data & Privacy

The app stores small amounts of data in your browser's **localStorage** (per device/browser):

| Key | Contents |
|-----|----------|
| `dbit_pagecraft_frontpage` | Front-page / activity-book form fields + selected template |
| `dbit_pagecraft_report` | Project-report fields, student list, page selection |
| `dbit_pagecraft_email` | The email entered at first export |

On any export, if no email is cached the app asks for one (and remembers it). The email is also sent with the analytics record (see below).

### Clearing saved data
- **Console (this site only):**
  ```js
  localStorage.removeItem('dbit_pagecraft_frontpage');
  localStorage.removeItem('dbit_pagecraft_report');
  localStorage.removeItem('dbit_pagecraft_email');
  location.reload();
  ```
  or with the built-in helpers: `FormCache.clear('dbit_pagecraft_frontpage')`, `EmailGate.clear()`.
- **Everything for the site:** `localStorage.clear()` in the console.
- **DevTools:** Application → Storage → Local Storage → delete the keys.
- **Browser settings:** clear "Cookies and site data" for the domain.

## URL Parameters API

Pre-fill and optionally auto-download via the query string.

**Front page** (`/`):
```
/?topic=...&subject=...&code=...&degree=...&branch=...&name=...&usn=...&semester=...&section=...&guide=...&guideTitle=...&guideDept=...&download=pdf|png|doc|docx
```

**Project report** (`/project-report`):
```
/project-report?title=...&phase=...&degree=...&branch=...&semester=...&year=...&dept=...&deptFull=...&guide=...&guideTitle=...&hod=...&hodQual=...&hodTitle=...&principal=...&principalQual=...&coordinator=...&coordinatorTitle=...&students=Name1:USN1,Name2:USN2&pages=0,1,2,3&download=true|doc|docx
```

## Quick Start (Local Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/mithun50/DBIT-PageCraft.git
   cd DBIT-PageCraft
   ```
2. Start a local server (needed so logos load over HTTP for canvas/Word export):
   ```bash
   npx serve
   ```
3. Open the provided localhost URL in your browser.

## Supabase Setup

The app uses Supabase for analytics logging and a secured admin dashboard.

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `schema.sql` in your project's **SQL Editor** to create the `generations` table (now including an `email` column) with RLS policies.
   - Already have the table from an older version? Just run:
     ```sql
     alter table generations add column if not exists email text;
     ```
3. In **Authentication → Users**, create an admin user (email + password).
4. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in:
   - `js/script.js`
   - `js/project-report-script.js`
   - `admin.html`

### How it works

| Action | Auth | Policy |
|--------|------|--------|
| Logging a generation (insert) | `anon` key | Public — anyone can insert |
| Reading analytics (select) | Authenticated user | Email/password sign-in required |

The admin panel at `/admin` uses Supabase Auth — no hardcoded passwords. The logger inserts the email with each record and **safely retries without it** if the `email` column is missing, so analytics never break.

## Admin Dashboard

At `/admin` (sign in with the Supabase user you created):
- **Stats** — totals by type (PDF, PNG, Report, Merge, Word docs), unique students, unique emails
- **Charts** — daily usage (last 14 days) and breakdown by type
- **Generation Log** — searchable, most-recent-first
- **Email List** — deduplicated emails with name, export count, and last activity, plus **Export CSV** and **Copy emails**

## Deployment

Configured for zero-config deployment on **Vercel**. The included `vercel.json` enables clean URLs.

## Team

- **[Mithun Gowda B](https://www.linkedin.com/in/mithungowdab/)** — Creator & Developer — [mithungowda.b7411@gmail.com](mailto:mithungowda.b7411@gmail.com)
- **[Naren V](https://www.linkedin.com/in/naren-v-29b39939a/)**
- **[Harsha N](https://www.linkedin.com/in/harsha1218/)**
- **[Nevil Anson DSouza](https://www.linkedin.com/in/nevil-anson-dsouza/)**
- **[Manas Kiran Habbu](https://www.linkedin.com/in/manas-kiran-habbu-058487306/)** — Marketing
- **[Lekhan H R](https://www.linkedin.com/in/lekhan-hr-507b89371/)**

*Don Bosco Institute of Technology, Bengaluru*

## Acknowledgement

Credits: **[Mahesh Kumar G](https://www.linkedin.com/in/maheshkgdev/)**

## License

This project is proprietary software. All rights reserved.
See [LICENSE](./LICENSE) for full terms.
Unauthorized copying, distribution, or commercial use is strictly prohibited.
