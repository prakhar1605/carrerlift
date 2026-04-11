import Link from 'next/link';

export function CtaBanner() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/4 border border-white/8 text-xs font-bold text-[#8B9CC8] uppercase tracking-wide mb-5">⚡ Always Free</div>
        <h2 className="text-[clamp(26px,6vw,48px)] font-extrabold tracking-tight mb-4 leading-tight">Ready to find your<br/>next opportunity?</h2>
        <p className="text-[#8B9CC8] mb-8">Join 1,000+ students who stopped wasting time on irrelevant job boards.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
          <Link href="/jobs" className="px-7 py-4 font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-xl text-base shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_8px_36px_rgba(0,212,255,0.45)] hover:-translate-y-1 transition-all">
            🚀 Get Started — It's Free
          </Link>
          <Link href="/jobs" className="px-6 py-3.5 font-semibold text-white bg-white/7 border border-white/15 rounded-xl text-base hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
            👁 Preview First
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-[#4A5578]">
          <span>✅ Free forever</span><span>✅ No credit card</span><span>✅ No spam</span>
        </div>
      </div>
    </section>
  );
}
