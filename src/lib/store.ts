'use client';
import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { Job, GlobalJob, MixedJob, Professor, HRContact } from '@/types';
import { postedTimestamp } from './utils';

const DAY = 86400000;

interface Store {
  user: User | null; setUser: (u: User | null) => void;
  jobs: Job[]; setJobs: (j: Job[]) => void;
  professors: Professor[]; setProfessors: (p: Professor[]) => void;
  hrContacts: HRContact[]; setHRContacts: (h: HRContact[]) => void;
  globalJobs: GlobalJob[]; setGlobalJobs: (g: GlobalJob[]) => void;
  resumeText: string; setResumeText: (t: string) => void;
  matchedJobs: Record<string,number>; setMatchedJobs: (m: Record<string,number>) => void;
  matchedProfs: Record<string,number>; setMatchedProfs: (m: Record<string,number>) => void;
  timeFilter: 'all'|'today'|'week'|'month'; setTimeFilter: (f: 'all'|'today'|'week'|'month') => void;
  searchQuery: string; setSearchQuery: (q: string) => void;
  locationFilter: string; setLocationFilter: (l: string) => void;
  typeFilter: string; setTypeFilter: (t: string) => void;
  savedSlugs: string[]; toggleSave: (slug: string) => void;
  activeTab: string; setActiveTab: (t: string) => void;
  getMixedJobs: () => MixedJob[];
  getFilteredJobs: () => MixedJob[];
}

export const useStore = create<Store>((set, get) => ({
  user: null, setUser: u => set({ user: u }),
  jobs: [], setJobs: j => set({ jobs: j }),
  professors: [], setProfessors: p => set({ professors: p }),
  hrContacts: [], setHRContacts: h => set({ hrContacts: h }),
  globalJobs: [], setGlobalJobs: g => set({ globalJobs: g }),
  resumeText: '', setResumeText: t => set({ resumeText: t }),
  matchedJobs: {}, setMatchedJobs: m => set({ matchedJobs: m }),
  matchedProfs: {}, setMatchedProfs: m => set({ matchedProfs: m }),
  timeFilter: 'all', setTimeFilter: f => set({ timeFilter: f }),
  searchQuery: '', setSearchQuery: q => set({ searchQuery: q }),
  locationFilter: '', setLocationFilter: l => set({ locationFilter: l }),
  typeFilter: '', setTypeFilter: t => set({ typeFilter: t }),
  activeTab: 'jobs', setActiveTab: t => set({ activeTab: t }),
  savedSlugs: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cl_saved')??'[]') : [],
  toggleSave: slug => {
    const cur = get().savedSlugs;
    const next = cur.includes(slug) ? cur.filter(s=>s!==slug) : [...cur, slug];
    if (typeof window !== 'undefined') localStorage.setItem('cl_saved', JSON.stringify(next));
    set({ savedSlugs: next });
  },
  getMixedJobs: () => {
    const { jobs, globalJobs } = get();
    const now = Date.now();
    const india: MixedJob[] = jobs.map((j,i) => ({
      _type:'india', _postedAt: postedTimestamp(j.PostedDate)||(now-i*3600000),
      company:j.Company, role:j.Role, location:j.Location, stipend:j.Stipend,
      jobType:j.JobType, description:j.Description, email:j.Email, applyLink:j.ApplyLink, _raw:j,
    }));
    const global: MixedJob[] = globalJobs.map(j => ({
      _type:'global', _postedAt:j.postedAt||(now-7*DAY),
      company:j.company, role:j.role, location:j.location, stipend:j.salary,
      jobType:j.jobType, description:'', email:'', applyLink:j.applyLink, _raw:j,
    }));
    if (!global.length) return india;
    const mixed: MixedJob[] = []; let gi = 0;
    for (let i=0;i<india.length;i++) {
      mixed.push(india[i]);
      if ((i+1)%3===0 && gi<global.length) mixed.push(global[gi++]);
    }
    while (gi<global.length) mixed.push(global[gi++]);
    return mixed;
  },
  getFilteredJobs: () => {
    const { timeFilter, searchQuery, locationFilter, typeFilter, getMixedJobs } = get();
    let jobs = getMixedJobs();
    const now = Date.now();
    if (timeFilter !== 'all') {
      const cutoff = timeFilter==='today' ? now-DAY : timeFilter==='week' ? now-7*DAY : now-30*DAY;
      jobs = jobs.filter(j => j._postedAt >= cutoff);
    }
    const q = searchQuery.toLowerCase();
    const norm = (t: string) => t.toLowerCase().replace(/[-\s]/g,'');
    return jobs.filter(j => {
      const hay = `${j.company} ${j.role} ${j.location} ${j.description}`.toLowerCase();
      return (!q||hay.includes(q)) && (!locationFilter||j.location.trim()===locationFilter) && (!typeFilter||norm(j.jobType)===norm(typeFilter));
    });
  },
}));
