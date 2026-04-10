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
  const cols = data.table.cols.map(c => (c.label || '').trim()); // trim spaces from col names
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
   Date helper — "X days ago" from PostedDate
───────────────────────────────────────────── */
export function timeAgo(dateVal) {
  if (!dateVal) return '';
  // Google Sheets gviz returns dates as "Date(2026,1,16)" format
  let d;
  if (typeof dateVal === 'string' && dateVal.startsWith('Date(')) {
    const parts = dateVal.replace('Date(','').replace(')','').split(',');
    d = new Date(+parts[0], +parts[1], +parts[2]);
  } else {
    d = new Date(dateVal);
  }
  if (isNaN(d)) return '';
  const days = Math.floor((Date.now() - d) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days/7)}w ago`;
  if (days < 365) return `${Math.floor(days/30)}mo ago`;
  return `${Math.floor(days/365)}y ago`;
}

export function postedTimestamp(dateVal) {
  if (!dateVal) return 0;
  if (typeof dateVal === 'string' && dateVal.startsWith('Date(')) {
    const parts = dateVal.replace('Date(','').replace(')','').split(',');
    return new Date(+parts[0], +parts[1], +parts[2]).getTime();
  }
  return new Date(dateVal).getTime() || 0;
}

export async function fetchJobs() {
  const response = await fetch(JOBS_SHEET_URL);
  if (!response.ok) throw new Error(`Jobs sheet fetch failed: ${response.status}`);
  const jobs = parseSheetResponse(await response.text());
  // Sheet is in reverse order — newest at bottom, so reverse to get latest first
  return jobs.reverse();
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
