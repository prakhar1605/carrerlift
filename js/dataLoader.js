/**
 * dataLoader.js
 * Fetches and parses data from Google Sheets (Jobs + Professors).
 */

import { JOBS_SHEET_URL, PROFESSORS_SHEET_URL, HR_SHEET_URL } from './config.js';

/**
 * Parse a raw Google Sheets gviz JSON response into an array of objects.
 * @param {string} rawText  - Raw response text from the gviz endpoint
 * @returns {Object[]}
 */
function parseSheetResponse(rawText, useFirstRowAsHeader = false) {
  const jsonText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf(')'));
  const data     = JSON.parse(jsonText);
  let cols       = data.table.cols.map(c => (c.label || '').trim());
  let rows       = data.table.rows.map(row => row.c ? row.c.map(cell => cell ? cell.v : '') : []);

  // If gviz returns no column labels (all empty), use the first data row as headers
  const hasLabels = cols.some(c => c !== '');
  if (!hasLabels && rows.length > 0) {
    cols = rows[0].map(v => String(v || '').trim());
    rows = rows.slice(1);
    console.log('[dataLoader] No gviz labels found — used first row as header:', cols);
  } else if (useFirstRowAsHeader && rows.length > 0) {
    cols = rows[0].map(v => String(v || '').trim());
    rows = rows.slice(1);
  }

  const items = rows.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col || `col${i}`] = row[i] || ''; });
    return obj;
  });

  // Drop completely empty rows (first column empty)
  return items.filter(item => String(Object.values(item)[0]).trim() !== '');
}

/**
 * Fetch jobs from the configured Google Sheet.
 * @returns {Promise<Object[]>}
 */
export async function fetchJobs() {
  const response = await fetch(JOBS_SHEET_URL);
  if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
  return parseSheetResponse(await response.text());
}

/**
 * Fetch professors from the configured Google Sheet.
 * @returns {Promise<Object[]>}
 */
export async function fetchProfessors() {
  const response = await fetch(PROFESSORS_SHEET_URL);
  if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
  return parseSheetResponse(await response.text());
}

/**
 * Fetch HR contacts from the configured Google Sheet.
 * @returns {Promise<Object[]>}
 */
export async function fetchHRContacts() {
  const response = await fetch(HR_SHEET_URL);
  if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
  const rawText = await response.text();
  let result = parseSheetResponse(rawText);

  // DEBUG: log first HR contact keys so we can see exact column names
  if (result.length > 0) {
    console.log('=== HR SHEET COLUMN KEYS ===', Object.keys(result[0]));
    console.log('=== HR FIRST ROW SAMPLE ===', result[0]);
  }

  // Agar pehla object ka Name field empty hai, gviz ne headers nahi diye — retry with first-row-as-header
  const firstItem = result[0] || {};
  const hasName = Object.keys(firstItem).some(k => k.toLowerCase().includes('name'));
  if (!hasName) {
    console.warn('[dataLoader] HR sheet: no "name" column found — retrying with first row as header');
    result = parseSheetResponse(rawText, true);
    if (result.length > 0) {
      console.log('=== HR KEYS AFTER RETRY ===', Object.keys(result[0]));
    }
  }

  return result;
}

/**
 * Fetch all three datasets in parallel.
 * @returns {Promise<{ jobs: Object[], professors: Object[], hrContacts: Object[] }>}
 */
export async function fetchAllData() {
  const [jobs, professors, hrContacts] = await Promise.all([fetchJobs(), fetchProfessors(), fetchHRContacts()]);
  return { jobs, professors, hrContacts };
}
