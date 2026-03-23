/**
 * main.js — Application entry point
 */

import { fetchAllData }                               from './dataLoader.js';
import { extractResumeText }                          from './resumeParser.js';
import { extractKeywords, buildMatchScores }          from './jobMatcher.js';
import {
  renderJobs, renderProfessors,
  populateJobFilters, populateProfessorFilters,
  filterJobs, filterProfessors,
  getResearchAreas,
}                                                     from './renderer.js';
import {
  openEmailModal, generateColdEmail,
  openJobEmailModal, generateJobEmail,
  handleCopyEmail,
}                                                     from './emailGenerator.js';
import {
  openSkillGap, closeSkillGap,
  runSkillGapAnalysis, setResumeText,
}                                                     from './skillGap.js';
import { subscribeToAlerts }                          from './alerts.js';
import {
  showStatus, typewriterEffect,
  animateThinkingSteps, markThinkingComplete,
  resetThinkingSteps,
}                                                     from './ui.js';
import { API_ENDPOINTS }                              from './config.js';

/* ─────────────────────────────────────────────
   MODULE STATE
───────────────────────────────────────────── */
let allJobs       = [];
let allProfessors = [];
let matchedJobs   = {};
let matchedProfs  = {};
let currentTab    = 'jobs';
let selectedFile  = null;

/* ─────────────────────────────────────────────
   DOM REFERENCES
───────────────────────────────────────────── */
const el = {
  totalCount        : document.getElementById('totalCount'),
  tabButtons        : document.querySelectorAll('.tab-btn'),

  jobsGrid          : document.getElementById('jobsGrid'),
  jobsCount         : document.getElementById('jobsCount'),
  jobsTitle         : document.getElementById('jobsTitle'),
  jobSearchInput    : document.getElementById('jobSearchInput'),
  jobLocFilter      : document.getElementById('jobLocationFilter'),
  jobTypeFilter     : document.getElementById('jobTypeFilter'),

  resumeFile        : document.getElementById('resumeFile'),
  uploadArea        : document.getElementById('uploadArea'),
  fileNameDisplay   : document.getElementById('fileNameDisplay'),
  analyzeBtn        : document.getElementById('analyzeBtn'),
  pasteBtn          : document.getElementById('pasteBtn'),
  analysisSection   : document.getElementById('analysisSection'),
  analysisHeader    : document.getElementById('analysisHeader'),
  jobMatchCount     : document.getElementById('jobMatchCount'),
  desktopRow        : document.querySelector('.desktop-row'),
  alertSubscribe    : document.querySelector('.alert-subscribe-section'),

  profsGrid         : document.getElementById('profsGrid'),
  profsCount        : document.getElementById('profsCount'),
  profsTitle        : document.getElementById('profsTitle'),
  profSearchInput   : document.getElementById('profSearchInput'),
  profInstFilter    : document.getElementById('profInstitutionFilter'),
  profDeptFilter    : document.getElementById('profDepartmentFilter'),
  uploadAreaResearch: document.getElementById('uploadAreaResearch'),
  fileNameDisplayR  : document.getElementById('fileNameDisplayResearch'),
  analyzeBtnR       : document.getElementById('analyzeBtnResearch'),
  pasteBtnR         : document.getElementById('pasteBtnResearch'),
  analysisSectionR  : document.getElementById('analysisSectionResearch'),
  analysisHeaderR   : document.getElementById('analysisHeaderResearch'),
  profMatchCount    : document.getElementById('profMatchCount'),

  pasteModal    : document.getElementById('pasteModal'),
  pasteTextarea : document.getElementById('pasteTextarea'),
  modalClose    : document.getElementById('modalClose'),
  cancelPaste   : document.getElementById('cancelPaste'),
  analyzePasted : document.getElementById('analyzePasted'),
};

