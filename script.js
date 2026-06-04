// ── Analytics Config ─────────────────────────────────────────────────────────
// Paste your Google Apps Script Web App URL here (the one that logs to Sheets)
const SHEET_LOG_URL = 'https://script.google.com/macros/s/AKfycbxMW5p8THMgpLFtzMTxDof4ftil55Ac9UDSAJfIb_YrbTyuEFGhN6NJNsVkC8JmVgSTUA/exec';

async function logGeneration(type) {
  if (!SHEET_LOG_URL || SHEET_LOG_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') return;
  try {
    await fetch(SHEET_LOG_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script doesn't need CORS preflight for POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        studentName: formEls.studentName?.value || '',
        usn:         formEls.usn?.value         || '',
        subject:     formEls.subjectName?.value || '',
        subjectCode: formEls.subjectCode?.value || '',
        topic:       formEls.reportTopic?.value || '',
        semester:    formEls.semester?.value    || '',
        section:     formEls.section?.value     || '',
      })
    });
  } catch (_) { /* silent fail — never block the user */ }
}
// ─────────────────────────────────────────────────────────────────────────────

// Elements
const formEls = {
  reportTopic: document.getElementById('f-report-topic'),
  subjectName: document.getElementById('f-subject-name'),
  subjectCode: document.getElementById('f-subject-code'),
  degree: document.getElementById('f-degree'),
  branch: document.getElementById('f-branch'),
  studentName: document.getElementById('f-student-name'),
  usn:         document.getElementById('f-usn'),
  semester: document.getElementById('f-semester'),
  section: document.getElementById('f-section'),
  guideName: document.getElementById('f-guide-name'),
  guideTitle: document.getElementById('f-guide-title'),
  guideDept: document.getElementById('f-guide-dept')
};

const templateEls = {
  reportTopic: document.getElementById('t-report-topic'),
  subjectName: document.getElementById('t-subject-name'),
  subjectCode: document.getElementById('t-subject-code'),
  degree: document.getElementById('t-degree'),
  branch: document.getElementById('t-branch'),
  studentName: document.getElementById('t-student-name'),
  usn:         document.getElementById('t-usn'),
  semester: document.getElementById('t-semester'),
  section: document.getElementById('t-section'),
  guideName: document.getElementById('t-guide-name'),
  guideTitle: document.getElementById('t-guide-title'),
  guideDept: document.getElementById('t-guide-dept')
};
const generatorForm = document.getElementById('generator-form');

function validateRequiredFields() {
  if (!generatorForm.checkValidity()) {
    generatorForm.reportValidity();
    return false;
  }
  return true;
}

// Fields that need line breaks inserted every 26 characters
const wrapFields = new Set(['studentName', 'usn', 'guideName', 'guideTitle', 'guideDept']);

function wrapAt26(str) {
  const MAX = 26;
  const words = str.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      // Word itself exceeds limit — hard break it
      if (word.length > MAX) {
        let remaining = word;
        while (remaining.length > MAX) {
          lines.push(remaining.slice(0, MAX));
          remaining = remaining.slice(MAX);
        }
        current = remaining;
      } else {
        current = word;
      }
    } else if ((current + ' ' + word).length <= MAX) {
      current += ' ' + word;
    } else {
      lines.push(current);
      if (word.length > MAX) {
        let remaining = word;
        while (remaining.length > MAX) {
          lines.push(remaining.slice(0, MAX));
          remaining = remaining.slice(MAX);
        }
        current = remaining;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);

  // Escape HTML and join with <br>
  return lines
    .map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    .join('<br>');
}

// "Other" manual input handling for select fields
const otherFields = {
  degree:   { select: document.getElementById('f-degree'),   input: document.getElementById('f-degree-other') },
  branch:   { select: document.getElementById('f-branch'),   input: document.getElementById('f-branch-other') },
  semester: { select: document.getElementById('f-semester'), input: document.getElementById('f-semester-other') },
};

function getFieldValue(key) {
  if (otherFields[key]) {
    const { select, input } = otherFields[key];
    return select.value === '__other__' ? input.value : select.value;
  }
  return formEls[key].value;
}

