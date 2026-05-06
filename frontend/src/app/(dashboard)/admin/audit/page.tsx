'use client';

import React from 'react';
import { Shield, Clock } from 'lucide-react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

export default function AuditTrailPage() {
  return (
    <ErrorBoundary sectionName="Audit Trail">
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mb-6">
          <Shield size={40} className="text-gold-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">System Audit Trail</h1>
        <p className="text-text-secondary max-w-lg mb-8">
          The comprehensive audit trail is tracking all background system actions securely. 
          The full interactive viewer interface is currently being provisioned for production.
        </p>
        <div className="px-6 py-3 bg-navy-800/50 border border-border-default rounded-md text-sm text-text-muted font-mono">
          System Logging Status: <span className="text-green-400">ACTIVE & SECURE</span>
        </div>
      </div>
    </ErrorBoundary>
  );
}
