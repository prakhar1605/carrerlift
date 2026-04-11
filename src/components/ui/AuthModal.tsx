'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithGoogle } from '@/lib/firebase';

interface Props { onClose: () => void; }

export function AuthModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const router = useRouter();

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const user = await signInWithGoogle();
      if (user) { onClose(); router.push('/jobs'); }
    } catch { setError('Sign-in failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="bg-[#0a0f1e] border border-white/12 rounded-2xl p-8 w-full max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.7)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/6 border border-white/10 text-[#8B9CC8] hover:text-white flex items-center justify-center transition-all">✕</button>
        
        <div className="flex items-center gap-2 mb-6">
          <Image src="/logo.png" alt="Carrerlift" width={28} height={28} className="rounded-md" onError={(e:any)=>e.target.style.display='none'} />
          <span className="font-bold text-lg gradient-text">Carrerlift</span>
        </div>

        <h2 className="text-xl font-bold mb-2">Find jobs that match you 🎯</h2>
        <p className="text-sm text-[#8B9CC8] mb-6 leading-relaxed">Sign in to upload your resume and get matched with jobs, internships & research — instantly. <strong className="text-white">100% Free.</strong></p>

        <button onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={20} height={20} />
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/7" /><span className="text-xs text-[#4A5578]">or explore first</span><div className="flex-1 h-px bg-white/7" />
        </div>

        <button onClick={() => { onClose(); router.push('/jobs'); }}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#8B9CC8] border border-white/12 rounded-xl hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition-all">
          👁 Browse for 10 minutes — no signup needed
        </button>

        {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
        <p className="mt-4 text-xs text-[#4A5578] text-center">No spam · Free forever · 1,000+ students using this</p>
      </div>
    </div>
  );
}
