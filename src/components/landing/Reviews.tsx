import Link from 'next/link';

const reviews = [
  { stars:5, text:'"Found 3 matched jobs in seconds. The AI email generator is a game changer — got 2 replies the same day!"', name:'Aryan S.', college:'3rd Year CSE · IIT Delhi', color:'#00D4FF' },
  { stars:5, text:'"The IIT professor matching actually works. I emailed 5 professors and 2 replied in 3 days. Never happened before."', name:'Riya P.', college:'Final Year ECE · NIT Trichy', color:'#7C3AED' },
];

export function Reviews() {
  return (
    <section id="reviews" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/4 border border-white/8 text-xs font-bold text-[#8B9CC8] uppercase tracking-wide mb-4">⭐ Reviews</div>
        <h2 className="text-[clamp(24px,5vw,40px)] font-extrabold tracking-tight mb-2">What students say</h2>
        <p className="text-[#8B9CC8] mb-8">Real feedback. No fake reviews.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reviews.map(r => (
            <div key={r.name} className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:border-white/15 transition-all">
              <div className="text-[#F59E0B] tracking-widest text-sm">{'★'.repeat(r.stars)}</div>
              <p className="text-sm text-[#8B9CC8] leading-relaxed flex-1">{r.text}</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#05080f] flex-shrink-0" style={{ background:`linear-gradient(135deg,${r.color},${r.color}99)` }}>{r.name[0]}</div>
                <div><p className="text-sm font-bold text-white">{r.name}</p><p className="text-xs text-[#4A5578]">{r.college}</p></div>
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-gradient-to-br from-[#00D4FF]/7 to-[#7C3AED]/7 border border-[#00D4FF]/18 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-[44px] font-extrabold leading-none gradient-text">1,000+</div>
            <div className="text-sm font-bold">active users this month</div>
            <div className="text-xs text-[#8B9CC8]">Growing every day</div>
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfPtLnKIYZxBAQaPMFRis0-8TLCRE4FWCO_PWtC0g-VMosahA/viewform" target="_blank"
              className="mt-2 px-4 py-2.5 text-sm font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-xl hover:-translate-y-0.5 transition-all">
              ⭐ Add Your Review
            </Link>
          </div>
        </div>

        {/* Review submit */}
        <div className="mt-4 bg-gradient-to-r from-[#F59E0B]/7 to-[#00D4FF]/5 border border-[#F59E0B]/22 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-3 flex-1">
            <span className="text-3xl flex-shrink-0">⭐</span>
            <div>
              <p className="font-bold text-sm">Used Carrerlift? Share your experience!</p>
              <p className="text-sm text-[#8B9CC8]">Takes 2 minutes. Helps other students find us.</p>
            </div>
          </div>
          <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfPtLnKIYZxBAQaPMFRis0-8TLCRE4FWCO_PWtC0g-VMosahA/viewform" target="_blank"
            className="px-5 py-2.5 text-sm font-bold text-[#05080f] bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-xl shadow-[0_4px_14px_rgba(245,158,11,0.28)] hover:-translate-y-0.5 transition-all whitespace-nowrap">
            ✍️ Leave a Review
          </Link>
        </div>
      </div>
    </section>
  );
}
