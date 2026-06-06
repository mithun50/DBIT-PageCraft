// ── Analytics Config ─────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://jkhxpdsyouecsjresikt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpraHhwZHN5b3VlY3NqcmVzaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjU3MzAsImV4cCI6MjA5NjE0MTczMH0.ulmw1uPs9z3fUNll88h06g_8VetZgwVjZYJq1cOCBQ0';

async function logGeneration(type) {
  const url = `${SUPABASE_URL}/rest/v1/generations`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
  const base = {
    page: 'front-page',
    type,
    student_name: currentTemplate === 'assignment' ? (formEls.studentName?.value || '') : (abEls.name?.input?.value || ''),
    usn: currentTemplate === 'assignment' ? (formEls.usn?.value || '') : (abEls.usn?.input?.value || ''),
    subject: formEls.subjectName?.value || '',
    subject_code: formEls.subjectCode?.value || '',
    topic: formEls.reportTopic?.value || '',
    semester: currentTemplate === 'assignment' ? (formEls.semester?.value || '') : (abEls.semester?.input?.value || ''),
    section: currentTemplate === 'assignment' ? (formEls.section?.value || '') : (abEls.section?.input?.value || ''),
  };
  const email = (window.EmailGate && EmailGate.get()) || '';
  try {
    let res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(Object.assign({ email }, base)) });
    // If the DB has no `email` column yet, retry without it so logging still works.
    if (!res.ok) { await fetch(url, { method: 'POST', headers, body: JSON.stringify(base) }); }
  } catch (_) { /* silent fail */ }
}

