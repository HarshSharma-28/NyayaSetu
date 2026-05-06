import Link from 'next/link';
import Image from 'next/image';
import { IMAGES, getImageWithFallback } from '@/lib/images/image-loader';
import { Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      <div className="glass-card max-w-md w-full p-10 flex flex-col items-center text-center relative z-10">
        <Image
          src={getImageWithFallback(IMAGES.NATIONAL_EMBLEM, '/placeholder.svg', '404 Emblem')}
          alt="National Emblem"
          width={50}
          height={70}
          className="mb-8 opacity-80"
        />
        
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-gold mb-2">404</h2>
        <h3 className="text-xl font-bold text-white mb-4">Page Not Found</h3>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          The case or page you're looking for doesn't exist or has been moved.
        </p>

        <div className="w-full relative mb-8 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-text-muted group-focus-within:text-gold-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search cases..."
            className="w-full bg-navy-900 border border-border-default rounded-md py-3 pl-10 pr-4 text-sm text-white placeholder-text-placeholder focus-gold transition-all"
          />
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3 bg-navy-800 text-white rounded-md hover:bg-navy-700 transition-colors border border-border-default"
        >
          <Home size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
