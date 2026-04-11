'use client';
import { useStore } from '@/lib/store';

const TABS = [
  { id: 'jobs',     icon: '🔥', label: 'Jobs' },
  { id: 'global',   icon: '🌍', label: 'Global' },
  { id: 'research', icon: '🔬', label: 'Research' },
  { id: 'hr',       icon: '👥', label: 'HR' },
];

export function JobsTabBar() {
  const { activeTab, setActiveTab, jobs, globalJobs, professors, hrContacts } = useStore();

  const counts: Record<string, number> = {
    jobs: jobs.length,
    global: globalJobs.length,
    research: professors.length,
    hr: hrContacts.length,
  };

  return (
    <nav className="sticky top-14 z-30 bg-[#05080f]/95 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-none py-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#00D4FF]/12 text-[#00D4FF] border border-[#00D4FF]/25'
                : 'text-[#8B9CC8] hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-white/8 text-[#4A5578]'
            }`}>
              {counts[tab.id] || '…'}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
