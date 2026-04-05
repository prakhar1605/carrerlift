/**
 * api/global-jobs.js
 * Fetches international AI/ML job listings from GitHub repo
 * speedyapply/2026-AI-College-Jobs — parses Markdown tables
 * Returns JSON array of jobs
 */

const GITHUB_URLS = {
  intern_intl  : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/INTERN_INTL.md',
  newgrad_intl : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_INTL.md',
  intern_usa   : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/README.md',
  newgrad_usa  : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_USA.md',
};

/**
 * Parse a GitHub Markdown table into array of objects
 * Format: | Company | Position | Location | Salary | Posting |
 */
function parseMarkdownTable(markdown, type) {
  const lines = markdown.split('\n');
  const jobs  = [];

  // Find table header line
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.toLowerCase().includes('company') && line.toLowerCase().includes('position')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return jobs;

  // Parse header columns
  const headers = lines[headerIdx]
    .split('|')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean);

  // Parse data rows (skip separator line)
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 3) continue;

    // Extract markdown links — [text](url)
    const extractLink = (cell) => {
      const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return match ? { text: match[1], url: match[2] } : { text: cell.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'), url: null };
    };

    const company  = extractLink(cells[0] || '');
    const position = extractLink(cells[1] || '');
    const location = (cells[2] || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/🔒/g, '').trim();
    const salary   = cells[3] ? cells[3].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() : '';
    const posting  = extractLink(cells[4] || cells[3] || '');

    // Skip empty or separator rows
    if (!company.text || company.text === '---' || company.text.startsWith(':---')) continue;
    // Skip closed listings (🔒)
    if (cells[1] && cells[1].includes('🔒')) continue;

    jobs.push({
      company    : company.text,
      role       : position.text,
      location   : location || 'International',
      salary     : salary !== location ? salary : '',
      applyLink  : posting.url || position.url || company.url || '',
      jobType    : type,
      source     : 'speedyapply',
    });
  }
  return jobs;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Cache for 1 hour — GitHub updates daily
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const type = req.query.type || 'all'; // intern_intl | newgrad_intl | intern_usa | newgrad_usa | all

  try {
    const toFetch = type === 'all'
      ? Object.entries(GITHUB_URLS)
      : [[type, GITHUB_URLS[type]]];

    if (!toFetch.length || !toFetch[0][1]) {
      return res.status(400).json({ error: 'Invalid type. Use: intern_intl, newgrad_intl, intern_usa, newgrad_usa, all' });
    }

    const results = await Promise.allSettled(
      toFetch.map(async ([key, url]) => {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'CarrerLift-Bot/1.0' }
        });
        if (!r.ok) throw new Error(`Failed to fetch ${key}: ${r.status}`);
        const text = await r.text();
        return parseMarkdownTable(text, key);
      })
    );

    let allJobs = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allJobs = allJobs.concat(result.value);
      }
    }

    // Remove duplicates by company+role
    const seen = new Set();
    const uniqueJobs = allJobs.filter(job => {
      const key = `${job.company}__${job.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.status(200).json({
      success : true,
      count   : uniqueJobs.length,
      jobs    : uniqueJobs,
      updated : new Date().toISOString(),
    });

  } catch (err) {
    console.error('Global jobs error:', err);
    return res.status(500).json({ error: err.message });
  }
}