Object.entries(otherFields).forEach(([key, { select, input }]) => {
  select.addEventListener('input', () => {
    if (select.value === '__other__') {
      input.style.display = 'block';
      input.required = true;
      select.required = false;
      templateEls[key].textContent = input.value;
    } else {
      input.style.display = 'none';
      input.required = false;
      select.required = true;
      templateEls[key].textContent = select.value;
    }
  });
  input.addEventListener('input', () => {
    templateEls[key].textContent = input.value;
  });
});

// Real-time data binding for all other fields
Object.keys(formEls).forEach(key => {
  if (otherFields[key]) return; // handled above
  formEls[key].addEventListener('input', (e) => {
    if (wrapFields.has(key)) {
      templateEls[key].innerHTML = wrapAt26(e.target.value);
    } else {
      templateEls[key].textContent = e.target.value;
    }
  });
});

// Zoom Controls
let zoomLevel = window.innerWidth <= 768 ? 0.4 : 0.8;
const templateRoot = document.getElementById('template-root');
const zoomInBtn = document.getElementById('btn-zoom-in');
const zoomOutBtn = document.getElementById('btn-zoom-out');
const zoomLevelText = document.getElementById('zoom-level');

function updateZoom() {
  templateRoot.style.transform = `scale(${zoomLevel})`;
  zoomLevelText.textContent = `${Math.round(zoomLevel * 100)}%`;
}

zoomInBtn.addEventListener('click', () => {
  if (zoomLevel < 1.5) {
    zoomLevel += 0.1;
    updateZoom();
  }
});

zoomOutBtn.addEventListener('click', () => {
  if (zoomLevel > 0.4) {
    zoomLevel -= 0.1;
    updateZoom();
  }
});

// Initialize zoom
updateZoom();

// ─── Desktop-mode capture ────────────────────────────────────────────────────
// Mimics what the browser's "Request Desktop Site" does:
//   1. Temporarily change the viewport meta to force desktop width
//   2. Reset the #template-root transform to scale(1) so there's no skew
//   3. Wait for the browser to reflow at desktop layout
//   4. Capture the live .page element with html2canvas
//   5. Restore the viewport meta and transform exactly as they were
// This works because the user confirmed "Desktop Site" mode exports correctly.
async function capturePageDesktopMode(renderScale) {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const originalViewport = viewportMeta ? viewportMeta.content : null;
  const originalTransform = templateRoot.style.transform;

  try {
    // Step 1: Force desktop viewport (disables all @media max-width rules)
    if (viewportMeta) viewportMeta.content = 'width=1200, initial-scale=1';

    // Step 2: Reset template transform to 1:1
    templateRoot.style.transform = 'scale(1)';
    templateRoot.style.transformOrigin = 'top center';

    // Step 3: Wait for full browser reflow
    await new Promise(r => setTimeout(r, 400));

    // Step 4: Capture the live element — it's now in "desktop" layout
    const pageEl = document.querySelector('#template-root .page');
    const canvas = await html2canvas(pageEl, {
      scale: renderScale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      windowHeight: 900,
    });

    return canvas;

  } finally {
    // Step 5: Always restore — even if capture fails
    if (viewportMeta && originalViewport) viewportMeta.content = originalViewport;
    templateRoot.style.transform = originalTransform;
    // Re-apply the correct zoom level for the current device
    updateZoom();
  }
}
// ─────────────────────────────────────────────────────────────────────────────