// Ask for email on the first export, then remember it (see js/email-gate.js)
if (window.EmailGate) {
  EmailGate.gate('#btn-download, #btn-export-png, #btn-merge, #btn-export-docx, #btn-export-doc');
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
      // Word itself exceeds limit - hard break it
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

    // Step 4: Capture the live element - it's now in "desktop" layout
    const pageEl = getActivePageEl();
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
    // Step 5: Always restore - even if capture fails
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

    const fileName = frontFileBase() + '.pdf';
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
    a.download = frontFileBase() + '.png';
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
    a.download = frontFileBase() + '_merged.pdf';
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

// ─── Word Export (.doc / .docx) ───────────────────────────────────────────────
// Builds editable, Word-compatible HTML mirroring the front-page layout (A4,
// Times New Roman, double border) and exports it via the shared WordExport helper.
function frameFrontPage(innerHtml) {
  // Double border: thick outer table + thin inner table (matches the 4px/2px frame).
  return '<table width="100%" cellspacing="0" cellpadding="0" style="border:3pt solid #000;">' +
    '<tr><td style="padding:4pt;">' +
    '<table width="100%" cellspacing="0" cellpadding="0" style="border:1.5pt solid #000;">' +
    '<tr><td style="padding:26pt 30pt;">' + innerHtml + '</td></tr></table>' +
    '</td></tr></table>';
}

function buildFrontPageWordBody() {
  const E = WordExport.esc;
  const P = WordExport.p;

  const topic       = formEls.reportTopic.value;
  const subjectName = formEls.subjectName.value;
  const subjectCode = formEls.subjectCode.value;
  const degree      = getFieldValue('degree');
  const branch      = getFieldValue('branch');
  const studentName = formEls.studentName.value;
  const usn         = formEls.usn.value;
  const semester    = getFieldValue('semester');
  const section     = formEls.section.value;
  const guideName   = formEls.guideName.value;
  const guideTitle  = formEls.guideTitle.value;
  const guideDept   = formEls.guideDept.value;

  const vtu  = WordExport.getLogoDataURL('img.vtu-logo');
  const dbit = WordExport.getLogoDataURL('img.dbit-logo');

  let inner = '';
  // Header
  inner += P('DON BOSCO INSTITUTE OF TECHNOLOGY', { size: 18, bold: true, mb: 3, spacing: 0.4 });
  inner += P('VISVESVARAYA TECHNOLOGY UNIVERSITY', { size: 12, mb: 3 });
  inner += P('AN AUTONOMOUS INSTITUTION UNDER VTU', { size: 11, mb: 6 });
  // VTU logo
  inner += WordExport.img(vtu, 94);
  // Topic & subject
  inner += P(E(topic), { size: 13.5, mt: 12, mb: 8 });
  inner += P('SUBJECT: ' + E(subjectName), { size: 13.5, bold: true, mb: 2 });
  inner += P('SUBJECT CODE: ' + E(subjectCode), { size: 13.5, bold: true, mb: 10 });
  // Degree info
  inner += P(E(degree), { size: 13.5, mb: 2 });
  inner += P('In', { size: 13.5, mb: 2 });
  inner += P(E(branch), { size: 13.5, mb: 8 });
  // DBIT logo
  inner += WordExport.img(dbit, 98);
  // Footer: two columns (student details | guide details)
  inner += '<table width="100%" cellspacing="0" cellpadding="0" style="margin-top:16pt;"><tr>' +
    '<td width="55%" style="vertical-align:top;">' +
      P('Submitted By', { size: 13.5, align: 'left', mb: 6 }) +
      P('Name: ' + E(studentName), { size: 13.5, align: 'left', mb: 6 }) +
      P('USN: ' + E(usn), { size: 13.5, align: 'left', mb: 6 }) +
      P('Sem: ' + E(semester) + (section ? ' ' + E(section) : ''), { size: 13.5, align: 'left', mb: 6 }) +
    '</td>' +
    '<td width="45%" style="vertical-align:top;">' +
      P('Guided By:', { size: 13.5, align: 'left', mb: 6 }) +
      P(E(guideName), { size: 13.5, align: 'left', mb: 6 }) +
      P(E(guideTitle), { size: 13.5, align: 'left', mb: 6 }) +
      P(E(guideDept), { size: 13.5, align: 'left', mb: 6 }) +
    '</td>' +
    '</tr></table>';

  return frameFrontPage(inner);
}

function exportFrontPageWord(kind) {
  if (currentTemplate === 'assignment') {
    if (!validateRequiredFields()) return;
    const body = buildFrontPageWordBody();
    const base = frontFileBase();
    const title = formEls.reportTopic.value || 'Assignment Front Page';
    if (kind === 'docx') { WordExport.downloadDocx(base, body, { title }); logGeneration('DOCX'); }
    else { WordExport.downloadDoc(base, body, { title }); logGeneration('DOC'); }
  } else {
    const body = buildActivityBookWordBody();
    const base = frontFileBase();
    const title = AB_TEMPLATES[currentTemplate].course + ' Activity Book';
    if (kind === 'docx') { WordExport.downloadDocx(base, body, { title }); logGeneration('DOCX'); }
    else { WordExport.downloadDoc(base, body, { title }); logGeneration('DOC'); }
  }
}

document.getElementById('btn-export-docx').addEventListener('click', () => {
  try { exportFrontPageWord('docx'); }
  catch (e) { console.error('DOCX export failed:', e); alert('Failed to export .docx. Please try again.'); }
});
document.getElementById('btn-export-doc').addEventListener('click', () => {
  try { exportFrontPageWord('doc'); }
  catch (e) { console.error('DOC export failed:', e); alert('Failed to export .doc. Please try again.'); }
});

// ─── Template Switching (Assignment / Activity Book) ──────────────────────────
let currentTemplate = 'assignment';

const AB_TEMPLATES = {
  idtl:    { course: 'Innovation and Design Thinking Lab',  code: '(B25IDTL18)', lastLabel: 'Name of the Mentor', yearPos: 'mid'  },
  project: { course: 'Interdisciplinary Project Based Learning', code: '(B25PRJ28)', lastLabel: 'Name of the Guide',  yearPos: 'top' }
};

// Activity-book form field -> preview span bindings
const abEls = {
  name:        { input: document.getElementById('f-ab-name'),          out: document.getElementById('t-ab-name') },
  usn:         { input: document.getElementById('f-ab-usn'),           out: document.getElementById('t-ab-usn') },
  branch:      { input: document.getElementById('f-ab-branch'),        out: document.getElementById('t-ab-branch') },
  section:     { input: document.getElementById('f-ab-section'),       out: document.getElementById('t-ab-section') },
  semester:    { input: document.getElementById('f-ab-semester'),      out: document.getElementById('t-ab-semester') },
  teamName:    { input: document.getElementById('f-ab-team-name'),     out: document.getElementById('t-ab-team-name') },
  teamStrength:{ input: document.getElementById('f-ab-team-strength'), out: document.getElementById('t-ab-team-strength') },
  mentor:      { input: document.getElementById('f-ab-mentor'),        out: document.getElementById('t-ab-mentor') }
};
const abYearInput = document.getElementById('f-ab-academic-year');

function syncActivityYear() {
  const meta = AB_TEMPLATES[currentTemplate] || AB_TEMPLATES.idtl;
  const val = abYearInput.value.trim();
  const topEl = document.getElementById('t-ab-year-top');
  const midEl = document.getElementById('t-ab-year-mid');
  if (meta.yearPos === 'top') {
    topEl.textContent = val ? 'Academic Year: ' + val : '';
    topEl.style.display = '';
    midEl.style.display = 'none';
    midEl.textContent = '';
  } else {
    midEl.textContent = val ? 'Academic Year: ' + val : '';
    midEl.style.display = '';
    topEl.style.display = 'none';
    topEl.textContent = '';
  }
}

// Bind activity inputs to preview
Object.values(abEls).forEach(({ input, out }) => {
  input.addEventListener('input', () => { out.textContent = input.value; });
});
abYearInput.addEventListener('input', syncActivityYear);

function getActivePageEl() {
  const pageKey = (currentTemplate === 'assignment') ? 'assignment' : 'activity';
  return document.querySelector('#template-root .page[data-tpl="' + pageKey + '"]')
      || document.querySelector('#template-root .page[data-tpl="assignment"]');
}

function frontFileBase() {
  if (currentTemplate === 'assignment') {
    return 'Chemistry_Front_Page_' + (formEls.studentName.value || 'Student').replace(/\s+/g, '_');
  }
  const tag = currentTemplate === 'project' ? 'Project' : 'IDTL';
  return 'Activity_Book_' + tag + '_' + (abEls.name.input.value || 'Student').replace(/\s+/g, '_');
}

function setGroupDisabled(groupEl, disabled) {
  groupEl.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = disabled; });
}

