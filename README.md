# DBIT PageCraft

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-dbitpagecraft.mithungowda.in-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://dbitpagecraft.mithungowda.in)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8?style=flat-square&logo=pwa&logoColor=white)](https://dbitpagecraft.mithungowda.in)
[![Wake Up Supabase](https://github.com/DBIT-Banglore/DBIT-PageCraft/actions/workflows/wake-up-supabase.yml/badge.svg)](https://github.com/DBIT-Banglore/DBIT-PageCraft/actions/workflows/wake-up-supabase.yml)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](./LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-f7df1e?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

A beautiful, responsive, fully client-side web app that generates pristine, academically-formatted A4 documents for Don Bosco Institute of Technology (DBIT), Visvesvaraya Technological University (VTU) - assignment front pages, major-project reports, and lab/project **Activity Book** covers - exportable as PDF, PNG, or **editable Word** files.

No installs, no logins for end users, no backend rendering - everything runs in the browser. Installable as a **PWA** (works offline after first visit).


## Features

- **Three templates in one place**
  - **Assignment Front Page** - official DBIT/VTU layout with double border and Times New Roman typography
  - **Project Report** - Title Page, Certificate, Declaration & Acknowledgement for major projects (4 pages, selectable)
  - **Activity Book covers** - *Innovation and Design Thinking Lab (B25IDTL18)* and *Interdisciplinary Project Based Learning (B25PRJ28)*
- **Live exact preview** - see the page render in real time as you type, with zoom controls
- **Export options** - `.pdf`, high-resolution `.png`, and **editable `.doc` / `.docx`** (Microsoft Word)
- **PDF merge** - attach your assignment/report PDF and download one combined file
- **Auto-save** - your form data is remembered on the device (survives refresh / navigation)
- **Email capture** - first export asks for an email (then remembered), logged for analytics
- **Admin dashboard** - secured analytics with charts, a generation log, and a dedicated **Email List** with CSV export
- **Smart field pickers** - dropdowns for degree/branch/semester with a manual "Other" fallback
- **URL parameters API** - pre-fill fields and auto-download via query string
- **PWA** - installable, works offline, app icon on home screen
- **Sleek, responsive UI** - glassmorphism-inspired sidebar, works on desktop and mobile

## Tech Stack

- **HTML5 & CSS3** - application UI and the exact A4 layout templates
- **Vanilla JavaScript** - real-time DOM data-binding, zero framework overhead
- **[html2canvas](https://html2canvas.hertzen.com/)** - high-fidelity HTML-to-canvas snapshot (PDF/PNG)
- **[jsPDF](https://github.com/parallax/jsPDF)** - assembles snapshots into A4 PDFs
- **[pdf-lib](https://pdf-lib.js.org/)** - client-side PDF merging
- **[html-docx-js](https://github.com/evidenceprime/html-docx-js)** + **[JSZip](https://stuk.github.io/jszip/)** - editable `.docx` generation (A4-patched)
- **[Supabase](https://supabase.com/)** - analytics database + admin authentication (email/password)
- **[Chart.js](https://www.chartjs.org/)** - admin dashboard charts

## Project Structure

```
DBIT-PageCraft/
│
├── index.html                    # Assignment Front Page + Activity Book generator
├── project-report.html           # 4-page Project Report generator (/project-report)
├── admin.html                    # Secured analytics dashboard (/admin)
├── 404.html                      # Custom 404 / offline fallback
├── sw.js                         # Service Worker (PWA offline caching)
├── manifest.json                 # PWA Web App Manifest & icons metadata
├── package.json                  # npm scripts (dev, build, start)
├── vercel.json                   # Vercel deployment config (cleanUrls, buildCommand)
├── robots.txt                    # Search crawler rules
├── sitemap.xml                   # SEO sitemap
├── LICENSE                       # License terms
├── README.md                     # Project documentation
│
├── scripts/
│   └── build.js                  # Injects Supabase env vars into HTML at build time
│
├── css/
│   ├── styles.css                # Front-page UI + A4 layout styles
│   └── project-report-styles.css # Report UI + 4-page A4 templates
│
├── js/
│   ├── script.js                 # Front-page logic (binding, capture, exports, templates)
│   ├── project-report-script.js  # Report logic (students, pages, exports, cache)
│   ├── word-export.js            # Shared .doc/.docx builder (A4 OOXML / MHTML)
│   ├── form-cache.js             # localStorage auto-save helper
│   ├── email-gate.js             # Email prompt + cache + export gate
│   ├── pwa.js                    # Service Worker registration & install prompt
│   └── config.js                 # Stub (real config injected at build time)
│
├── assets/
│   ├── dblogo.png                # DBIT logo
│   ├── VTU.png                   # VTU logo
│   ├── wayanamac.jpg             # Wayanamac Trust logo
│   ├── icon-192.png              # PWA icon 192x192
│   ├── icon-512.png              # PWA icon 512x512
│   └── icon-maskable.png         # PWA maskable icon for Android
│
└── supabase/
    └── schema.sql                # Supabase table + RLS policies (run in SQL Editor)
```

## Templates & Export Formats

### Templates
Switch templates from the **Template** dropdown at the top of the front-page sidebar:

| Template | Fields |
|----------|--------|
| Assignment Front Page | topic, subject, code, degree, branch, student, USN, semester, section, guide |
| Activity Book - IDTL | student, USN, branch, section, semester, academic year, team name/strength, mentor |
| Activity Book - Project | same as IDTL, with *Name of the Guide* instead of *Mentor* |

The Project Report (separate page) lets you choose which of the 4 pages to export via checkboxes.

### Export formats
- **PDF / PNG** - rasterized snapshot of the live page (pixel-perfect to the preview).
- **Word (`.docx`)** - real OOXML produced by html-docx-js and **re-packaged to A4**; fully **editable** in Microsoft Word. Logos are embedded.
- **Word (`.doc`)** - packaged as MHTML so logos render and text stays **editable** in Word.

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
- **DevTools:** Application > Storage > Local Storage > delete the keys.
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
   git clone https://github.com/DBIT-Banglore/DBIT-PageCraft.git
   cd DBIT-PageCraft
   ```
2. Set up credentials:
   ```bash
   cp .env.example .env
   # Open .env and fill in your SUPABASE_URL and SUPABASE_ANON_KEY
   ```
3. Build config and start the dev server:
   ```bash
   npm run dev
   # Opens at http://localhost:3000
   # /admin and /project-report route correctly via serve.json
   ```

> Without step 2, analytics are silently disabled - everything else works fine.

## Supabase Setup

The app uses Supabase for analytics logging and a secured admin dashboard.

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in your project's **SQL Editor** to create the `generations` table with RLS policies.
   - Already have the table from an older version? Just run:
     ```sql
     alter table generations add column if not exists email text;
     ```
3. In **Authentication > Users**, create an admin user (email + password).
4. In `.env` (local) or Vercel Environment Variables (production), set:
   ```env
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

### How it works

| Action | Auth | Policy |
|--------|------|--------|
| Logging a generation (insert) | `anon` key | Public - anyone can insert |
| Reading analytics (select) | Authenticated user | Email/password sign-in required |

The admin panel at `/admin` uses Supabase Auth - no hardcoded passwords. The logger inserts the email with each record and safely retries without it if the `email` column is missing, so analytics never break.

## PWA (Progressive Web App)

DBIT PageCraft is fully installable:

- **Android/Chrome** - tap the install banner or the install icon in the address bar
- **iOS/Safari** - Share > Add to Home Screen
- **Desktop Chrome/Edge** - install icon in the address bar

After installation all static assets (HTML, CSS, JS, logos, CDN libraries) are cached by the Service Worker. The app functions fully offline - you can generate and export documents without an internet connection. Analytics logging silently skips when offline and Supabase calls are never cached.

### Updating the Service Worker cache

When you make changes to the app, bump the `CACHE_NAME` version in `sw.js` (e.g. `dbit-pagecraft-v2` -> `dbit-pagecraft-v3`). The next time a user visits, the old cache is cleared and the new shell is cached.

## Admin Dashboard

At `/admin` (sign in with the Supabase user you created):
- **Stats** - totals by type (PDF, PNG, Report, Merge, Word docs), unique students, unique emails
- **Charts** - daily usage (last 14 days) and breakdown by type
- **Generation Log** - searchable, most-recent-first
- **Email List** - deduplicated emails with name, export count, and last activity, plus **Export CSV** and **Copy emails**

## Deployment

Configured for zero-config deployment on **Vercel**. `vercel.json` handles:
- Clean URLs: `/project-report` maps to `project-report.html`, `/admin` maps to `admin.html`
- Build command: runs `node scripts/build.js` to inject environment variables into HTML pages
- Security headers on all routes

## Team

- **[Mithun Gowda B](https://www.linkedin.com/in/mithungowdab/)** - Creator & Developer - [mithungowda.b7411@gmail.com](mailto:mithungowda.b7411@gmail.com)
- **[Naren V](https://www.linkedin.com/in/naren-v-29b39939a/)**
- **[Harsha N](https://www.linkedin.com/in/harsha1218/)**
- **[Nevil Anson DSouza](https://www.linkedin.com/in/nevil-anson-dsouza/)**
- **[Manas Kiran Habbu](https://www.linkedin.com/in/manas-kiran-habbu-058487306/)** - Marketing
- **[Lekhan H R](https://www.linkedin.com/in/lekhan-hr-507b89371/)**

*Don Bosco Institute of Technology, Bengaluru*

## Acknowledgement

Credits: **[Mahesh Kumar G](https://www.linkedin.com/in/maheshkgdev/)**

## License

This project is proprietary software. All rights reserved.
See [LICENSE](./LICENSE) for full terms.
Unauthorized copying, distribution, or commercial use is strictly prohibited.
