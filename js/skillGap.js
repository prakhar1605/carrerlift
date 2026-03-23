/**
 * skillGap.js
 * Skill Gap Analyzer modal — open, run analysis, display results.
 */

import { API_ENDPOINTS } from './config.js';
import { showStatus }    from './ui.js';

/* ── Module state ── */
let currentJobData   = null;

/** Reference to the currently stored resume text (set by main.js). */
export let resumeText = '';
export function setResumeText(text) { resumeText = text; }

/* ─────────────────────────────────────────────
   OPEN / CLOSE
───────────────────────────────────────────── */

export function openSkillGap(jobData) {
  currentJobData = jobData;

  document.getElementById('sgJobCompany').textContent = jobData.company || 'Company';
  document.getElementById('sgJobRole').textContent    = jobData.role    || 'Role';

  // Reset previous results
  document.getElementById('gapResults').classList.remove('active');
  const btn = document.getElementById('analyzeGapBtn');
  btn.innerHTML = '<i class="fas fa-chart-bar"></i> Analyze My Skill Gap';
  btn.disabled  = false;

  // Show warning if no resume uploaded yet
  const warning = document.getElementById('sgResumeWarning');
  if (!resumeText) {
    warning.style.display = 'flex';
    btn.disabled = true;
  } else {
    warning.style.display = 'none';
    btn.disabled = false;
  }

  document.getElementById('skillGapModal').classList.add('active');
}

export function closeSkillGap() {
  document.getElementById('skillGapModal').classList.remove('active');
}

/* ─────────────────────────────────────────────
   RUN ANALYSIS
───────────────────────────────────────────── */

export async function runSkillGapAnalysis() {
  if (!resumeText) { showStatus('Please upload your resume first!', 'error'); return; }

  const btn = document.getElementById('analyzeGapBtn');
  btn.innerHTML = '<span class="loading"></span> Analyzing your fit...';
  btn.disabled  = true;

  try {
    const response = await fetch(API_ENDPOINTS.skillGap, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        resume        : resumeText,
        jobTitle      : currentJobData.role,
        jobDescription: currentJobData.description,
        jobCompany    : currentJobData.company,
      }),
    });

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();
    if (!data.success || !data.analysis) throw new Error('Invalid response');

    displaySkillGapResults(data.analysis);
  } catch {
    showStatus('Analysis failed. Please try again.', 'error');
    btn.innerHTML = '<i class="fas fa-chart-bar"></i> Retry Analysis';
    btn.disabled  = false;
  }
}

/* ─────────────────────────────────────────────
   DISPLAY RESULTS
───────────────────────────────────────────── */

function displaySkillGapResults(analysis) {
  /* Overall score */
  const score       = analysis.overallScore || 0;
  const scoreCircle = document.getElementById('scoreCircle');
  document.getElementById('scoreNum').textContent = `${score}%`;
  scoreCircle.className = `score-circle ${score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low'}`;

  document.getElementById('sgVerdict').textContent   = analysis.verdict   || 'Good Fit';
  document.getElementById('sgTimeReady').textContent = analysis.timeToReady ? `Ready in: ${analysis.timeToReady}` : '';
  document.getElementById('sgQuickTip').textContent  = analysis.quickTip  || '';

  /* Matched skills */
  const matchedGrid = document.getElementById('matchedSkillsGrid');
  if (analysis.matchedSkills?.length) {
    matchedGrid.innerHTML = analysis.matchedSkills.map((skill, i) => `
      <div class="matched-skill-item">
        <div class="matched-skill-top">
          <span class="matched-skill-name">${skill.skill}</span>
          <span class="matched-skill-pct">${skill.proficiency}%</span>
        </div>
        <div class="skill-progress-bar">
          <div class="skill-progress-fill" id="sgFill${i}" data-width="${skill.proficiency}"></div>
        </div>
        <div class="matched-skill-evidence">${skill.evidence || ''}</div>
      </div>`).join('');

    // Animate progress bars after paint
    requestAnimationFrame(() => {
      analysis.matchedSkills.forEach((skill, i) => {
        const fill = document.getElementById(`sgFill${i}`);
        if (fill) fill.style.width = `${skill.proficiency}%`;
      });
    });
  } else {
    matchedGrid.innerHTML = `<div style="color:var(--text2);font-size:14px;padding:8px 0;">
      No direct skill matches found. Consider upskilling!</div>`;
  }

  /* Missing skills */
  const missingGrid = document.getElementById('missingSkillsGrid');
  if (analysis.missingSkills?.length) {
    missingGrid.innerHTML = analysis.missingSkills.map(skill => `
      <div class="missing-skill-item">
        <div class="missing-skill-left">
          <div class="missing-skill-name">${skill.skill}</div>
          <div class="missing-skill-reason">${skill.reason || ''}</div>
        </div>
        <span class="importance-badge ${importanceClass(skill.importance)}">${skill.importance}</span>
      </div>`).join('');
  } else {
    missingGrid.innerHTML = `<div style="color:var(--green);font-size:14px;padding:8px 0;">
      Great! No major skill gaps found.</div>`;
  }

  /* Roadmap */
  const roadmapContainer = document.getElementById('roadmapContainer');
  if (analysis.roadmap?.length) {
    roadmapContainer.innerHTML = analysis.roadmap.map(month => `
      <div class="roadmap-month">
        <div class="roadmap-month-header">
          <span class="roadmap-month-title">${month.month}</span>
          <span class="roadmap-month-focus">${month.focus}</span>
        </div>
        <div class="roadmap-month-body">
          <div class="roadmap-tasks">
            ${(month.tasks || []).map(task => `
              <div class="roadmap-task">
                <i class="fas fa-arrow-right"></i><span>${task}</span>
              </div>`).join('')}
          </div>
          <div class="roadmap-resources">
            ${(month.resources || []).map(res => `
              <a href="${res.url}" target="_blank" class="resource-link ${resourceClass(res.type)}">
                <i class="${resourceIcon(res.type)}"></i> ${res.title}
              </a>`).join('')}
          </div>
        </div>
      </div>`).join('');
  } else {
    roadmapContainer.innerHTML = `<div style="color:var(--text2);font-size:14px;">
      You're ready to apply now!</div>`;
  }

  document.getElementById('gapResults').classList.add('active');
  const btn     = document.getElementById('analyzeGapBtn');
  btn.innerHTML = '<i class="fas fa-redo"></i> Re-Analyze';
  btn.disabled  = false;
}

/* ── Private helpers ── */
function importanceClass(imp) {
  if (imp === 'High')   return 'importance-high';
  if (imp === 'Medium') return 'importance-medium';
  return 'importance-low';
}

function resourceClass(type) {
  if (type === 'YouTube')  return 'resource-youtube';
  if (type === 'Coursera') return 'resource-coursera';
  if (type === 'Course')   return 'resource-course';
  return 'resource-default';
}

function resourceIcon(type) {
  if (type === 'YouTube')  return 'fab fa-youtube';
  if (type === 'Coursera') return 'fas fa-graduation-cap';
  return 'fas fa-book';
}