/* ─────────────────────────────────────────────
   GRID LAYOUT — show alert card → 2 columns
───────────────────────────────────────────── */
function showAlertCard() {
  if (!el.alertSubscribe || !el.desktopRow) return;
  el.alertSubscribe.style.display = 'block';
  if (window.innerWidth >= 1024) {
    el.desktopRow.style.gridTemplateColumns = '1fr 1fr';
  }
}

window.addEventListener('resize', () => {
  if (el.alertSubscribe && el.alertSubscribe.style.display !== 'none' && el.desktopRow) {
    el.desktopRow.style.gridTemplateColumns = window.innerWidth >= 1024 ? '1fr 1fr' : '1fr';
  }
});

/* ─────────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────────── */
el.tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    el.tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
    currentTab = btn.dataset.tab;
  });
});

/* ─────────────────────────────────────────────
   FILTERS
───────────────────────────────────────────── */
function applyJobFilters() {
  const filtered = filterJobs(allJobs, el.jobSearchInput.value, el.jobLocFilter.value, el.jobTypeFilter.value);
  renderJobs(filtered, matchedJobs, el.jobsGrid, el.jobsTitle);
  el.jobsCount.textContent = `${filtered.length} Jobs`;
}

function applyProfessorFilters() {
  const filtered = filterProfessors(allProfessors, el.profSearchInput.value, el.profInstFilter.value, el.profDeptFilter.value);
  renderProfessors(filtered, matchedProfs, el.profsGrid, el.profsTitle);
  el.profsCount.textContent = `${filtered.length} Professors`;
}

[el.jobSearchInput, el.jobLocFilter, el.jobTypeFilter].forEach(e => e?.addEventListener('input', applyJobFilters));
[el.profSearchInput, el.profInstFilter, el.profDeptFilter].forEach(e => e?.addEventListener('input', applyProfessorFilters));

/* ─────────────────────────────────────────────
   COLLAPSE TOGGLE
───────────────────────────────────────────── */
el.analysisHeader?.addEventListener('click',  () => el.analysisSection.classList.toggle('collapsed'));
el.analysisHeaderR?.addEventListener('click', () => el.analysisSectionR.classList.toggle('collapsed'));

/* ─────────────────────────────────────────────
   FILE UPLOAD
───────────────────────────────────────────── */
function onFileSelected(file) {
  if (!file) return;
  selectedFile = file;
  const label  = `📄 ${file.name}`;
  el.fileNameDisplay.textContent  = label;
  el.fileNameDisplay.style.display = 'block';
  el.analyzeBtn.disabled          = false;
  el.fileNameDisplayR.textContent = label;
  el.fileNameDisplayR.style.display = 'block';
  el.analyzeBtnR.disabled         = false;
}

el.uploadArea?.addEventListener('click', () => el.resumeFile.click());
el.uploadAreaResearch?.addEventListener('click', () => el.resumeFile.click());
el.resumeFile?.addEventListener('change', e => onFileSelected(e.target.files[0]));

['dragover','dragleave','drop'].forEach(evt => {
  [el.uploadArea, el.uploadAreaResearch].forEach(area => {
    area?.addEventListener(evt, e => {
      e.preventDefault();
      if (evt === 'dragover') area.classList.add('dragover');
      else area.classList.remove('dragover');
      if (evt === 'drop') onFileSelected(e.dataTransfer.files[0]);
    });
  });
});

/* ─────────────────────────────────────────────
   PASTE MODAL
───────────────────────────────────────────── */
el.pasteBtn?.addEventListener('click',  () => { el.pasteModal.classList.add('active'); el.pasteTextarea.focus(); });
el.pasteBtnR?.addEventListener('click', () => { el.pasteModal.classList.add('active'); el.pasteTextarea.focus(); });
el.modalClose?.addEventListener('click',  () => el.pasteModal.classList.remove('active'));
el.cancelPaste?.addEventListener('click', () => el.pasteModal.classList.remove('active'));

el.analyzePasted?.addEventListener('click', async () => {
  const text = el.pasteTextarea.value.trim();
  if (!text) { showStatus('Please paste your resume text', 'error'); return; }
  el.pasteModal.classList.remove('active');
  if (currentTab === 'jobs') await triggerJobAnalysis(text);
  else await triggerResearchAnalysis(text);
});

