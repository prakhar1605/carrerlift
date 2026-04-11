/**
 * renderer.js
 * Renders job cards, professor cards, filters, and handles search/filter state.
 */

import { timeAgo, postedTimestamp } from './dataLoader.js';
function getSavedJobs() {
  try { return JSON.parse(localStorage.getItem('cl_saved_jobs') || '[]'); } catch { return []; }
}
function toggleSaveJob(slug, jobDataAttr) {
  const saved = getSavedJobs();
  const idx   = saved.indexOf(slug);
  if (idx === -1) saved.push(slug); else saved.splice(idx, 1);
  localStorage.setItem('cl_saved_jobs', JSON.stringify(saved));
  // Update button UI
  const btn = document.querySelector(`[data-save-slug="${slug}"]`);
  if (btn) {
    const isSaved = saved.includes(slug);
    btn.innerHTML = isSaved
      ? `<i class="fas fa-bookmark"></i> Saved`
      : `<i class="far fa-bookmark"></i> Save`;
    btn.classList.toggle('btn-saved', isSaved);
  }
}
window._toggleSaveJob = toggleSaveJob;

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
  const isSaved    = getSavedJobs().includes(slug);
  const ago        = timeAgo(job.PostedDate);
  const isNew      = (() => {
    const ts = postedTimestamp(job.PostedDate);
    return ts > 0 && (Date.now() - ts) < 3 * 86400000; // within 3 days
  })();

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
          ${isNew      ? `<div class="new-badge">🆕 New</div>` : isTrending ? `<div class="trending-badge">Trending</div>` : ''}
          ${isMatched  ? `<div class="match-score"><i class="fas fa-check-circle"></i> ${Math.round(score)}% Match</div>` : ''}
          ${ago        ? `<div class="posted-ago">${ago}</div>` : ''}
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
        <button class="btn-generate-email" onclick="window.openJobEmailModal(${jobDataAttr})"><i class="fas fa-magic"></i> AI Email</button>
        <button class="btn-save-job ${isSaved ? 'btn-saved' : ''}" data-save-slug="${slug}"
          onclick="window._toggleSaveJob('${slug}')">
          <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i> ${isSaved ? 'Saved' : 'Save'}
        </button>
        <button class="btn-analyze-fit" onclick="window.openSkillGap(${jobDataAttr})">
          <i class="fas fa-chart-bar"></i> Fit
        </button>
        <button class="btn-share" onclick="window.shareJob(${jobDataAttr})">
          <i class="fas fa-share-alt"></i><span class="share-label"> Share</span>
        </button>
        <button class="btn-view-details" onclick="window.openJobDetailModal(${jobDataAttr})">
          View Details <i class="fas fa-arrow-right"></i>
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

/* ─────────────────────────────────────────────
   HR CONTACT — case-insensitive field helper
   Google Sheets gviz API kabhi kabhi column names
   mein slight differences deta hai (casing, spaces).
   Yeh helper exact match try karta hai, phir fallback.
───────────────────────────────────────────── */
function hrField(hr, ...keys) {
  // 1. Exact match
  for (const key of keys) {
    if (hr[key] && String(hr[key]).trim()) return String(hr[key]).trim();
  }
  // 2. Case-insensitive + whitespace-collapsed fallback
  const normKeys = keys.map(k => k.toLowerCase().replace(/[\s_-]+/g, ''));
  for (const objKey of Object.keys(hr)) {
    const norm = objKey.toLowerCase().replace(/[\s_-]+/g, '');
    if (normKeys.includes(norm) && hr[objKey] && String(hr[objKey]).trim()) {
      return String(hr[objKey]).trim();
    }
  }
  return '';
}

/* ─────────────────────────────────────────────
   HR CONTACT CARD HTML
───────────────────────────────────────────── */
function buildHRCardHTML(hr) {
  // CSV se exact headers: Name, Job Title, Linkedin URL, Company Name,
  // Company Website, Location, Company Niche
  const name     = hrField(hr, 'Name', 'name', 'Full Name', 'FullName', 'NAME') || 'HR Contact';
  const title    = hrField(hr, 'Job Title', 'job title', 'JobTitle', 'Title', 'title', 'Designation');
  const company  = hrField(hr, 'Company Name', 'company name', 'CompanyName', 'Company', 'company');
  const location = hrField(hr, 'Location', 'location', 'City', 'city');
  const linkedin = hrField(hr, 'Linkedin URL', 'LinkedIn URL', 'linkedin url', 'LinkedinURL',
                            'Linkedin Url', 'LINKEDIN URL', 'linkedinurl', 'Linkedin', 'linkedin');
  const niche    = hrField(hr, 'Company Niche', 'company niche', 'CompanyNiche', 'Niche', 'niche',
                            'Company_Niche', 'Industry', 'industry');
  const website  = hrField(hr, 'Company Website', 'company website', 'CompanyWebsite', 'Website', 'website');

  return `
    <div class="professor-card">
      <div class="professor-header" style="flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;width:100%;">
          <div class="professor-info" style="min-width:0;flex:1;">
            <div class="professor-name" style="word-break:break-word;">${name}</div>
            <div class="professor-department" style="word-break:break-word;">${title}</div>
            <div class="professor-institution">${company}${location ? ' · ' + location : ''}</div>
          </div>
        </div>
        ${niche ? `
        <div style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;
                    background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);
                    color:var(--neon2);font-size:10px;font-weight:700;letter-spacing:0.3px;
                    max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${niche}
        </div>` : ''}
      </div>

      <div class="job-actions" style="margin-top:14px;">
        ${linkedin
          ? `<a href="${linkedin}" target="_blank" class="btn-apply" style="background:linear-gradient(135deg,#0A66C2,#0077B5);"><i class="fab fa-linkedin"></i> LinkedIn</a>`
          : ''}
        ${website
          ? `<a href="${website}" target="_blank" class="btn-save"><i class="fas fa-globe"></i> Website</a>`
          : ''}
      </div>
    </div>`;
}

