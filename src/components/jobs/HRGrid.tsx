'use client';
import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useStore } from '@/lib/store';

export function HRGrid() {
  const { hrContacts } = useStore();
  const [query,   setQuery]   = useState('');
  const [company, setCompany] = useState('');
  const [loc,     setLoc]     = useState('');

  const companies = [...new Set(hrContacts.map(h => h['Company Name']).filter(Boolean))].sort().slice(0, 40);
  const locations = [...new Set(hrContacts.map(h => h.Location).filter(Boolean))].sort().slice(0, 20);

  const filtered = hrContacts.filter(h => {
    const hay = `${h.Name} ${h['Company Name']} ${h['Job Title']} ${h.Location}`.toLowerCase();
    return (!query || hay.includes(query.toLowerCase()))
      && (!company || h['Company Name'] === company)
      && (!loc || h.Location === loc);
  });

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5578] text-sm">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search HR, companies…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#00D4FF]/40 transition-all" />
        </div>
        <select value={company} onChange={e => setCompany(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none appearance-none cursor-pointer min-w-[160px]">
          <option value="" className="bg-[#0a0f1e]">🏢 All Companies</option>
          {companies.map(c => <option key={c} value={c} className="bg-[#0a0f1e]">{c}</option>)}
        </select>
        <select value={loc} onChange={e => setLoc(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#8B9CC8] focus:outline-none appearance-none cursor-pointer min-w-[160px]">
          <option value="" className="bg-[#0a0f1e]">📍 All Locations</option>
          {locations.map(l => <option key={l} value={l} className="bg-[#0a0f1e]">{l}</option>)}
        </select>
      </div>

      <p className="text-sm text-[#8B9CC8] mb-4"><span className="text-white font-bold">{filtered.length}</span> HR Contacts & Recruiters</p>

      <Virtuoso
        useWindowScroll data={filtered} overscan={400}
        components={{ List: ({ style, children, ...props }) => <div {...props} style={style} className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div> }}
        itemContent={(_, hr) => (
          <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/15 hover:-translate-y-0.5 transition-all mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{hr.Name}</p>
                <p className="text-xs text-[#8B9CC8]">{hr['Job Title']}</p>
                <p className="text-xs text-[#4A5578] mt-0.5">{hr['Company Name']}{hr.Location ? ` · ${hr.Location}` : ''}</p>
              </div>
              {hr['Company Niche'] && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-[#4A5578] flex-shrink-0">{hr['Company Niche']}</span>}
            </div>
            {hr['Linkedin URL'] && (
              <a href={hr['Linkedin URL']} target="_blank" rel="noopener noreferrer"
                className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all">
                🔗 View LinkedIn
              </a>
            )}
          </div>
        )}
      />
    </div>
  );
}