function switchTemplate(tpl) {
  currentTemplate = tpl;
  const isAssignment = (tpl === 'assignment');

  const asgFields = document.getElementById('assignment-fields');
  const actFields = document.getElementById('activity-fields');
  asgFields.style.display = isAssignment ? '' : 'none';
  actFields.style.display = isAssignment ? 'none' : '';
  // Disable hidden group's controls so they don't block form validation
  setGroupDisabled(asgFields, !isAssignment);
  setGroupDisabled(actFields, isAssignment);

  // Toggle preview pages (idtl/project both use the single "activity" page)
  const activePageKey = isAssignment ? 'assignment' : 'activity';
  document.querySelectorAll('#template-root .page').forEach(pg => {
    pg.style.display = (pg.getAttribute('data-tpl') === activePageKey) ? '' : 'none';
  });

  if (!isAssignment) {
    const meta = AB_TEMPLATES[tpl];
    document.getElementById('t-ab-course').textContent = meta.course;
    document.getElementById('t-ab-code').textContent = meta.code;
    document.getElementById('t-ab-lastlabel').textContent = meta.lastLabel;
    document.getElementById('f-ab-mentor-label').textContent = meta.lastLabel;
    document.getElementById('ab-course-heading').textContent = meta.course;
    syncActivityYear();
  }
  updateZoom();
}

document.getElementById('f-template').addEventListener('change', (e) => switchTemplate(e.target.value));
// Initialize (assignment by default; ensures hidden activity controls start disabled)
switchTemplate(document.getElementById('f-template').value || 'assignment');