export function renderHRContacts(hrContacts, gridEl, titleEl) {
  if (!hrContacts || hrContacts.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-users"></i></div>
        <h3 class="empty-title">No HR contacts found</h3>
        <p class="empty-text">Try adjusting your search or filters</p>
      </div>`;
    return;
  }
  gridEl.innerHTML = hrContacts.map(hr => buildHRCardHTML(hr)).join('');
  if (titleEl) titleEl.textContent = 'HR & Talent Acquisition Contacts';
}

export function populateHRFilters(hrContacts, companyEl, locationEl) {
  const companies  = new Set();
  const locations  = new Set();
  hrContacts.forEach(hr => {
    const co  = hrField(hr, 'Company Name', 'company name', 'Company', 'company') || '';
    const loc = hrField(hr, 'Location', 'location', 'City', 'city') || '';
    if (co)  companies.add(co);
    if (loc) locations.add(loc);
  });
  companyEl.innerHTML = '<option value="">All Companies</option>'
    + Array.from(companies).sort().map(c => `<option value="${c}">${c}</option>`).join('');
  locationEl.innerHTML = '<option value="">All Locations</option>'
    + Array.from(locations).sort().map(l => `<option value="${l}">${l}</option>`).join('');
}

export function filterHRContacts(hrContacts, query, company, location) {
  const q = (query || '').toLowerCase();
  return hrContacts.filter(hr => {
    const name = hrField(hr, 'Name', 'name', 'Full Name') || '';
    const title = hrField(hr, 'Job Title', 'job title', 'Title') || '';
    const co    = hrField(hr, 'Company Name', 'company name', 'Company', 'company') || '';
    const loc   = hrField(hr, 'Location', 'location', 'City') || '';
    const hay   = `${name} ${title} ${co} ${loc}`.toLowerCase();
    return (!q        || hay.includes(q))
      && (!company  || co  === company)
      && (!location || loc === location);
  });
}

export function populateJobFilters(jobs, locationEl, typeEl) {
  const LOCATION_OPTIONS = [
    { value: '',           label: '📍 All Locations' },
    { value: 'Remote',     label: '🏠 Remote' },
    { value: 'PAN India',  label: '🇮🇳 PAN India' },
    { value: 'Bangalore',  label: 'Bangalore' },
    { value: 'Bengaluru',  label: 'Bengaluru' },
    { value: 'Mumbai',     label: 'Mumbai' },
    { value: 'Noida',      label: 'Noida' },
    { value: 'Gurgaon',    label: 'Gurgaon' },
    { value: 'Gurugram',   label: 'Gurugram' },
    { value: 'Hyderabad',  label: 'Hyderabad' },
    { value: 'Pune',       label: 'Pune' },
    { value: 'Chennai',    label: 'Chennai' },
    { value: 'New Delhi',  label: 'New Delhi' },
    { value: 'Delhi',      label: 'Delhi' },
    { value: 'Jaipur',     label: 'Jaipur' },
    { value: 'Ahmedabad',  label: 'Ahmedabad' },
    { value: 'Indore',     label: 'Indore' },
    { value: 'Mohali',     label: 'Mohali' },
  ];

  const TYPE_OPTIONS = [
    { value: '',          label: '💼 All Types' },
    { value: 'Intern',    label: '🎓 Internship' },
    { value: 'Full-time', label: '💼 Full-time' },
  ];

  locationEl.innerHTML = LOCATION_OPTIONS
    .map(o => `<option value="${o.value}">${o.label}</option>`).join('');

  typeEl.innerHTML = TYPE_OPTIONS
    .map(o => `<option value="${o.value}">${o.label}</option>`).join('');
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
  const q = (query || '').toLowerCase();
  // Normalize type for matching — "Full Time" == "Full-time"
  const normalizeType = t => (t || '').toLowerCase().replace(/[-\s]/g, '');
  const typeNorm = normalizeType(type);

  return jobs.filter(job => {
    const hay = `${job.Company} ${job.Role} ${job.Location} ${job.Description}`.toLowerCase();
    const locMatch  = !location || (job.Location || '').trim() === location;
    const typeMatch = !type || normalizeType(job.JobType) === typeNorm;
    return (!q || hay.includes(q)) && locMatch && typeMatch;
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
