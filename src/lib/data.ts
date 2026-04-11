import type { Job, Professor, HRContact } from '@/types';
import { SHEET_URLS } from './config';

function parseSheet(raw: string) {
  const json = JSON.parse(raw.substring(raw.indexOf('{'), raw.lastIndexOf(')')));
  const cols = json.table.cols.map((c: any) => (c.label||'').trim());
  return json.table.rows
    .map((row: any) => {
      const obj: Record<string,any> = {};
      cols.forEach((col: string, i: number) => { obj[col||`col${i}`] = row.c?.[i]?.v ?? ''; });
      return obj;
    })
    .filter((item: any) => String(Object.values(item)[0]).trim() !== '');
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const split = (line: string) => {
    const res: string[] = []; let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { res.push(cur.trim()); cur = ''; } else cur += ch;
    }
    res.push(cur.trim()); return res;
  };
  const headers = split(lines[0]);
  return lines.slice(1).filter(l=>l.trim()).map(l => {
    const vals = split(l); const obj: Record<string,string> = {};
    headers.forEach((h,i) => { obj[h] = vals[i]||''; }); return obj;
  });
}

export async function fetchJobs(): Promise<Job[]> {
  const r = await fetch(SHEET_URLS.jobs, { next: { revalidate: 300 } });
  return (parseSheet(await r.text()) as Job[]).reverse();
}
export async function fetchProfessors(): Promise<Professor[]> {
  const r = await fetch(SHEET_URLS.professors, { next: { revalidate: 3600 } });
  return parseSheet(await r.text()) as Professor[];
}
export async function fetchHRContacts(): Promise<HRContact[]> {
  const r = await fetch(SHEET_URLS.hrCsv, { next: { revalidate: 3600 } });
  return parseCSV(await r.text()) as unknown as HRContact[];
}
export async function fetchAllData() {
  const [jobs, professors, hrContacts] = await Promise.all([fetchJobs(), fetchProfessors(), fetchHRContacts()]);
  return { jobs, professors, hrContacts };
}
