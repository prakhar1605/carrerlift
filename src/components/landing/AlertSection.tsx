'use client';
import { useState } from 'react';

export function AlertSection() {
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle');
  const [msg,    setMsg]    = useState('');

  const submit = async () => {
    if (!email.includes('@')) { setMsg('Please enter a valid email.'); setStatus('error'); return; }
    setStatus('loading');
    try {
      const res  = await fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,email,skills}) });
      const data = await res.json();
      if (data.success) setStatus('done');
      else { setMsg(data.error||'Something went wrong.'); setStatus('error'); }
    } catch { setMsg('Network error. Try again.'); setStatus('error'); }
  };

  return (
    <section id="job-alerts" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#00D4FF]/6 to-[#7C3AED]/6 border border-[#00D4FF]/15 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/4 border border-white/8 text-xs font-bold text-[#8B9CC8] uppercase tracking-wide mb-4">🔔 Free Job Alerts</div>
            <h2 className="text-[clamp(20px,3vw,28px)] font-extrabold mb-3">New jobs every day.<br/>We'll email them to you.</h2>
            <p className="text-sm text-[#8B9CC8] leading-relaxed mb-4">We add fresh jobs regularly. Subscribe and get a morning email with the latest ones that match your skills.</p>
            <div className="flex flex-wrap gap-3 text-xs text-[#4A5578]">
              <span>✅ Free forever</span><span>✅ No spam</span><span>✅ Unsubscribe anytime</span>
            </div>
          </div>

          {status === 'done' ? (
            <div className="flex-shrink-0 w-full md:w-72 flex flex-col items-center justify-center text-center py-4">
              <div className="text-5xl mb-3">🎉</div>
              <div className="text-lg font-bold mb-1">You're in!</div>
              <p className="text-sm text-[#8B9CC8]">Check your inbox — confirmation coming shortly.</p>
            </div>
          ) : (
            <div className="flex-shrink-0 w-full md:w-72 flex flex-col gap-2.5">
              <input value={name}   onChange={e=>setName(e.target.value)}   placeholder="Your name"     className="w-full px-4 py-3 bg-white/5 border border-white/14 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#00D4FF] focus:bg-[#00D4FF]/4 transition-all" />
              <input value={email}  onChange={e=>setEmail(e.target.value)}  placeholder="your@email.com" type="email" className="w-full px-4 py-3 bg-white/5 border border-white/14 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#00D4FF] focus:bg-[#00D4FF]/4 transition-all" />
              <input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Skills (e.g. Python, React, ML)" className="w-full px-4 py-3 bg-white/5 border border-white/14 rounded-xl text-sm text-white placeholder-[#4A5578] focus:outline-none focus:border-[#00D4FF] focus:bg-[#00D4FF]/4 transition-all" />
              <button onClick={submit} disabled={status==='loading'} className="w-full py-3 font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,212,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                {status==='loading' ? '⏳ Subscribing...' : '🔔 Get Job Alerts'}
              </button>
              {status==='error' && <p className="text-xs text-red-400 text-center">{msg}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