/* ─────────────────────────────────────────────
   ANALYZE BUTTONS
───────────────────────────────────────────── */
el.analyzeBtn?.addEventListener('click', async () => {
  if (!selectedFile) return;
  setButtonLoading(el.analyzeBtn, true);
  try {
    const text = await extractResumeText(selectedFile);
    validateResumeText(text);
    await triggerJobAnalysis(text);
  } catch (err) {
    showStatus(err.message || 'Analysis failed', 'error');
    showThinkingError('thinkingStream', err.message);
  } finally { setButtonLoading(el.analyzeBtn, false); }
});

el.analyzeBtnR?.addEventListener('click', async () => {
  if (!selectedFile) return;
  setButtonLoading(el.analyzeBtnR, true);
  try {
    const text = await extractResumeText(selectedFile);
    validateResumeText(text);
    await triggerResearchAnalysis(text);
  } catch (err) {
    showStatus(err.message || 'Analysis failed', 'error');
    showThinkingError('thinkingStreamResearch', err.message);
  } finally { setButtonLoading(el.analyzeBtnR, false); }
});

/* ─────────────────────────────────────────────
   RESUME ANALYSIS — JOBS
───────────────────────────────────────────── */
const JOB_STEP_ICONS = ['📄','🔍','🧠','⚡','✅'];

