/**
 * dataLoader.js
 * Fetches and parses data from Google Sheets (Jobs + Professors).
 */

import { JOBS_SHEET_URL, PROFESSORS_SHEET_URL } from './config.js';

/**
 * Parse a raw Google Sheets gviz JSON response into an array of objects.
 * @param {string} rawText  - Raw response text from the gviz endpoint
 * @returns {Object[]}
 */
function parseSheetResponse(rawText) {
  const jsonText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf(')'));
  const data     = JSON.parse(jsonText);
  const cols     = data.table.cols.map(c => (c.label || '').trim());
  const rows     = data.table.rows.map(row => row.c ? row.c.map(cell => cell ? cell.v : '') : []);

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
 * Fetch both datasets in parallel.
 * @returns {Promise<{ jobs: Object[], professors: Object[] }>}
 */
export async function fetchAllData() {
  const [jobs, professors] = await Promise.all([fetchJobs(), fetchProfessors()]);
  return { jobs, professors };
}
