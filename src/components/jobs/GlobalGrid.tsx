'use client';
import { useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useStore } from '@/lib/store';
import type { GlobalJob } from '@/types';

export function GlobalGrid() {
  const { globalJobs } = useStore();
  const [query, setQuery] = useState('');
  const [type,  setType]  = useState('all');

  const filtered = globalJobs.filter(j => {
    const hay = `${j.company} ${j.role} ${j.location}`.toLowerCase();
    return (!query || hay.includes(query.toLowerCase())) && (type === 'all' || j.jobType === type);
  });

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5578] text-sm">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Google, NVIDIA, ML Engineer…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#00D4FF]/40 transition-all" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none focus:border-[#00D4FF]/40 appearance-none cursor-pointer min-w-[180px]">
          <option value="all" className="bg-[#0a0f1e]">🌐 All Categories</option>
          <option value="intern_intl" className="bg-[#0a0f1e]">🌍 International Internships</option>
          <option value="newgrad_intl" className="bg-[#0a0f1e]">🌍 International New Grad</option>
          <option value="intern_usa" className="bg-[#0a0f1e]">🦅 USA Internships</option>
          <option value="newgrad_usa" className="bg-[#0a0f1e]">🦅 USA New Grad</option>
        </select>
      </div>

      <p className="text-sm text-[#8B9CC8] mb-4"><span className="text-white font-bold">{filtered.length}</span> Global AI/ML Jobs</p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-[#4A5578]">
          <div className="text-5xl mb-4">🌍</div>
          <h3 className="text-lg font-bold text-white mb-2">Loading global jobs…</h3>
          <p className="text-sm">Fetching latest AI/ML opportunities</p>
        </div>
      ) : (
        <Virtuoso
          useWindowScroll
          data={filtered}
          overscan={400}
          components={{
            List: ({ style, children, ...props }) => (
              <div {...props} style={style} className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div>
            ),
          }}
          itemContent={(_, job) => (
            <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-blue-400/25 hover:-translate-y-0.5 transition-all mb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-[#8B9CC8] mb-0.5">{job.company}</p>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{job.role}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 flex-shrink-0">🌍 Global</span>
              </div>
              {job.location && <p className="text-xs text-[#8B9CC8]">📍 {job.location}</p>}
              {job.applyLink && (
                <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                  className="self-start flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-lg hover:-translate-y-0.5 transition-all">
                  🚀 Apply Now
                </a>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