// PDF Generation
document.getElementById('btn-download').addEventListener('click', async () => {
  const btn = document.getElementById('btn-download');
  const originalText = btn.innerHTML;
  btn.innerText = "Generating PDF...";
  btn.disabled = true;

  try {
    if (!validateRequiredFields()) return;
    const canvas = await capturePageDesktopMode(2);
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const fileName = `Chemistry_Front_Page_${formEls.studentName.value.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
    logGeneration('PDF');

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// PNG Export
document.getElementById('btn-export-png').addEventListener('click', async () => {
  const btn = document.getElementById('btn-export-png');
  const originalText = btn.innerHTML;
  btn.innerText = "Exporting PNG...";
  btn.disabled = true;

  try {
    if (!validateRequiredFields()) return;
    const canvas = await capturePageDesktopMode(3);
    const imgData = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = imgData;
    a.download = `Chemistry_Front_Page_${formEls.studentName.value.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logGeneration('PNG');

  } catch (error) {
    console.error("Error exporting PNG:", error);
    alert("Failed to export PNG. Please try again.");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// ─── PDF Upload & Merge ───────────────────────────────────────────────────────
const uploadInput = document.getElementById('f-upload-pdf');
const uploadLabel = document.getElementById('upload-label');
const uploadFilename = document.getElementById('upload-filename');
const mergeBtn = document.getElementById('btn-merge');

uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  if (file) {
    uploadFilename.textContent = file.name.length > 28 ? file.name.slice(0, 25) + '...' : file.name;
    uploadLabel.classList.add('has-file');
    mergeBtn.disabled = false;
  } else {
    uploadFilename.textContent = 'Click to upload PDF';
    uploadLabel.classList.remove('has-file');
    mergeBtn.disabled = true;
  }
});

mergeBtn.addEventListener('click', async () => {
  const file = uploadInput.files[0];
  if (!file) return;
  if (!validateRequiredFields()) return;

  const originalText = mergeBtn.innerHTML;
  mergeBtn.innerText = 'Merging...';
  mergeBtn.disabled = true;

  try {
    const { PDFDocument } = PDFLib;

    // 1. Capture front page as image
    const canvas = await capturePageDesktopMode(2);
    const imgData = canvas.toDataURL('image/png');
    // Convert base64 to Uint8Array
    const base64 = imgData.split(',')[1];
    const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // 2. Read uploaded PDF
    const uploadedBytes = await file.arrayBuffer();
    const uploadedPdf = await PDFDocument.load(uploadedBytes);

    // 3. Create new merged PDF
    const merged = await PDFDocument.create();

    // 4. Add front page as page 1
    const frontPageDoc = await PDFDocument.create();
    const pngImage = await frontPageDoc.embedPng(imgBytes);
    const a4 = { width: 595.28, height: 841.89 }; // A4 in points
    const frontPage = frontPageDoc.addPage([a4.width, a4.height]);
    frontPage.drawImage(pngImage, { x: 0, y: 0, width: a4.width, height: a4.height });
    const [copiedFront] = await merged.copyPages(frontPageDoc, [0]);
    merged.addPage(copiedFront);

    // 5. Copy all pages from uploaded PDF
    const pageCount = uploadedPdf.getPageCount();
    const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
    const copiedPages = await merged.copyPages(uploadedPdf, pageIndices);
    copiedPages.forEach(p => merged.addPage(p));

    // 6. Save and download
    const mergedBytes = await merged.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chemistry_Assignment_${formEls.studentName.value.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logGeneration('MERGE');

  } catch (err) {
    console.error('Merge failed:', err);
    alert('Failed to merge PDFs. Please try again.');
  } finally {
    mergeBtn.innerHTML = originalText;
    mergeBtn.disabled = false;
  }
});

// ── URL Parameters API ──
// Usage: /?topic=...&subject=...&code=...&degree=...&branch=...&name=...&usn=...&semester=...&section=...&guide=...&guideTitle=...&guideDept=...&download=pdf|png
(function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('topic') && !params.has('download')) return;

  const fieldMap = {
    topic: 'f-report-topic',
    subject: 'f-subject-name',
    code: 'f-subject-code',
    degree: 'f-degree',
    branch: 'f-branch',
    name: 'f-student-name',
    usn: 'f-usn',
    semester: 'f-semester',
    section: 'f-section',
    guide: 'f-guide-name',
    guideTitle: 'f-guide-title',
    guideDept: 'f-guide-dept',
  };

  for (const [param, elId] of Object.entries(fieldMap)) {
    const val = params.get(param);
    if (!val) continue;
    const el = document.getElementById(elId);
    if (!el) continue;
    if (el.tagName === 'SELECT') {
      const opt = [...el.options].find(o => o.value === val);
      if (opt) { el.value = val; }
      else {
        el.value = '__other__';
        const otherInput = document.getElementById(elId + '-other');
        if (otherInput) { otherInput.style.display = 'block'; otherInput.value = val; }
      }
      el.dispatchEvent(new Event('input'));
    } else {
      el.value = val;
      el.dispatchEvent(new Event('input'));
    }
  }

  // Auto-download
  const dl = params.get('download');
  if (dl === 'pdf') setTimeout(() => document.getElementById('btn-download').click(), 1000);
  if (dl === 'png') setTimeout(() => document.getElementById('btn-export-png').click(), 1000);
})();
