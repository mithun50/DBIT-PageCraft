# DBIT Assignment Front Page Generator

A beautiful, responsive, fully client-side web application that generates pristine, academically-formatted A4 assignment front pages for Don Bosco Institute of Technology (DBIT), Visvesvaraya Technological University (VTU).

## Features

- **Exact Academic Formatting** - Recreates the official DBIT/VTU front page layout with double borders and Times New Roman typography
- **Live Exact Preview** - See your PDF in real-time as you type, with zoom controls
- **Smart Field Pickers** - Dropdowns for degree, branch and semester with a manual entry fallback
- **Export Options** - Download as crisp `.pdf` or high-resolution `.png`
- **PDF Merge** - Upload your assignment PDF and get a single merged file with the front page prepended
- **100% Client-Side** - No backend, no data sent anywhere. Everything runs in the browser
- **Sleek UI** - Glassmorphism-inspired sidebar, works on desktop and mobile

## Tech Stack

- **HTML5 & CSS3** - Application UI and exact A4 layout template
- **Vanilla JavaScript** - Real-time DOM data-binding, zero framework overhead
- **[html2canvas](https://html2canvas.hertzen.com/)** - High-fidelity HTML-to-canvas snapshot
- **[jsPDF](https://github.com/parallax/jsPDF)** - Assembles snapshots into downloadable A4 PDF
- **[pdf-lib](https://pdf-lib.js.org/)** - Client-side PDF merging

## Quick Start (Local Development)

The application uses external images and HTML canvas, so it must be served over HTTP to avoid CORS restrictions.

1. Clone the repository:
   ```bash
   git clone https://github.com/mithun50/B25CHE22B-AFPG.git
   ```
2. Navigate to the directory:
   ```bash
   cd B25CHE22B-AFPG
   ```
3. Start a local server:
   ```bash
   npx serve
   ```
4. Open the provided localhost URL in your browser.

## Deployment

Configured for zero-config deployment on **Vercel**. The included `vercel.json` sets aggressive caching for static assets and enables clean URLs.

## Credits

**Created by** Mithun Gowda B - [mithungowda.b7411@gmail.com](mailto:mithungowda.b7411@gmail.com)
*Don Bosco Institute of Technology, Bengaluru*

**Marketing by** Manas Kiran Habbu
*Don Bosco Institute of Technology, Bengaluru*

## License

This project is proprietary software. All rights reserved.
See [LICENSE](./LICENSE) for full terms.
Unauthorized copying, distribution, or commercial use is strictly prohibited.
