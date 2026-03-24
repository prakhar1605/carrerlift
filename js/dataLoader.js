/**
 * dataLoader.js
 * Fetches and parses data from Google Sheets.
 * - Jobs & Professors: gviz JSON endpoint
 * - HR Contacts: CSV export endpoint (reliable column headers)
 */

import { JOBS_SHEET_URL, PROFESSORS_SHEET_URL, HR_CSV_URL } from './config.js';

/* ─────────────────────────────────────────────
   gviz JSON parser (Jobs + Professors)
───────────────────────────────────────────── */
function parseSheetResponse(rawText) {
  const jsonText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf(')'));
  const data     = JSON.parse(jsonText);
  const cols     = data.table.cols.map(c => (c.label || '').trim());
  const rows     = data.table.rows.map(row =>
    row.c ? row.c.map(cell => (cell ? cell.v : '') ?? '') : []
  );

  const items = rows.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col || `col${i}`] = row[i] ?? ''; });
    return obj;
  });

  return items.filter(item => String(Object.values(item)[0]).trim() !== '');
}

/* ─────────────────────────────────────────────
   CSV parser (HR Contacts)
   Handles quoted fields, commas inside quotes, etc.
───────────────────────────────────────────── */
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse a single CSV line respecting quoted fields
  function splitLine(line) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        result.push(cur.trim()); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = splitLine(lines[0]);
  const items   = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = splitLine(lines[i]);
    const obj  = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
    // Skip completely empty rows
    if (Object.values(obj).every(v => !v)) continue;
    items.push(obj);
  }

  return items;
}

/* ─────────────────────────────────────────────
   Fetch functions
───────────────────────────────────────────── */
export async function fetchJobs() {
  const response = await fetch(JOBS_SHEET_URL);
  if (!response.ok) throw new Error(`Jobs sheet fetch failed: ${response.status}`);
  return parseSheetResponse(await response.text());
}

export async function fetchProfessors() {
  const response = await fetch(PROFESSORS_SHEET_URL);
  if (!response.ok) throw new Error(`Professors sheet fetch failed: ${response.status}`);
  return parseSheetResponse(await response.text());
}

export async function fetchHRContacts() {
  const response = await fetch(HR_CSV_URL);
  if (!response.ok) throw new Error(`HR sheet fetch failed: ${response.status}`);
  const text   = await response.text();
  const result = parseCSV(text);
  console.log('[HR] columns:', result.length > 0 ? Object.keys(result[0]) : 'none');
  console.log('[HR] sample row:', result[0]);
  return result;
}

export async function fetchAllData() {
  const [jobs, professors, hrContacts] = await Promise.all([
    fetchJobs(), fetchProfessors(), fetchHRContacts(),
  ]);
  return { jobs, professors, hrContacts };
}
