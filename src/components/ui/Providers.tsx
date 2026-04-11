'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { onAuthChange } from '@/lib/firebase';

const qc = new QueryClient({ defaultOptions:{ queries:{ staleTime:5*60*1000, retry:1 } } });

function AuthSync({ children }:{ children:React.ReactNode }) {
  const setUser = useStore(s => s.setUser);
  useEffect(() => { const u = onAuthChange(setUser); return () => u(); }, [setUser]);
  return <>{children}</>;
}

export function Providers({ children }:{ children:React.ReactNode }) {
  const [client] = useState(() => qc);
  return (
    <QueryClientProvider client={client}>
      <AuthSync>{children}</AuthSync>
    </QueryClientProvider>
  );
}
