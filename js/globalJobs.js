/**
 * globalJobs.js — fetch & render international AI/ML jobs
 * Data source: speedyapply/2026-AI-College-Jobs (GitHub)
 */

const TYPE_LABELS = {
  intern_intl  : '🌍 International Internships',
  newgrad_intl : '🌍 International New Grad',
  intern_usa   : '🦅 USA Internships',
  newgrad_usa  : '🦅 USA New Grad',
};

const TYPE_COLORS = {
  intern_intl  : 'rgba(0,212,255,0.15)',
  newgrad_intl : 'rgba(124,58,237,0.15)',
  intern_usa   : 'rgba(16,185,129,0.15)',
  newgrad_usa  : 'rgba(245,158,11,0.15)',
};

let allGlobalJobs   = [];
let filteredGlobal  = [];

/** Fetch global jobs from our API */
export async function fetchGlobalJobs(type = 'all') {
  const res  = await fetch(`/api/global-jobs?type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch global jobs');
  const data = await res.json();
  allGlobalJobs = data.jobs || [];
  return allGlobalJobs;
}

/** Render global job cards into a grid element */
export function renderGlobalJobs(jobs, gridEl, titleEl, matchScores = {}) {
  if (!jobs || jobs.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-globe"></i></div>
        <h3 class="empty-title">No global jobs found</h3>
        <p class="empty-text">Try adjusting your search or filter</p>
      </div>`;
    return;
  }

  gridEl.innerHTML = jobs.map(job => buildGlobalJobCard(job, matchScores)).join('');
  if (titleEl) titleEl.textContent = `${jobs.length} Global Opportunities`;
}

function buildGlobalJobCard(job, matchScores) {
  const key      = `${job.company}__${job.role}`;
  const score    = matchScores[key] || 0;
  const isMatch  = score > 0;
  const typeLabel = TYPE_LABELS[job.jobType] || job.jobType;
  const typeBg    = TYPE_COLORS[job.jobType] || 'rgba(0,212,255,0.1)';

  return `
    <div class="job-card global-job-card ${isMatch ? 'matched' : ''}">
      <div class="job-header">
        <div class="job-info">
          <div class="company-name">${escHtml(job.company)}</div>
          <div class="role-title">${escHtml(job.role)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;">
          <span class="global-type-badge" style="background:${typeBg};">${typeLabel}</span>
          ${isMatch ? `<div class="match-score"><i class="fas fa-check-circle"></i> ${Math.round(score)}% Match</div>` : ''}
        </div>
      </div>

      <div class="job-meta">
        ${job.location ? `<div class="job-meta-item"><i class="fas fa-map-marker-alt"></i>${escHtml(job.location)}</div>` : ''}
        ${job.salary   ? `<div class="job-meta-item"><i class="fas fa-dollar-sign"></i>${escHtml(job.salary)}</div>`    : ''}
      </div>

      <div class="job-actions">
        ${job.applyLink
          ? `<a href="${job.applyLink}" target="_blank" rel="noopener" class="btn-apply"><i class="fas fa-external-link-alt"></i> Apply Now</a>`
          : `<span class="btn-apply" style="opacity:0.4;cursor:default;">No Link Available</span>`}
        <button class="btn-save-job" data-save-slug="${key.replace(/[^a-z0-9]/gi,'-')}"
          onclick="window._toggleSaveJob('${key.replace(/[^a-z0-9]/gi,'-')}')">
          <i class="far fa-bookmark"></i> Save
        </button>
      </div>
    </div>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Filter global jobs by search + type */
export function filterGlobalJobs(jobs, query, type) {
  const q = (query || '').toLowerCase();
  return jobs.filter(job => {
    const hay = `${job.company} ${job.role} ${job.location}`.toLowerCase();
    return (!q || hay.includes(q)) && (!type || type === 'all' || job.jobType === type);
  });
}

export { allGlobalJobs };
