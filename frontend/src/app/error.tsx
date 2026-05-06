'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IMAGES, getImageWithFallback } from '@/lib/images/image-loader';
import { RefreshCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[Page Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      {/* Background Ashoka Chakra */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
        <Image 
          src={getImageWithFallback(IMAGES.ASHOKA_CHAKRA, '/placeholder.svg', 'Error BG')}
          alt="Background Chakra"
          width={600}
          height={600}
          className="animate-slow-spin"
        />
      </div>

      <div className="glass-card max-w-md w-full p-10 flex flex-col items-center text-center relative z-10 border-red-500/30">
        <Image
          src={getImageWithFallback(IMAGES.NATIONAL_EMBLEM, '/placeholder.svg', 'Error Emblem')}
          alt="National Emblem"
          width={60}
          height={85}
          className="mb-6 drop-shadow-lg"
        />
        
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          The application encountered an unexpected error. 
          Our technical team has been notified.
        </p>

        {error.digest && (
          <div className="mb-8 p-3 bg-navy-950 border border-border-subtle rounded text-xs text-text-muted font-mono">
            Error Ref: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row w-full gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-800 text-white rounded-md hover:bg-navy-700 transition-colors border border-border-default"
          >
            <RefreshCcw size={18} />
            Reload Page
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-gold text-navy-950 font-bold rounded-md hover:shadow-gold transition-all"
          >
            <Home size={18} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
