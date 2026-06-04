// ── Project Report Generator Script ─────────────────────────────────────────

// ── Analytics ──
const SUPABASE_URL = 'https://jkhxpdsyouecsjresikt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpraHhwZHN5b3VlY3NqcmVzaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjU3MzAsImV4cCI6MjA5NjE0MTczMH0.ulmw1uPs9z3fUNll88h06g_8VetZgwVjZYJq1cOCBQ0';

async function logGeneration(type) {
  try {
    const students = getStudents();
    await fetch(`${SUPABASE_URL}/rest/v1/generations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        page: 'project-report',
        type,
        student_name: students[0]?.name || '',
        usn: students[0]?.usn || '',
        subject: document.getElementById('f-project-title')?.value || '',
        semester: getVal('semester'),
        branch: getVal('branch'),
      })
    });
  } catch (_) {}
}

// ── "Other" fields ──
const otherFields = {
  phase:    { select: document.getElementById('f-phase'),    input: document.getElementById('f-phase-other') },
  degree:   { select: document.getElementById('f-degree'),   input: document.getElementById('f-degree-other') },
  branch:   { select: document.getElementById('f-branch'),   input: document.getElementById('f-branch-other') },
  semester: { select: document.getElementById('f-semester'),  input: document.getElementById('f-semester-other') },
};

function getVal(key) {
  if (otherFields[key]) {
    const { select, input } = otherFields[key];
    return select.value === '__other__' ? input.value : select.value;
  }
  return '';
}

Object.entries(otherFields).forEach(([key, { select, input }]) => {
  select.addEventListener('input', () => {
    input.style.display = select.value === '__other__' ? 'block' : 'none';
    input.required = select.value === '__other__';
    updatePreview();
  });
  input.addEventListener('input', updatePreview);
});

// ── Students ──
const studentsContainer = document.getElementById('students-container');
document.getElementById('btn-add-student').addEventListener('click', () => {
  const n = studentsContainer.children.length + 1;
  const div = document.createElement('div');
  div.className = 'student-entry';
  div.innerHTML = `<div class="form-row">
    <div class="form-group"><label>Name</label><input type="text" class="s-name" placeholder="Student ${n} Name" required></div>
    <div class="form-group"><label>USN</label><input type="text" class="s-usn" placeholder="USN" required></div>
    <button type="button" class="btn-remove-student" title="Remove">&times;</button>
  </div>`;
  studentsContainer.appendChild(div);
  div.querySelectorAll('input').forEach(i => i.addEventListener('input', updatePreview));
  div.querySelector('.btn-remove-student').addEventListener('click', () => { div.remove(); updatePreview(); });
});
studentsContainer.querySelectorAll('input').forEach(i => i.addEventListener('input', updatePreview));
studentsContainer.querySelectorAll('.btn-remove-student').forEach(btn => {
  btn.addEventListener('click', () => { btn.closest('.student-entry').remove(); updatePreview(); });
});

function getStudents() {
  const entries = studentsContainer.querySelectorAll('.student-entry');
  const students = [];
  entries.forEach(e => {
    const name = e.querySelector('.s-name').value.trim();
    const usn = e.querySelector('.s-usn').value.trim();
    if (name || usn) students.push({ name, usn });
  });
  return students;
}

// ── Bind all inputs ──
document.querySelectorAll('#generator-form input[type="text"], #generator-form select').forEach(el => {
  el.addEventListener('input', updatePreview);
});

// ── Update Preview ──
function updatePreview() {
  const projectTitle = document.getElementById('f-project-title').value.trim();
  const phase = getVal('phase');
  const degree = getVal('degree');
  const branch = getVal('branch');
  const semester = getVal('semester');
  const academicYear = document.getElementById('f-academic-year').value.trim();
  const department = document.getElementById('f-department').value.trim();
  const departmentFull = document.getElementById('f-department-full').value.trim();
  const guideName = document.getElementById('f-guide-name').value.trim();
  const guideTitle = document.getElementById('f-guide-title').value.trim();
  const hodName = document.getElementById('f-hod-name').value.trim();
  const hodQualification = document.getElementById('f-hod-qualification').value.trim();
  const hodTitle = document.getElementById('f-hod-title').value.trim();
  const principalName = document.getElementById('f-principal-name').value.trim();
  const principalQualification = document.getElementById('f-principal-qualification').value.trim();
  const coordinatorName = document.getElementById('f-coordinator-name').value.trim();
  const coordinatorTitle = document.getElementById('f-coordinator-title').value.trim();
  const students = getStudents();
  const deptUpper = departmentFull.toUpperCase();

  // ══════════ PAGE 1: TITLE PAGE ══════════
  setText('t-phase', phase);
  setText('t-project-title', projectTitle ? `\u201C${projectTitle}\u201D` : '');
  setText('t-degree', degree);
  setText('t-branch', branch);
  setText('t-academic-year', academicYear);
  setText('t-department-upper', deptUpper);
  setText('t-guide-name-p1', guideName.toUpperCase());
  setText('t-guide-title-p1', guideTitle);
  setText('t-guide-dept-p1', `Department of ${department}`);

  // Students table on title page
  const tableEl = document.getElementById('t-students-table');
  if (students.length) {
    tableEl.innerHTML = '<table>' + students.map(s =>
      `<tr><td>${esc(s.name.toUpperCase())}</td><td>${esc(s.usn)}</td></tr>`
    ).join('') + '</table>';
  } else {
    tableEl.innerHTML = '';
  }

  // ══════════ PAGE 2: CERTIFICATE ══════════
  setText('t2-department-upper', deptUpper);
  setText('t2-guide-name', guideName);
  setText('t2-guide-title-cert', guideTitle);
  setText('t2-guide-dept', `Department of ${department}`);
  setText('t2-hod-name', hodName);
  setText('t2-hod-qualification', hodQualification);
  setText('t2-hod-title', hodTitle);
  setText('t2-hod-dept', `Department of ${department}`);
  setText('t2-principal-name', principalName);
  setText('t2-principal-qualification', principalQualification);

  // Certificate body - exact wording from PDF
  const studentsStrCert = students.map(s => `<strong>${esc(s.name)} (${esc(s.usn)})</strong>`).join(', ');
  document.getElementById('t-cert-body').innerHTML =
    `<p>This is to certify that the Project Work \u201C<strong>${esc(projectTitle)}</strong>\u201D has been carried out by ${studentsStrCert || '________'} the bonafide students of <strong>Don Bosco Institute of Technology, Bengaluru</strong>, in the partial fulfillment for award of Degree of <strong>${esc(degree)} in ${esc(branch)}</strong> of <strong>Visvesvaraya Technological University, Belagavi</strong>, during the academic year ${esc(academicYear)}. The Project Work has been approved as it satisfies the academic requirements in respect of the Project Work prescribed for the ${esc(degree)} Degree.</p>`;

  // ══════════ PAGE 3: DECLARATION ══════════
  setText('t3-department-upper', deptUpper);

  // Declaration body - exact wording from PDF
  const studentsStrDecl = students.map(s => `<strong>${esc(s.name)} (${esc(s.usn)})</strong>`).join(', ');
  document.getElementById('t-decl-body').innerHTML =
    `<p>We, ${studentsStrDecl || '________'} students of ${esc(semester)} semester B.E, at the Department of ${esc(branch)}, Don Bosco Institute of Technology, Bengaluru, declare that the Project Work entitled \u201C<strong>${esc(projectTitle)}</strong>\u201D has been carried out by us and submitted in partial fulfillment of the course requirements for the award of degree in <strong>${esc(degree)}</strong> in <strong>${esc(branch)}</strong> of <strong>Visvesvaraya Technological University, Belagavi</strong> during the academic year <strong>${esc(academicYear)}</strong>. The Project Work has been approved as it satisfies the academic requirements for the award of ${esc(degree)} Degree.</p>`;

  // Declaration student signatures
  const declSigs = document.getElementById('t-decl-students');
  if (students.length) {
    declSigs.innerHTML = '<table>' + students.map(s =>
      `<tr><td>${esc(s.name)}</td><td>(${esc(s.usn)})</td></tr>`
    ).join('') + '</table>';
  } else {
    declSigs.innerHTML = '';
  }

  // ══════════ PAGE 4: ACKNOWLEDGEMENT ══════════
  document.getElementById('t-ack-body').innerHTML = `
    <p>The satisfaction and euphoria that accompany the successful completion of any project is incomplete without mention of the people who made it possible and under whose constant guidance and encouragement the task was complete.</p>
    <p>We express our sincere gratitude to <strong>${esc(principalName)}, Principal and Management, Don Bosco Institute of Technology, Bengaluru</strong> for his timely help and inspiration during tenure of the course.</p>
    <p>We express our profuse gratitude to <strong>${esc(hodName)}</strong>, Professor and <strong>Head of the Department of ${esc(departmentFull)}</strong>, for his timely co-operation while carrying the Project Work.</p>
    <p>We express our profuse gratitude to <strong>${esc(guideName)}, ${esc(guideTitle)}, Department of ${esc(departmentFull)}</strong>, Don Bosco Institute of Technology, Bengaluru, for guiding us with numerous helpful discussions. We also thank our guide for valuable guidance, encouragement and inspiration for carrying out the Project Work.${coordinatorName ? ` We express our acknowledgement to our project coordinator <strong>${esc(coordinatorName)}, ${esc(coordinatorTitle)},</strong> ${esc(department)} Dept. for extending her direction and support during the completion of Project.` : ''}</p>
    <p>We would like to express our heartfelt gratitude to Teaching Faculty Members &amp; Non-Teaching staff members, who have directly or indirectly helped us in completion of the Project Work successfully.</p>
  `;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Zoom Controls ──
let zoomLevel = window.innerWidth <= 768 ? 0.3 : 0.55;
const templateRoot = document.getElementById('template-root');
const zoomLevelText = document.getElementById('zoom-level');

function updateZoom() {
  templateRoot.style.transform = `scale(${zoomLevel})`;
  zoomLevelText.textContent = `${Math.round(zoomLevel * 100)}%`;
}
document.getElementById('btn-zoom-in').addEventListener('click', () => { if (zoomLevel < 1.5) { zoomLevel += 0.1; updateZoom(); } });
document.getElementById('btn-zoom-out').addEventListener('click', () => { if (zoomLevel > 0.2) { zoomLevel -= 0.1; updateZoom(); } });
updateZoom();

// ── Desktop-mode capture ──
async function capturePageDesktopMode(pageEl, renderScale) {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const originalViewport = viewportMeta ? viewportMeta.content : null;
  const originalTransform = templateRoot.style.transform;

  try {
    if (viewportMeta) viewportMeta.content = 'width=1200, initial-scale=1';
    templateRoot.style.transform = 'scale(1)';
    templateRoot.style.transformOrigin = 'top center';
    await new Promise(r => setTimeout(r, 300));

    const canvas = await html2canvas(pageEl, {
      scale: renderScale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      scrollX: 0, scrollY: 0,
      windowWidth: 1200, windowHeight: 900,
    });
    return canvas;
  } finally {
    if (viewportMeta && originalViewport) viewportMeta.content = originalViewport;
    templateRoot.style.transform = originalTransform;
    updateZoom();
  }
}

// ── Get selected page indices ──
function getSelectedPages() {
  return [...document.querySelectorAll('.page-cb:checked')].map(cb => parseInt(cb.value));
}

// ── PDF Generation (selected pages) ──
document.getElementById('btn-download').addEventListener('click', async () => {
  const selected = getSelectedPages();
  if (!selected.length) { alert('Select at least one page to download.'); return; }

  const btn = document.getElementById('btn-download');
  const originalText = btn.innerHTML;
  btn.innerText = 'Generating PDF...';
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pages = document.querySelectorAll('#template-root .page');
    let first = true;
    for (const idx of selected) {
      if (!first) pdf.addPage();
      first = false;
      const canvas = await capturePageDesktopMode(pages[idx], 2);
      const imgData = canvas.toDataURL('image/png');
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    const students = getStudents();
    const fileName = `Project_Report_${(students[0]?.name || 'Report').replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
    logGeneration('REPORT_PDF');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// ── PDF Merge ──
const uploadInput = document.getElementById('f-upload-pdf');
const uploadFilename = document.getElementById('upload-filename');
const uploadLabel = document.getElementById('upload-label');
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

  const originalText = mergeBtn.innerHTML;
  mergeBtn.innerText = 'Merging...';
  mergeBtn.disabled = true;

  try {
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();
    const a4 = { width: 595.28, height: 841.89 };

    const pages = document.querySelectorAll('#template-root .page');
    for (const pageEl of pages) {
      const canvas = await capturePageDesktopMode(pageEl, 2);
      const imgData = canvas.toDataURL('image/png');
      const base64 = imgData.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const tempDoc = await PDFDocument.create();
      const pngImage = await tempDoc.embedPng(imgBytes);
      const p = tempDoc.addPage([a4.width, a4.height]);
      p.drawImage(pngImage, { x: 0, y: 0, width: a4.width, height: a4.height });
      const [copied] = await merged.copyPages(tempDoc, [0]);
      merged.addPage(copied);
    }

    const uploadedBytes = await file.arrayBuffer();
    const uploadedPdf = await PDFDocument.load(uploadedBytes);
    const indices = Array.from({ length: uploadedPdf.getPageCount() }, (_, i) => i);
    const copiedPages = await merged.copyPages(uploadedPdf, indices);
    copiedPages.forEach(p => merged.addPage(p));

    const mergedBytes = await merged.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const students = getStudents();
    a.download = `Project_Report_Full_${(students[0]?.name || 'Report').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logGeneration('REPORT_MERGE');
  } catch (err) {
    console.error('Merge failed:', err);
    alert('Failed to merge PDFs. Please try again.');
  } finally {
    mergeBtn.innerHTML = originalText;
    mergeBtn.disabled = false;
  }
});

// Initial render
updatePreview();

// ── Fill Demo Data ──
document.getElementById('btn-fill-demo').addEventListener('click', () => {
  document.getElementById('f-project-title').value = 'GESTURE2SPEECH: AI POWERED SIGN LANGUAGE INTERPRETATION SYSTEM';
  document.getElementById('f-phase').value = 'Phase-1';
  document.getElementById('f-degree').value = 'Bachelor of Engineering';
  document.getElementById('f-branch').value = 'Computer Science and Engineering';
  document.getElementById('f-semester').value = 'sixth';
  document.getElementById('f-academic-year').value = '2025-2026';
  document.getElementById('f-department').value = 'CS&E';
  document.getElementById('f-department-full').value = 'Computer Science & Engineering';
  document.getElementById('f-guide-name').value = 'HEMALATHA M';
  document.getElementById('f-guide-title').value = 'Assistant Professor';
  document.getElementById('f-hod-name').value = 'Dr. K B ShivaKumar';
  document.getElementById('f-hod-qualification').value = 'B.E, M.E, M.B.A, M.Phil, Ph.D';
  document.getElementById('f-hod-title').value = 'Professor and Head';
  document.getElementById('f-principal-name').value = 'Dr. Naghabhushana B S';
  document.getElementById('f-principal-qualification').value = 'B.E, M.Tech, Ph.D';
  document.getElementById('f-coordinator-name').value = 'Dr. Hemanth Kumar N P';
  document.getElementById('f-coordinator-title').value = 'Associate Professor';

  // Students
  const demoStudents = [
    { name: 'MAHESH KUMAR G', usn: '1DB23CS124' },
    { name: 'HRITTIK M', usn: '1DB23CS085' },
    { name: 'MITHUN N', usn: '1DB23CS131' },
    { name: 'JAYANTH K', usn: '1DB23CS091' },
  ];
  studentsContainer.innerHTML = '';
  demoStudents.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'student-entry';
    div.innerHTML = `<div class="form-row">
      <div class="form-group"><label>Name</label><input type="text" class="s-name" value="${s.name}" required></div>
      <div class="form-group"><label>USN</label><input type="text" class="s-usn" value="${s.usn}" required></div>
      <button type="button" class="btn-remove-student" title="Remove">&times;</button>
    </div>`;
    studentsContainer.appendChild(div);
    div.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updatePreview));
    div.querySelector('.btn-remove-student').addEventListener('click', () => { div.remove(); updatePreview(); });
  });

  updatePreview();
});

// ── URL Parameters API ──
// Usage: /project-report?title=...&phase=...&degree=...&branch=...&semester=...&year=...&dept=...&deptFull=...&guide=...&guideTitle=...&hod=...&hodQual=...&hodTitle=...&principal=...&principalQual=...&coordinator=...&coordinatorTitle=...&students=Name1:USN1,Name2:USN2&download=true&pages=0,1,2,3
(function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('title') && !params.has('download')) return;

  const fieldMap = {
    title: 'f-project-title',
    phase: 'f-phase',
    degree: 'f-degree',
    branch: 'f-branch',
    semester: 'f-semester',
    year: 'f-academic-year',
    dept: 'f-department',
    deptFull: 'f-department-full',
    guide: 'f-guide-name',
    guideTitle: 'f-guide-title',
    hod: 'f-hod-name',
    hodQual: 'f-hod-qualification',
    hodTitle: 'f-hod-title',
    principal: 'f-principal-name',
    principalQual: 'f-principal-qualification',
    coordinator: 'f-coordinator-name',
    coordinatorTitle: 'f-coordinator-title',
  };

  // Fill fields
  for (const [param, elId] of Object.entries(fieldMap)) {
    const val = params.get(param);
    if (!val) continue;
    const el = document.getElementById(elId);
    if (!el) continue;
    if (el.tagName === 'SELECT') {
      // Try to match an option, otherwise use __other__
      const opt = [...el.options].find(o => o.value === val);
      if (opt) { el.value = val; }
      else {
        el.value = '__other__';
        const otherInput = document.getElementById(elId + '-other');
        if (otherInput) { otherInput.style.display = 'block'; otherInput.value = val; }
      }
    } else {
      el.value = val;
    }
  }

  // Students: format "Name1:USN1,Name2:USN2"
  const studentsParam = params.get('students');
  if (studentsParam) {
    studentsContainer.innerHTML = '';
    studentsParam.split(',').forEach(s => {
      const [name, usn] = s.split(':');
      if (!name) return;
      const div = document.createElement('div');
      div.className = 'student-entry';
      div.innerHTML = `<div class="form-row">
        <div class="form-group"><label>Name</label><input type="text" class="s-name" value="${name.trim()}" required></div>
        <div class="form-group"><label>USN</label><input type="text" class="s-usn" value="${(usn||'').trim()}" required></div>
        <button type="button" class="btn-remove-student" title="Remove">&times;</button>
      </div>`;
      studentsContainer.appendChild(div);
      div.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updatePreview));
      div.querySelector('.btn-remove-student').addEventListener('click', () => { div.remove(); updatePreview(); });
    });
  }

  // Pages selection
  const pagesParam = params.get('pages');
  if (pagesParam) {
    const selected = pagesParam.split(',').map(Number);
    document.querySelectorAll('.page-cb').forEach(cb => {
      cb.checked = selected.includes(parseInt(cb.value));
    });
  }

  updatePreview();

  // Auto-download
  if (params.get('download') === 'true') {
    setTimeout(() => document.getElementById('btn-download').click(), 1000);
  }
})();
