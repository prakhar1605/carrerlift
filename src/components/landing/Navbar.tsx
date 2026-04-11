'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';
import { AuthModal } from '@/components/ui/AuthModal';

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const { user } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 transition-all duration-300 border-b border-white/8 ${scrolled ? 'bg-[#05080f]/97 backdrop-blur-xl' : 'bg-[#05080f]/80 backdrop-blur-lg'}`}>
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/logo.png" alt="Carrerlift" width={24} height={24} className="rounded-md" onError={(e:any)=>e.target.style.display='none'} />
          <span className="font-bold text-lg gradient-text">Carrerlift</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {['How it Works','Features','Job Alerts','Reviews'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="px-3 py-1.5 rounded-lg text-[#8B9CC8] text-sm font-medium hover:text-white hover:bg-white/7 transition-all">{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <button onClick={() => setShowAuth(true)} className="hidden sm:flex px-3 py-1.5 text-sm font-semibold text-white border border-white/15 rounded-lg hover:bg-white/7 transition-all">Sign In</button>
              <button onClick={() => setShowAuth(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-lg hover:shadow-[0_4px_18px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all">
                🚀 Get Started Free
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/7 border border-white/10 text-white text-sm">☰</button>
            </>
          ) : (
            <>
              <Link href="/jobs" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-lg hover:-translate-y-0.5 transition-all">🔍 Browse Jobs</Link>
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] text-[#05080f] font-bold text-sm flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0a0f1e] border border-white/12 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-3 py-2.5 border-b border-white/7">
                      <p className="text-xs text-[#475569] uppercase tracking-wide">Signed in as</p>
                      <p className="text-xs font-semibold text-white mt-0.5 truncate">{user.email}</p>
                    </div>
                    <Link href="/jobs" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#8B9CC8] hover:text-white hover:bg-white/5 transition-all">🔍 Browse Jobs</Link>
                    <button onClick={() => { signOutUser(); setDropOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#8B9CC8] hover:text-red-300 hover:bg-red-500/10 transition-all">🚪 Sign Out</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-[#05080f]/98 border-b border-white/8 flex flex-col gap-1 p-3">
          {['How it Works','Features','Job Alerts','Reviews'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-[#8B9CC8] text-sm font-medium hover:text-white hover:bg-white/7">{l}</a>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setShowAuth(true); setMobileOpen(false); }} className="flex-1 py-2 text-sm font-semibold text-white border border-white/15 rounded-lg">Sign In</button>
            <button onClick={() => { setShowAuth(true); setMobileOpen(false); }} className="flex-1 py-2 text-sm font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-lg">Get Started</button>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