async function triggerJobAnalysis(resumeTextInput) {
  setResumeText(resumeTextInput);
  el.analysisSection.classList.add('active');
  el.analysisSection.classList.remove('collapsed');
  document.getElementById('analysisContent').style.display = 'none';

  const thinkBox    = document.getElementById('thinkingBox');
  const thinkStream = document.getElementById('thinkingStream');
  thinkBox.style.display  = 'block';
  thinkStream.textContent = '';
  resetThinkingSteps('step', 5, JOB_STEP_ICONS, 'thinkingBox');

  const [analysis] = await Promise.all([
    callAnalyzeAPI(resumeTextInput),
    animateThinkingSteps('step', 5, 700),
  ]);

  markThinkingComplete('step', 5, 'thinkingBox');
  await typewriterEffect(thinkStream, analysis, 6);

  const keywords = extractKeywords(`${resumeTextInput} ${analysis}`, 50);
  matchedJobs    = buildMatchScores(allJobs, keywords, ['Company','Role','Description','JobType'], job => job.Company + job.Role);

  el.jobMatchCount.textContent = `${Object.keys(matchedJobs).length} Matches`;
  applyJobFilters();
  showStatus('Resume analyzed! Scroll down to see matched jobs.', 'success');
  showAlertCard();

  setTimeout(() => {
    el.analysisSection.classList.add('collapsed');
    setTimeout(() => {
      const f = document.querySelector('.job-card.matched');
      if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, 3000);
}

/* ─────────────────────────────────────────────
   RESUME ANALYSIS — RESEARCH
───────────────────────────────────────────── */
const RESEARCH_STEP_ICONS = ['📄','🔍','🧪','🏛️','✅'];

async function triggerResearchAnalysis(resumeTextInput) {
  setResumeText(resumeTextInput);
  el.analysisSectionR.classList.add('active');
  el.analysisSectionR.classList.remove('collapsed');
  document.getElementById('analysisContentResearch').style.display = 'none';

  const thinkBoxR    = document.getElementById('thinkingBoxResearch');
  const thinkStreamR = document.getElementById('thinkingStreamResearch');
  thinkBoxR.style.display  = 'block';
  thinkStreamR.textContent = '';
  resetThinkingSteps('stepR', 5, RESEARCH_STEP_ICONS, 'thinkingBoxResearch');

  const [analysis] = await Promise.all([
    callAnalyzeAPI(resumeTextInput),
    animateThinkingSteps('stepR', 5, 700),
  ]);

  markThinkingComplete('stepR', 5, 'thinkingBoxResearch');
  await typewriterEffect(thinkStreamR, analysis, 6);

  const kws  = extractKeywords(`${resumeTextInput} ${analysis}`, 50);
  matchedProfs = {};
  allProfessors.forEach(prof => {
    const areas    = getResearchAreas(prof);
    const haystack = `${prof.Name} ${prof.Department} ${areas}`.toLowerCase();
    let score = 0;
    kws.forEach(kw => {
      if (haystack.includes(kw)) score += 2;
      const parts = kw.split(/\s+/);
      if (parts.length > 1 && parts.every(p => haystack.includes(p))) score += 1;
    });
    if (score > 0) matchedProfs[prof.Name + prof['College Name']] = Math.min(100, score * 8);
  });

  el.profMatchCount.textContent = `${Object.keys(matchedProfs).length} Matches`;
  applyProfessorFilters();
  showStatus('Resume analyzed! Scroll down to see matched professors.', 'success');

  setTimeout(() => {
    el.analysisSectionR.classList.add('collapsed');
    setTimeout(() => {
      const f = document.querySelector('.professor-card.matched');
      if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, 3000);
}

/* ─────────────────────────────────────────────
   API
───────────────────────────────────────────── */
async function callAnalyzeAPI(resumeText) {
  const res = await fetch(API_ENDPOINTS.analyze, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume: resumeText }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to analyze'); }
  const data = await res.json();
  return data.result || '';
}

/* ─────────────────────────────────────────────
   SHARE — proper bottom sheet / modal
───────────────────────────────────────────── */
async function shareJob(d) {
  const shareText = `🚀 Job Opportunity!\n\n🏢 ${d.company}\n💼 ${d.role}${d.location ? '\n📍 ' + d.location : ''}${d.stipend ? '\n💰 ' + d.stipend : ''}\n\nvia CareerLift`;
  const shareUrl  = d.applyLink || window.location.href;

  // Native share (mobile browsers)
  if (navigator.share) {
    try {
      await navigator.share({ title: `${d.role} at ${d.company}`, text: shareText, url: shareUrl });
      return;
    } catch { /* user cancelled or not supported — fall through */ }
  }

  // Custom share sheet
  const overlay = document.createElement('div');
  overlay.className = 'share-overlay';

  overlay.innerHTML = `
    <div class="share-sheet">
      <div class="share-handle"></div>
      <div class="share-job-title">${d.role}</div>
      <div class="share-job-meta">${d.company}${d.location ? ' · ' + d.location : ''}${d.stipend ? ' · ' + d.stipend : ''}</div>
      <div class="share-divider"></div>

      <a href="https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}"
         target="_blank" class="share-btn" id="shareWA">
        <div class="share-btn-icon wa"><i class="fab fa-whatsapp"></i></div>
        <span>Share on WhatsApp</span>
      </a>

      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}"
         target="_blank" class="share-btn" id="shareLI">
        <div class="share-btn-icon li"><i class="fab fa-linkedin"></i></div>
        <span>Share on LinkedIn</span>
      </a>

      <button class="share-btn" id="shareCopy">
        <div class="share-btn-icon cp"><i class="fas fa-link"></i></div>
        <span>Copy Link</span>
      </button>

      <div class="share-divider"></div>
      <div class="share-cancel" id="shareCancel">Cancel</div>
    </div>`;

  document.body.appendChild(overlay);

  // Copy link handler
  overlay.querySelector('#shareCopy').addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = overlay.querySelector('#shareCopy');
      btn.querySelector('span').textContent = 'Copied!';
      btn.querySelector('.share-btn-icon').style.color = 'var(--green)';
      setTimeout(() => overlay.remove(), 1200);
    });
  });

  // Close handlers
  overlay.querySelector('#shareCancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // Close on link click
  ['#shareWA','#shareLI'].forEach(id => {
    overlay.querySelector(id)?.addEventListener('click', () => {
      setTimeout(() => overlay.remove(), 300);
    });
  });
}

/* ─────────────────────────────────────────────
   MODAL EVENT LISTENERS
───────────────────────────────────────────── */
document.getElementById('skillGapModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('skillGapModal')) closeSkillGap();
});
document.getElementById('emailModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('emailModal')) document.getElementById('emailModal').classList.remove('active');
});
document.getElementById('jobEmailModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('jobEmailModal')) document.getElementById('jobEmailModal').classList.remove('active');
});