// ─── Activity Book Word (.doc/.docx) builder ──────────────────────────────────
function buildActivityBookWordBody() {
  const E = WordExport.esc;
  const P = WordExport.p;
  const meta = AB_TEMPLATES[currentTemplate] || AB_TEMPLATES.idtl;
  const dbit = WordExport.getLogoDataURL('.ab-page img.ab-logo[alt="DBIT"]') || WordExport.getLogoDataURL('img.dbit-logo, img[alt="DBIT"]');
  const way = WordExport.getLogoDataURL('.ab-page img.ab-logo[alt="Wayanamac"]');
  const year = abYearInput.value.trim();
  const yearLine = year ? P('Academic Year: ' + E(year), { size: 13, bold: true, mb: 8 }) : '';

  // Header: 3-column table (logo | centered text | logo)
  let header = '<table width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="92" style="vertical-align:middle;text-align:center;">' +
      (dbit ? '<img src="' + dbit + '" style="height:62pt;" />' : '') +
    '</td>' +
    '<td style="vertical-align:middle;text-align:center;">' +
      P('Wayanamac Education Trust \u00AE', { size: 10, bold: true, italic: true, mb: 1 }) +
      P('DON BOSCO INSTITUTE OF TECHNOLOGY', { size: 16, bold: true, mb: 1 }) +
      P('An Autonomous Institute, Affiliated to VTU, Belagavi', { size: 11, bold: true, mb: 1 }) +
      P('Kumbalagodu, Mysore Road, Bengaluru - 560 074', { size: 10.5, mb: 1 }) +
      P('Ph: +91-80-28437028 / 29 / 30 www.dbit.co.in / www.dbit.edu.in', { size: 10.5 }) +
    '</td>' +
    '<td width="92" style="vertical-align:middle;text-align:center;">' +
      (way ? '<img src="' + way + '" style="height:60pt;" />' : '') +
    '</td>' +
    '</tr></table>';

  let titleBlock =
    P(E(meta.course), { size: 24, bold: true, mt: 30, mb: 4 }) +
    P(E(meta.code), { size: 21, bold: true, mb: 4 }) +
    P('Activity Book', { size: 22, bold: true, mb: 6 });

  // Field rows as a 3-column table (label | : | fill-in line)
  const rows = [
    ['Name of the Student', abEls.name.input.value],
    ['USN', abEls.usn.input.value],
    ['Branch', abEls.branch.input.value],
    ['Section', abEls.section.input.value],
    ['Semester', abEls.semester.input.value],
    ['Team Name', abEls.teamName.input.value],
    ['Team Strength', abEls.teamStrength.input.value],
    [meta.lastLabel, abEls.mentor.input.value]
  ];
  let fields = '<table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24pt;font-family:\'Times New Roman\',Times,serif;font-size:13pt;">';
  rows.forEach(([label, val]) => {
    fields += '<tr>' +
      '<td width="38%" style="padding:8pt 0;">' + E(label) + '</td>' +
      '<td width="3%" style="padding:8pt 0;">:</td>' +
      '<td width="59%" style="padding:8pt 0;border-bottom:1pt solid #000;">' + E(val) + '&nbsp;</td>' +
      '</tr>' +
      '<tr><td colspan="3" style="font-size:4pt;">&nbsp;</td></tr>';
  });
  fields += '</table>';

  const yearTop = (meta.yearPos === 'top') ? '<div style="text-align:center;">' + yearLine + '</div>' : '';
  const yearMid = (meta.yearPos === 'mid') ? '<div style="text-align:left;">' + yearLine + '</div>' : '';

  return header + yearTop + '<div style="text-align:center;">' + titleBlock + '</div>' + yearMid + fields;
}

// ─── Form Auto-Save (localStorage) ────────────────────────────────────────────
(function setupFrontPageCache() {
  const KEY = 'dbit_pagecraft_frontpage';
  const form = document.getElementById('generator-form');

  function collect() {
    const s = {};
    form.querySelectorAll('input[type="text"], select').forEach(el => {
      if (el.id) s[el.id] = el.value;
    });
    return s;
  }

  function apply(s) {
    if (!s) return;
    // Apply template first so the right field group / preview page is active
    if (s['f-template']) {
      const t = document.getElementById('f-template');
      t.value = s['f-template'];
      switchTemplate(t.value);
    }
    Object.keys(s).forEach(id => {
      if (id === 'f-template') return;
      const el = document.getElementById(id);
      if (el) el.value = s[id];
    });
    // Fire listeners so the preview + "Other" toggles update from restored values
    form.querySelectorAll('select').forEach(el => el.dispatchEvent(new Event('input')));
    form.querySelectorAll('input[type="text"]').forEach(el => el.dispatchEvent(new Event('input')));
    if (typeof syncActivityYear === 'function') syncActivityYear();
  }

  apply(FormCache.load(KEY));

  const save = FormCache.debounce(() => FormCache.save(KEY, collect()));
  form.addEventListener('input', save);
  form.addEventListener('change', save);
})();

// ── URL Parameters API ──
// Usage: /?topic=...&subject=...&code=...&degree=...&branch=...&name=...&usn=...&semester=...&section=...&guide=...&guideTitle=...&guideDept=...&download=pdf|png|doc|docx
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
  if (dl === 'doc') setTimeout(() => document.getElementById('btn-export-doc').click(), 1000);
  if (dl === 'docx') setTimeout(() => document.getElementById('btn-export-docx').click(), 1000);
})();
