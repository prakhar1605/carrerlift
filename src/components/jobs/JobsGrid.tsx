'use client';
import { useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useStore } from '@/lib/store';
import { JobCard } from './JobCard';

const LOCATIONS = ['','Remote','PAN India','Bangalore','Bengaluru','Mumbai','Noida','Gurgaon','Gurugram','Hyderabad','Pune','Chennai','New Delhi','Delhi','Jaipur','Ahmedabad','Indore','Mohali'];
const LOC_LABELS: Record<string,string> = { '':'📍 All Locations','Remote':'🏠 Remote','PAN India':'🇮🇳 PAN India' };

export function JobsGrid() {
  const {
    getFilteredJobs, timeFilter, setTimeFilter,
    searchQuery, setSearchQuery,
    locationFilter, setLocationFilter,
    typeFilter, setTypeFilter,
    matchedJobs,
  } = useStore();

  const jobs    = getFilteredJobs();
  const india   = jobs.filter(j => j._type === 'india').length;
  const global  = jobs.filter(j => j._type === 'global').length;
  const matched = Object.keys(matchedJobs).length;

  return (
    <div className="mt-4">
      {/* Time filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(['all','today','week','month'] as const).map(f => (
          <button key={f} onClick={() => setTimeFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${timeFilter===f ? 'bg-[#00D4FF]/12 text-[#00D4FF] border-[#00D4FF]/25' : 'text-[#8B9CC8] border-white/10 hover:border-white/20 hover:text-white'}`}>
            {f==='all'?'🔥 All':f==='today'?'⚡ Today':f==='week'?'📅 This Week':'🗓️ This Month'}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5578] text-sm">🔍</span>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search jobs, companies…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#00D4FF]/40 transition-all" />
        </div>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none focus:border-[#00D4FF]/40 transition-all appearance-none cursor-pointer min-w-[140px]">
          {LOCATIONS.map(l => <option key={l} value={l} className="bg-[#0a0f1e]">{LOC_LABELS[l] || l}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none focus:border-[#00D4FF]/40 transition-all appearance-none cursor-pointer min-w-[130px]">
          <option value="" className="bg-[#0a0f1e]">💼 All Types</option>
          <option value="Intern" className="bg-[#0a0f1e]">🎓 Internship</option>
          <option value="Full-time" className="bg-[#0a0f1e]">💼 Full-time</option>
        </select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#8B9CC8]">
          <span className="text-white font-bold">{jobs.length}</span> Latest Jobs
          <span className="text-xs ml-2 text-[#4A5578]">🇮🇳 {india} India · 🌍 {global} Global</span>
        </p>
        {matched > 0 && <span className="text-xs text-[#00D4FF] font-bold">✓ {matched} matched your resume</span>}
      </div>

      {/* Jobs grid — React Virtuoso for performance */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#4A5578]">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-white mb-2">No jobs found</h3>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <Virtuoso
          useWindowScroll
          data={jobs}
          overscan={400}
          itemContent={(index, job) => (
            <div key={index} className={`grid gap-3 mb-3 ${typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <JobCard job={job} index={index} />
            </div>
          )}
          components={{
            List: ({ style, children, ...props }) => (
              <div {...props} style={style} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {children}
              </div>
            ),
          }}
        />
      )}
    </div>
  );
}
