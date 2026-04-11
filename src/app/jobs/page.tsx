import { Suspense } from 'react';
import { JobsLayout } from '@/components/jobs/JobsLayout';
import { fetchJobs, fetchProfessors, fetchHRContacts } from '@/lib/data';

export const revalidate = 300;

export default async function JobsPage() {
  const [jobs, professors, hrContacts] = await Promise.all([
    fetchJobs(), fetchProfessors(), fetchHRContacts(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05080f] flex items-center justify-center">
        <p className="text-[#00D4FF] animate-pulse text-lg">Loading Carrerlift…</p>
      </div>
    }>
      <JobsLayout
        initialJobs={jobs}
        initialProfessors={professors}
        initialHRContacts={hrContacts}
      />
    </Suspense>
  );
}
