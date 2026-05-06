'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine role based on URL path
  let role: 'admin' | 'reviewer' | 'officer' = 'admin';
  if (pathname.includes('/reviewer')) role = 'reviewer';
  else if (pathname.includes('/officer')) role = 'officer';

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950 font-sans text-white">
      <Sidebar role={role} />
      
      <div className="flex flex-col flex-1 ml-[220px] w-[calc(100%-220px)] relative z-10">
        <div className="tricolor-bar absolute top-0 left-0 w-full z-50">
          <div></div><div></div><div></div>
        </div>
        
        <TopNav />
        
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
