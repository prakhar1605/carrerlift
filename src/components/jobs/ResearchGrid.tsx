'use client';
import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useStore } from '@/lib/store';
import type { Professor } from '@/types';

export function ResearchGrid() {
  const { professors, matchedProfs } = useStore();
  const [query, setQuery]   = useState('');
  const [inst,  setInst]    = useState('');
  const [dept,  setDept]    = useState('');

  const institutions = [...new Set(professors.map(p => p['College Name']).filter(Boolean))].sort().slice(0, 30);
  const departments  = [...new Set(professors.map(p => p.Department).filter(Boolean))].sort().slice(0, 20);

  const filtered = professors.filter(p => {
    const hay = `${p.Name} ${p.Department} ${p['Area of Interest']} ${p['College Name']}`.toLowerCase();
    return (!query || hay.includes(query.toLowerCase()))
      && (!inst || p['College Name'] === inst)
      && (!dept || p.Department === dept);
  });

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5578] text-sm">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search professors, departments…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#7C3AED]/40 transition-all" />
        </div>
        <select value={inst} onChange={e => setInst(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none appearance-none cursor-pointer min-w-[160px]">
          <option value="" className="bg-[#0a0f1e]">🏛 All Institutions</option>
          {institutions.map(i => <option key={i} value={i} className="bg-[#0a0f1e]">{i}</option>)}
        </select>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none appearance-none cursor-pointer min-w-[160px]">
          <option value="" className="bg-[#0a0f1e]">📚 All Departments</option>
          {departments.map(d => <option key={d} value={d} className="bg-[#0a0f1e]">{d}</option>)}
        </select>
      </div>

      <p className="text-sm text-[#8B9CC8] mb-4"><span className="text-white font-bold">{filtered.length}</span> Research Opportunities</p>

      <Virtuoso
        useWindowScroll data={filtered} overscan={400}
        components={{ List: ({ style, children, ...props }) => <div {...props} style={style} className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div> }}
        itemContent={(_, prof) => {
          const key     = prof.Name + prof['College Name'];
          const score   = matchedProfs[key] || 0;
          const isMatch = score > 0;
          return (
            <div className={`bg-white/4 border rounded-2xl p-5 flex flex-col gap-2 hover:-translate-y-0.5 transition-all mb-3 ${isMatch ? 'border-[#7C3AED]/30' : 'border-white/8'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-[#8B9CC8]">{prof['College Name']}</p>
                  <h3 className="text-sm font-bold text-white">{prof.Name}</h3>
                  <p className="text-xs text-[#4A5578] mt-0.5">{prof.Department}</p>
                </div>
                {isMatch && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-purple-400 border border-purple-500/20 flex-shrink-0">✓ {Math.round(score)}% Match</span>}
              </div>
              {prof['Area of Interest'] && (
                <p className="text-xs text-[#8B9CC8] line-clamp-2 leading-relaxed">{prof['Area of Interest'].slice(0, 150)}</p>
              )}
              {prof['Mail id'] && (
                <a href={`mailto:${prof['Mail id']}`}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#7C3AED] border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-all">
                  ✉️ Send Email
                </a>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
