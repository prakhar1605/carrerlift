import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-white/8">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-1">
            <Image src="/logo.png" alt="Carrerlift" width={22} height={22} className="rounded-md" />
            <span className="font-bold gradient-text">Carrerlift</span>
          </Link>
          <p className="text-xs text-[#4A5578]">AI Career Platform for Students</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {[['#how-it-works','How it Works'],['#features','Features'],['#reviews','Reviews'],['mailto:carrerlift@gmail.com','Contact']].map(([h,l]) => (
            <a key={l} href={h} className="text-sm text-[#8B9CC8] hover:text-[#00D4FF] transition-colors">{l}</a>
          ))}
        </div>
      </div>
      <div className="border-t border-white/8 py-3 text-center">
        <p className="text-xs text-[#4A5578]">© 2025 Carrerlift · Made with ❤️ for students</p>
      </div>
    </footer>
  );
}
