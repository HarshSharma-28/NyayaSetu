'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface SectionErrorProps {
  sectionName: string;
  onRetry: () => void;
  error?: Error | null;
}

export default function SectionError({ sectionName, onRetry, error }: SectionErrorProps) {
  return (
    <div className="glass-card-light p-6 flex flex-col items-center justify-center text-center w-full min-h-[200px] border border-red-500/20">
      <AlertTriangle className="text-gold-500 mb-4" size={40} />
      <h3 className="text-lg font-bold text-white mb-2">Section failed to load</h3>
      <p className="text-sm text-text-secondary mb-6">
        An error occurred while loading the <span className="text-gold-400 font-semibold">{sectionName}</span> section.
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-md hover:bg-navy-700 transition-colors border border-border-default"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
        <button 
          onClick={() => console.log('Report issue:', error?.message)}
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-white transition-colors"
        >
          Report Issue
        </button>
      </div>
    </div>
  );
}
