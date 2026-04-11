export function HowItWorks() {
  const steps = [
    { n:'01', icon:'📄', title:'Upload your resume', desc:'Drop your PDF or paste text. Takes 10 seconds.' },
    { n:'02', icon:'🤖', title:'AI finds your matches', desc:'Scans 843+ India jobs, 1,180+ global roles & 1,583 IIT professors — ranked by how well they fit you.' },
    { n:'03', icon:'✉️', title:'Apply with one click', desc:'Apply directly or generate a personalised cold email to HR or professors — written by AI.' },
  ];
  return (
    <section id="how-it-works" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/4 border border-white/8 text-xs font-bold text-[#8B9CC8] uppercase tracking-wide mb-4">🗺 How it Works</div>
        <h2 className="text-[clamp(24px,5vw,40px)] font-extrabold tracking-tight mb-2">3 steps, that's it.</h2>
        <p className="text-[#8B9CC8] mb-10 max-w-md">No complex setup. No learning curve. Works on mobile too.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map(s => (
            <div key={s.n} className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:-translate-y-1 hover:border-[#00D4FF]/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-all duration-300">
              <div className="text-xs font-bold text-[#4A5578] uppercase tracking-widest mb-3">Step {s.n}</div>
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-2xl mb-4">{s.icon}</div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-[#8B9CC8] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
