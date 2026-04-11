import type { Metadata } from 'next';
import { Providers } from '@/components/ui/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carrerlift — AI Career Platform | Jobs, Internships & Research',
  description: 'Upload your resume. AI matches you with jobs, internships, IIT research & 1,180+ global AI/ML opportunities. Free for students.',
  openGraph: { title:'Carrerlift', description:'Stop searching manually. Let AI find your perfect job.', url:'https://carrerlift.in', type:'website' },
};

export default function RootLayout({ children }:{ children:React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FRMVZ6H187" />
        <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FRMVZ6H187');`}} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
