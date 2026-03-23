/**
 * renderer.js
 * Renders job cards, professor cards, filters, and handles search/filter state.
 */

/* ── Helper: unique slug for a job (used as deep-link ID) ── */
export function jobSlug(job) {
  return `${job.Company || ''}-${job.Role || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ── Helper: get professor email from any column variant ── */
export function getProfessorEmail(prof) {
  const candidates = ['Mail id','Mail Id','mail id','Email','email','E-mail','e-mail','Contact','contact'];
  for (const key of candidates) {
    if (prof[key] && String(prof[key]).includes('@')) return prof[key];
  }
  for (const key of Object.keys(prof)) {
    const lk = key.toLowerCase();
    if ((lk.includes('mail') || lk.includes('email') || lk.includes('contact'))
        && prof[key] && String(prof[key]).includes('@')) return prof[key];
  }
  return '';
}

/* ── Helper: get professor research areas from any column variant ── */
export function getResearchAreas(prof) {
  const candidates = ['Area of Interest','Area of interest','area of interest',
    'Research Areas','Research Area','Area','Research Interest','Research Interests','Interests'];
  for (const key of candidates) {
    if (prof[key]) return prof[key];
  }
  for (const key of Object.keys(prof)) {
    const lk = key.toLowerCase();
    if ((lk.includes('interest') || lk.includes('area') || lk.includes('research'))
        && !lk.includes('college') && !lk.includes('name') && !lk.includes('department'))
      return prof[key];
  }
  return '';
}

/* ─────────────────────────────────────────────
   JOB CARD HTML
───────────────────────────────────────────── */
function buildJobCardHTML(job, matchScores, displayIndex) {
  const key        = job.Company + job.Role;
  const score      = matchScores[key] || 0;
  const isMatched  = score > 0;
  const isTrending = displayIndex < 25;
  const slug       = jobSlug(job);

  const jobDataAttr = JSON.stringify({
    slug       : slug,
    company    : job.Company     || '',
    role       : job.Role        || '',
    description: job.Description || '',
    email      : job.Email       || '',
    location   : job.Location    || '',
    applyLink  : job.ApplyLink   || '',
    stipend    : job.Stipend     || '',
    jobType    : job.JobType     || '',
  }).replace(/"/g, '&quot;');

  return `
    <div class="job-card ${isMatched ? 'matched' : ''}" data-job-id="${slug}" id="job-${slug}">
      <div class="job-header">
        <div class="job-info">
          <div class="company-name">${job.Company || 'Company'}</div>
          <div class="role-title">${job.Role || 'Position'}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          ${isTrending ? `<div class="trending-badge">Trending</div>` : ''}
          ${isMatched  ? `<div class="match-score"><i class="fas fa-check-circle"></i> ${Math.round(score)}% Match</div>` : ''}
        </div>
      </div>

      <div class="job-meta">
        ${job.Location ? `<div class="job-meta-item"><i class="fas fa-map-marker-alt"></i>${job.Location}</div>` : ''}
        ${job.Stipend  ? `<div class="job-meta-item"><i class="fas fa-rupee-sign"></i>${job.Stipend}</div>`  : ''}
        ${job.JobType  ? `<div class="job-meta-item"><i class="fas fa-briefcase"></i>${job.JobType}</div>`   : ''}
      </div>

      ${job.Description
        ? `<div class="job-description">${job.Description.slice(0,150)}${job.Description.length > 150 ? '...' : ''}</div>`
        : ''}

      <div class="job-actions">
        ${job.ApplyLink
          ? `<a href="${job.ApplyLink}" target="_blank" class="btn-apply"><i class="fas fa-paper-plane"></i> Apply Now</a>`
          : ''}
        ${job.Email
          ? `<a href="mailto:${job.Email}" class="btn-save"><i class="fas fa-envelope"></i> Email</a>`
          : ''}
        ${job.Email && !job.ApplyLink
          ? `<button class="btn-generate-email" onclick="window.openJobEmailModal(${jobDataAttr})"><i class="fas fa-magic"></i> AI Email</button>`
          : ''}
        <button class="btn-analyze-fit" onclick="window.openSkillGap(${jobDataAttr})">
          <i class="fas fa-chart-bar"></i> Analyze Fit
        </button>
        <button class="btn-share" onclick="window.shareJob(${jobDataAttr})">
          <i class="fas fa-share-alt"></i> Share
        </button>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   PROFESSOR CARD HTML
───────────────────────────────────────────── */
function buildProfessorCardHTML(prof, matchScores) {
  const key           = prof.Name + prof['College Name'];
  const score         = matchScores[key] || 0;
  const isMatched     = score > 0;
  const researchAreas = getResearchAreas(prof);
  const email         = getProfessorEmail(prof);

  const profDataAttr = JSON.stringify({
    name    : prof.Name            || '',
    dept    : prof.Department      || '',
    inst    : prof['College Name'] || '',
    research: researchAreas        || '',
    email   : email                || '',
  }).replace(/"/g, '&quot;');

  return `
    <div class="professor-card ${isMatched ? 'matched' : ''}">
      <div class="professor-header">
        <div class="professor-info">
          <div class="professor-name">${prof.Name || 'Professor'}</div>
          <div class="professor-institution">${prof['College Name'] || 'Institution'}</div>
          <div class="professor-department">${prof.Department || 'Department'}</div>
        </div>
        ${isMatched ? `<div class="match-score"><i class="fas fa-check-circle"></i> ${Math.round(score)}% Match</div>` : ''}
      </div>

      <div class="research-areas">
        <div class="research-areas-title">Research Areas</div>
        <div class="research-areas-content">${researchAreas || 'No research areas listed'}</div>
      </div>

      <div class="job-actions">
        ${email
          ? `<a href="mailto:${email}" class="btn-apply"><i class="fas fa-envelope"></i> Email Professor</a>`
          : `<button class="btn-apply" style="opacity:0.5;cursor:not-allowed;" disabled><i class="fas fa-envelope"></i> No Email Available</button>`}
        <button class="btn-generate-email" onclick="window.openEmailModal(${profDataAttr})">
          <i class="fas fa-magic"></i> AI Email
        </button>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   PUBLIC RENDER FUNCTIONS
───────────────────────────────────────────── */
export function renderJobs(jobs, matchScores, gridEl, titleEl) {
  if (!jobs || jobs.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-briefcase"></i></div>
        <h3 class="empty-title">No jobs found</h3>
        <p class="empty-text">Try adjusting your search or filters</p>
      </div>`;
    return;
  }

  const hasMatches = Object.keys(matchScores).length > 0;
  const sorted = [...jobs].sort((a, b) => {
    const sA = matchScores[a.Company + a.Role] || 0;
    const sB = matchScores[b.Company + b.Role] || 0;
    if (hasMatches && sB !== sA) return sB - sA;
    return jobs.indexOf(b) - jobs.indexOf(a);
  });

  gridEl.innerHTML = sorted.map((job, i) => buildJobCardHTML(job, matchScores, i)).join('');

  const matchedCount = Object.keys(matchScores).filter(k => matchScores[k] > 0).length;
  if (titleEl) {
    titleEl.innerHTML = matchedCount > 0
      ? `Your Top Matches <span style="color:var(--neon);font-weight:800;">(${matchedCount})</span> & All Jobs`
      : 'Available Jobs';
  }
}

export function renderProfessors(professors, matchScores, gridEl, titleEl) {
  if (!professors || professors.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-flask"></i></div>
        <h3 class="empty-title">No research opportunities found</h3>
        <p class="empty-text">Try adjusting your search or filters</p>
      </div>`;
    return;
  }

  const hasMatches = Object.keys(matchScores).length > 0;
  const sorted = [...professors].sort((a, b) => {
    const sA = matchScores[a.Name + a['College Name']] || 0;
    const sB = matchScores[b.Name + b['College Name']] || 0;
    return hasMatches ? sB - sA : 0;
  });

  gridEl.innerHTML = sorted.map(prof => buildProfessorCardHTML(prof, matchScores)).join('');

  const matchedCount = Object.keys(matchScores).filter(k => matchScores[k] > 0).length;
  if (titleEl) {
    titleEl.innerHTML = matchedCount > 0
      ? `Your Top Matches <span style="color:var(--neon);font-weight:800;">(${matchedCount})</span> & All Professors`
      : 'Available Research Opportunities';
  }
}

/* ── FILTER HELPERS ── */
export function populateJobFilters(jobs, locationEl, typeEl) {
  const locations = new Set(), types = new Set();
  jobs.forEach(job => {
    if (job.Location) locations.add(job.Location);
    if (job.JobType)  types.add(job.JobType);
  });
  locationEl.innerHTML = '<option value="">All Locations</option>'
    + Array.from(locations).sort().map(l => `<option value="${l}">${l}</option>`).join('');
  typeEl.innerHTML = '<option value="">All Job Types</option>'
    + Array.from(types).sort().map(t => `<option value="${t}">${t}</option>`).join('');
}

export function populateProfessorFilters(professors, institutionEl, departmentEl) {
  const institutions = new Set(), departments = new Set();
  professors.forEach(p => {
    if (p['College Name']) institutions.add(p['College Name']);
    if (p.Department)      departments.add(p.Department);
  });
  institutionEl.innerHTML = '<option value="">All Institutions</option>'
    + Array.from(institutions).sort().map(i => `<option value="${i}">${i}</option>`).join('');
  departmentEl.innerHTML = '<option value="">All Departments</option>'
    + Array.from(departments).sort().map(d => `<option value="${d}">${d}</option>`).join('');
}

export function filterJobs(jobs, query, location, type) {
  const q = query.toLowerCase();
  return jobs.filter(job => {
    const hay = `${job.Company} ${job.Role} ${job.Location} ${job.Description}`.toLowerCase();
    return (!q || hay.includes(q))
      && (!location || job.Location === location)
      && (!type     || job.JobType  === type);
  });
}

export function filterProfessors(professors, query, institution, department) {
  const q = query.toLowerCase();
  return professors.filter(prof => {
    const areas = getResearchAreas(prof);
    const hay   = `${prof.Name} ${prof['College Name']} ${prof.Department} ${areas}`.toLowerCase();
    return (!q         || hay.includes(q))
      && (!institution || prof['College Name'] === institution)
      && (!department  || prof.Department      === department);
  });
}
