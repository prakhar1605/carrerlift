const features = [
  { icon:'✨', title:'AI Resume Matcher', desc:'Upload once — matched with jobs, HR & professors simultaneously. No manual searching.', stat:'50x faster', statSub:'than manual search', color:'#00D4FF', wide:true },
  { icon:'🔬', title:'IIT Research Matching', desc:'Match with IIT professors whose research fits your interests. Get replies.', stat:'1,583', statSub:'professors across IITs', color:'#7C3AED' },
  { icon:'🌍', title:'Global AI/ML Jobs', desc:'Google, NVIDIA, Microsoft & 1,000+ more. USA & International, updated daily.', stat:'1,180+', statSub:'live global roles', color:'#10B981' },
  { icon:'⚡', title:'AI Email Generator', desc:'One click — professional cold email for HR or professors. Opens directly in Gmail.', color:'#F59E0B' },
  { icon:'👥', title:'Direct HR Contacts', desc:'1,837 recruiters at top companies. Skip job portals, email them directly.', color:'#00D4FF' },
  { icon:'📊', title:'Skill Gap Analyzer', desc:'See exactly what skills you\'re missing — with a roadmap to close the gap fast.', color:'#7C3AED' },
];

export function Features() {
  return (
    <section id="features" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/4 border border-white/8 text-xs font-bold text-[#8B9CC8] uppercase tracking-wide mb-4">⭐ Features</div>
        <h2 className="text-[clamp(24px,5vw,40px)] font-extrabold tracking-tight mb-10">Everything in one place</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <div key={f.title} className={`bg-white/4 border border-white/8 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden ${f.wide ? 'sm:col-span-2 lg:col-span-2' : ''}`}
              style={{ borderColor: `${f.color}20` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background:`${f.color}18`, border:`1px solid ${f.color}30` }}>{f.icon}</div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-[#8B9CC8] leading-relaxed">{f.desc}</p>
              {f.stat && (
                <div className="mt-4">
                  <div className="text-[clamp(28px,4vw,40px)] font-extrabold leading-none" style={{ background:`linear-gradient(135deg,${f.color},${f.color}99)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{f.stat}</div>
                  <p className="text-xs text-[#4A5578] mt-1">{f.statSub}</p>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
