'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import Link from 'next/link';

export default function DeadlinesPage() {
  return (
    <ErrorBoundary sectionName="Deadlines Calendar">
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Calendar size={40} className="text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Master Deadlines Calendar</h1>
        <p className="text-text-secondary max-w-lg mb-8">
          A centralized calendar view of all upcoming and active compliance deadlines across all state departments.
          The visual calendar module is currently under construction.
        </p>
        <Link href="/admin/cases" className="px-6 py-3 bg-gradient-gold text-navy-950 font-bold rounded-md hover:shadow-gold transition-all duration-300">
          View All Cases Instead
        </Link>
      </div>
    </ErrorBoundary>
  );
}
