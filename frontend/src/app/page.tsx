'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check session storage for prototype authentication
    const userStr = sessionStorage.getItem('nyayasetu_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'reviewer') router.push('/reviewer');
        else if (user.role === 'officer') router.push('/officer');
        else router.push('/landing');
      } catch (e) {
        router.push('/landing');
      }
    } else {
      router.push('/landing');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#06111f] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
