import { Navbar }       from '@/components/landing/Navbar';
import { Hero }         from '@/components/landing/Hero';
import { HowItWorks }   from '@/components/landing/HowItWorks';
import { Features }     from '@/components/landing/Features';
import { Reviews }      from '@/components/landing/Reviews';
import { AlertSection } from '@/components/landing/AlertSection';
import { CtaBanner }    from '@/components/landing/CtaBanner';
import { Footer }       from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05080f] text-[#F0F4FF] overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Reviews />
      <AlertSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}
