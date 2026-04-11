'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { signOutUser } from '@/lib/firebase';
import { AuthModal } from '@/components/ui/AuthModal';

interface Props { indiaCount: number; hrCount: number; profCount: number; }

export function JobsHeader({ indiaCount, hrCount, profCount }: Props) {
  const { user, globalJobs } = useStore();
  const [showAuth, setShowAuth] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#05080f]/95 backdrop-blur-xl border-b border-white/8 h-14 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo.png" alt="Carrerlift" width={22} height={22} className="rounded-md" onError={(e:any)=>e.target.style.display='none'} />
            <span className="font-bold gradient-text hidden sm:block">Carrerlift</span>
          </Link>

          <div className="text-xs text-[#4A5578] font-medium hidden md:block">
            {indiaCount} India · {globalJobs.length||'…'} Global · {hrCount} HR · {profCount} Research
          </div>

          {!user ? (
            <button onClick={() => setShowAuth(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#05080f] bg-gradient-to-r from-[#00D4FF] to-[#0099cc] rounded-lg">
              🚀 Sign Up Free
            </button>
          ) : (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] text-[#05080f] font-bold text-sm flex items-center justify-center">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0a0f1e] border border-white/12 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-white/7">
                    <p className="text-xs text-[#475569]">Signed in as</p>
                    <p className="text-xs font-semibold text-white truncate mt-0.5">{user.email}</p>
                  </div>
                  <button onClick={() => { signOutUser(); setDropOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#8B9CC8] hover:text-red-300 hover:bg-red-500/10 transition-all">🚪 Sign Out</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
