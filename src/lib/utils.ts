import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Job } from '@/types';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function timeAgo(dateVal?: string | null): string {
  if (!dateVal) return '';
  let d: Date;
  if (dateVal.startsWith('Date(')) {
    const p = dateVal.replace('Date(','').replace(')','').split(',');
    d = new Date(+p[0], +p[1], +p[2]);
  } else { d = new Date(dateVal); }
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days/7)}w ago`;
  return `${Math.floor(days/30)}mo ago`;
}

export function postedTimestamp(dateVal?: string | null): number {
  if (!dateVal) return 0;
  if (dateVal.startsWith('Date(')) {
    const p = dateVal.replace('Date(','').replace(')','').split(',');
    return new Date(+p[0], +p[1], +p[2]).getTime();
  }
  return new Date(dateVal).getTime() || 0;
}

export function jobSlug(company: string, role: string): string {
  return `${company}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

export function extractKeywords(text: string, limit = 40): string[] {
  const stop = new Set(['the','a','an','and','or','in','on','at','to','for','of','with','is','are','was','were','be','have','do','will','you','we','they','it','this','that','i','he','she']);
  return text.toLowerCase().replace(/[^\w\s]/g,' ').split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w)).slice(0, limit);
}

export function buildMatchScores(jobs: Job[], keywords: string[]): Record<string,number> {
  const scores: Record<string,number> = {};
  jobs.forEach(j => {
    const hay = `${j.Company} ${j.Role} ${j.Description} ${j.JobType}`.toLowerCase();
    let s = 0;
    keywords.forEach(k => { if (hay.includes(k)) s += 3; });
    if (s > 0) scores[j.Company + j.Role] = Math.min(100, s * 4);
  });
  return scores;
}
