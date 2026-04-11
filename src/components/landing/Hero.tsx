'use client';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-12 text-center overflow-hidden">
      {/* BG glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00D4FF]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#7C3AED]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D4FF]/8 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold mb-6 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
          Free for students · India & Global
        </div>

        {/* Title */}
        <h1 className="text-[clamp(32px,8vw,60px)] font-extrabold leading-tight tracking-tight mb-5 animate-fade-up" style={{animationDelay:'0.1s'}}>
          Stop searching jobs manually.<br />
          <span className="gradient-text">Let AI do it for you.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[clamp(15px,3vw,18px)] text-[#8B9CC8] leading-relaxed mb-8 max-w-xl mx-auto animate-fade-up" style={{animationDelay:'0.2s'}}>
          Upload your resume — AI <strong className="text-white">instantly matches you</strong> with jobs, internships, IIT research & 1,180+ global AI/ML opportunities. No endless scrolling.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 animate-fade-up" style={{animationDelay:'0.3s'}}>
          <button onClick={() => router.push('/jobs')} className="px-7 py-4 font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-xl text-base shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_8px_36px_rgba(0,212,255,0.45)] hover:-translate-y-1 transition-all">
            🚀 Try it Free — Takes 30 seconds
          </button>
          <button onClick={() => router.push('/jobs')} className="px-6 py-3.5 font-semibold text-white bg-white/7 border border-white/15 rounded-xl text-base hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
            👁 See how it works
          </button>
        </div>

        <p className="text-xs text-[#4A5578] animate-fade-up" style={{animationDelay:'0.4s'}}>
          ⏱ 10-min free preview &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; No spam
        </p>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap animate-fade-up" style={{animationDelay:'0.5s'}}>
          <div className="flex">
            {['#00D4FF','#7C3AED','#10B981','#F59E0B','#EF4444'].map((c,i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#05080f] flex items-center justify-center text-[10px] font-bold text-[#05080f]" style={{background:`linear-gradient(135deg,${c},${c}99)`,marginLeft:i?'-6px':'0'}}>
                {['A','R','S','P','K'][i]}
              </div>
            ))}
          </div>
          <span className="text-sm text-[#8B9CC8]"><strong className="text-white">1,000+</strong> students this month</span>
          <span className="text-[#F59E0B] text-sm">★★★★★</span>
          <span className="text-sm text-[#8B9CC8] font-semibold">4.9/5</span>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-up" style={{animationDelay:'0.6s'}}>
          {[['843+','India Jobs'],['1,180+','Global AI/ML'],['1,583','IIT Professors'],['1,837','HR Contacts']].map(([n,l]) => (
            <div key={l} className="px-4 py-2 rounded-full bg-white/4 border border-white/8 text-sm font-semibold text-white backdrop-blur-sm">
              <span className="text-[#00D4FF]">{n}</span> {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
