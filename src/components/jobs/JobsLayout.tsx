'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import type { Job, Professor, HRContact } from '@/types';
import { JobsHeader }   from './JobsHeader';
import { JobsTabBar }   from './JobsTabBar';
import { JobsGrid }     from './JobsGrid';
import { GlobalGrid }   from './GlobalGrid';
import { ResearchGrid } from './ResearchGrid';
import { HRGrid }       from './HRGrid';

interface Props {
  initialJobs: Job[];
  initialProfessors: Professor[];
  initialHRContacts: HRContact[];
}

export function JobsLayout({ initialJobs, initialProfessors, initialHRContacts }: Props) {
  const { setJobs, setProfessors, setHRContacts, setGlobalJobs, activeTab } = useStore();

  // Hydrate store with server-fetched data
  useEffect(() => {
    setJobs(initialJobs);
    setProfessors(initialProfessors);
    setHRContacts(initialHRContacts);

    // Fetch global jobs client-side (non-blocking)
    fetch('/api/global-jobs')
      .then(r => r.json())
      .then(d => { if (d.jobs) setGlobalJobs(d.jobs); })
      .catch(console.warn);
  }, []);

  return (
    <div className="min-h-screen bg-[#05080f] text-[#F0F4FF]">
      <JobsHeader
        indiaCount={initialJobs.length}
        hrCount={initialHRContacts.length}
        profCount={initialProfessors.length}
      />
      <JobsTabBar />
      <main className="max-w-7xl mx-auto px-4 pb-16 pt-4">
        {activeTab === 'jobs'     && <JobsGrid />}
        {activeTab === 'global'   && <GlobalGrid />}
        {activeTab === 'research' && <ResearchGrid />}
        {activeTab === 'hr'       && <HRGrid />}
      </main>
    </div>
  );
}
