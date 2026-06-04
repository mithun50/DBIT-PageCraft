# DBIT PageCraft

A beautiful, responsive, fully client-side web application that generates pristine, academically-formatted A4 assignment front pages and major project report pages for Don Bosco Institute of Technology (DBIT), Visvesvaraya Technological University (VTU).

## Features

- **Exact Academic Formatting** - Recreates the official DBIT/VTU front page layout with double borders and Times New Roman typography
- **Project Report Generator** - Title Page, Certificate, Declaration & Acknowledgement for major projects
- **Live Exact Preview** - See your PDF in real-time as you type, with zoom controls
- **Smart Field Pickers** - Dropdowns for degree, branch and semester with a manual entry fallback
- **Export Options** - Download as crisp `.pdf` or high-resolution `.png`
- **PDF Merge** - Upload your assignment/report PDF and get a single merged file
- **Admin Dashboard** - Secured analytics panel with charts and usage stats
- **Sleek UI** - Glassmorphism-inspired sidebar, works on desktop and mobile

## Tech Stack

- **HTML5 & CSS3** - Application UI and exact A4 layout template
- **Vanilla JavaScript** - Real-time DOM data-binding, zero framework overhead
- **[html2canvas](https://html2canvas.hertzen.com/)** - High-fidelity HTML-to-canvas snapshot
- **[jsPDF](https://github.com/parallax/jsPDF)** - Assembles snapshots into downloadable A4 PDF
- **[pdf-lib](https://pdf-lib.js.org/)** - Client-side PDF merging
- **[Supabase](https://supabase.com/)** - Analytics database + admin authentication (email/password)
- **[Chart.js](https://www.chartjs.org/)** - Admin dashboard charts

## Quick Start (Local Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/mithun50/DBIT-PageCraft.git
   cd DBIT-PageCraft
   ```
2. Start a local server:
   ```bash
   npx serve
   ```
3. Open the provided localhost URL in your browser.

## Supabase Setup

The app uses Supabase for analytics logging and a secured admin dashboard.

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `schema.sql` in your project's SQL Editor to create the `generations` table with RLS policies
3. In **Authentication → Users**, create an admin user (email + password)
4. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in:
   - `script.js`
   - `project-report-script.js`
   - `admin.html`

### How it works

| Action | Auth | Policy |
|--------|------|--------|
| Logging a generation (insert) | `anon` key | Public - anyone can insert |
| Reading analytics (select) | Authenticated user | Email/password sign-in required |

The admin panel at `/admin` uses Supabase Auth - no hardcoded passwords.

## Deployment

Configured for zero-config deployment on **Vercel**. The included `vercel.json` enables clean URLs.

## Team

- **Mithun Gowda B** - Creator & Developer - [mithungowda.b7411@gmail.com](mailto:mithungowda.b7411@gmail.com)
- **Naren V**
- **Harsha N**
- **Nevil Anson DSouza**
- **Manas Kiran Habbu** - Marketing
- **Lekhan H R**

*Don Bosco Institute of Technology, Bengaluru*

## Acknowledgement

Templates provided by **Mahesh Kumar G**

## License

This project is proprietary software. All rights reserved.
See [LICENSE](./LICENSE) for full terms.
Unauthorized copying, distribution, or commercial use is strictly prohibited.
