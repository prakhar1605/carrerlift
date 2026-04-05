/**
 * api/global-jobs.js
 * Fetches AI/ML job listings from speedyapply GitHub repo
 * Table format: | Company | Position | Location | Salary | Posting | Age |
 * Posting column has: <a href="URL"><img src="...Apply..."/></a>
 */

const GITHUB_URLS = {
  intern_intl : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/INTERN_INTL.md',
  newgrad_intl: 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_INTL.md',
  intern_usa  : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/README.md',
  newgrad_usa : 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/NEW_GRAD_USA.md',
};

/** Strip ALL markdown & HTML, return plain text */
function stripAll(str) {
  return (str || '')
    .replace(/<[^>]+>/g, '')          // remove HTML tags
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // **bold** → text
    .replace(/\*([^*]+)\*/g, '$1')             // *italic* → text
    .replace(/`([^`]+)`/g, '$1')               // `code` → text
    .replace(/🔒/g, '')
    .replace(/🔥/g, '')
    .replace(/📚/g, '')
    .replace(/🎓/g, '')
    .trim();
}

/** Extract FIRST href from a cell that may contain <a href="..."> or [text](url) */
function extractHref(cell) {
  // HTML: <a href="URL">
  const htmlMatch = cell.match(/href="([^"]+)"/);
  if (htmlMatch) return htmlMatch[1];
  // Markdown: [text](URL)
  const mdMatch = cell.match(/\]\(([^)]+)\)/);
  if (mdMatch) return mdMatch[1];
  return null;
}

/** Parse one markdown file → array of job objects */
function parseMarkdownTable(markdown, type) {
  const lines = markdown.split('\n');
  const jobs  = [];

  // Find header row: must contain 'company' and 'position'
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const low = lines[i].toLowerCase();
    if (lines[i].startsWith('|') && low.includes('company') && low.includes('position')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return jobs;

  // Parse data rows (skip header + separator)
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;

    // Split by | but keep raw content per cell
    const rawCells = line.split('|').slice(1); // remove leading empty
    if (rawCells.length < 3) continue;

    const companyRaw  = rawCells[0] || '';
    const positionRaw = rawCells[1] || '';
    const locationRaw = rawCells[2] || '';
    const salaryRaw   = rawCells[3] || '';
    const postingRaw  = rawCells[4] || rawCells[3] || '';

    const company  = stripAll(companyRaw).trim();
    const role     = stripAll(positionRaw).trim();
    const location = stripAll(locationRaw).trim();
    const salary   = stripAll(salaryRaw).trim();

    // Skip separators, empty, or closed (🔒 in raw)
    if (!company || company.startsWith(':---') || company === '---') continue;
    if (positionRaw.includes('🔒')) continue;

    // Apply link: try posting cell first, then position, then company
    const applyLink =
      extractHref(postingRaw) ||
      extractHref(positionRaw) ||
      extractHref(companyRaw) ||
      '';

    // Skip if salary cell actually contains an href (means columns shifted)
    const salaryClean = salaryRaw.includes('href') ? '' : salary;

    jobs.push({ company, role, location, salary: salaryClean, applyLink, jobType: type, source: 'speedyapply' });
  }
  return jobs;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const type = req.query.type || 'all';
  const toFetch = type === 'all'
    ? Object.entries(GITHUB_URLS)
    : Object.entries(GITHUB_URLS).filter(([k]) => k === type);

  if (!toFetch.length) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    const results = await Promise.allSettled(
      toFetch.map(async ([key, url]) => {
        const r = await fetch(url, { headers: { 'User-Agent': 'CarrerLift/1.0' } });
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${key}`);
        return parseMarkdownTable(await r.text(), key);
      })
    );

    let all = [];
    results.forEach(r => { if (r.status === 'fulfilled') all = all.concat(r.value); });

    // Deduplicate
    const seen = new Set();
    const unique = all.filter(j => {
      const k = `${j.company}||${j.role}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    return res.status(200).json({ success: true, count: unique.length, jobs: unique });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