document.getElementById('emailModalClose')?.addEventListener('click',    () => document.getElementById('emailModal').classList.remove('active'));
document.getElementById('jobEmailModalClose')?.addEventListener('click', () => document.getElementById('jobEmailModal').classList.remove('active'));
document.getElementById('skillGapClose')?.addEventListener('click', closeSkillGap);

document.getElementById('generateEmailBtn')?.addEventListener('click',    generateColdEmail);
document.getElementById('regenerateBtn')?.addEventListener('click',       generateColdEmail);
document.getElementById('generateJobEmailBtn')?.addEventListener('click', generateJobEmail);
document.getElementById('regenerateJobBtn')?.addEventListener('click',    generateJobEmail);

document.getElementById('copyEmailBtn')?.addEventListener('click',    () => handleCopyEmail('generatedEmailText',    'copyEmailBtn'));
document.getElementById('copyJobEmailBtn')?.addEventListener('click', () => handleCopyEmail('generatedJobEmailText', 'copyJobEmailBtn'));

document.getElementById('analyzeGapBtn')?.addEventListener('click', runSkillGapAnalysis);
document.getElementById('alertEmail')?.addEventListener('keypress', e => { if (e.key === 'Enter') subscribeToAlerts(); });

/* ─────────────────────────────────────────────
   EXPOSE TO WINDOW
───────────────────────────────────────────── */
window.openEmailModal    = openEmailModal;
window.openJobEmailModal = openJobEmailModal;
window.openSkillGap      = openSkillGap;
window.shareJob          = shareJob;
window.subscribeToAlerts = subscribeToAlerts;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function setButtonLoading(btn, loading) {
  if (loading) { btn._orig = btn.innerHTML; btn.innerHTML = '<span class="loading"></span> Analyzing...'; btn.disabled = true; }
  else { btn.innerHTML = btn._orig || 'Analyze Resume'; btn.disabled = false; }
}
function validateResumeText(text) {
  if (!text || text.trim().length < 10) throw new Error('File appears to be empty or unreadable.');
}
function showThinkingError(streamId, message) {
  const s = document.getElementById(streamId);
  if (s) s.textContent = `Error: ${message}\n\nPlease try again or paste your resume text.`;
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
async function init() {
  el.jobsGrid.innerHTML  = `<div class="empty-state"><div class="empty-icon"><span class="loading"></span></div><h3 class="empty-title">Loading jobs…</h3></div>`;
  el.profsGrid.innerHTML = `<div class="empty-state"><div class="empty-icon"><span class="loading"></span></div><h3 class="empty-title">Loading research opportunities…</h3></div>`;

  try {
    const { jobs, professors } = await fetchAllData();
    allJobs       = jobs;
    allProfessors = professors;

    populateJobFilters(allJobs, el.jobLocFilter, el.jobTypeFilter);
    populateProfessorFilters(allProfessors, el.profInstFilter, el.profDeptFilter);
    applyJobFilters();
    applyProfessorFilters();

    el.totalCount.style.display = 'inline-block';
    el.totalCount.innerHTML =
      `${allJobs.length} Jobs · ${allProfessors.length} Research`;

    showStatus(`Loaded ${allJobs.length} jobs & ${allProfessors.length} research opportunities.`, 'success');
  } catch {
    const errHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div><h3 class="empty-title">Failed to load data</h3><p class="empty-text">Check your internet connection and refresh</p></div>`;
    el.jobsGrid.innerHTML  = errHTML;
    el.profsGrid.innerHTML = errHTML;
    showStatus('Failed to load data', 'error');
  }
}

init();
