'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  diff?: { before: string; after: string };
}

interface AuditTrailProps {
  logs: AuditLogEntry[];
}

export function AuditTrail({ logs }: AuditTrailProps) {
  const handleDownload = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.user}: ${l.action} ${l.details ? `(${l.details})` : ''}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">System Audit Trail</h3>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-navy-800 text-gold-500 border border-gold-500/30 rounded hover:bg-gold-500/10 transition-colors"
        >
          <Download size={14} />
          Download Report
        </button>
      </div>

      <div className="relative border-l border-border-default ml-3 space-y-8 pb-4">
        {logs.map((log, idx) => (
          <div key={log.id} className="relative pl-6">
            {/* Dot */}
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gold-500 ring-4 ring-navy-900" />
            
            <div className="bg-navy-900/50 p-4 rounded-md border border-border-subtle">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-white">{log.action}</div>
                <div className="text-xs text-text-muted">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-sm text-text-secondary mb-1">
                By: <span className="text-gold-400 font-medium">{log.user}</span>
              </div>
              {log.details && (
                <div className="text-sm text-text-muted italic">{log.details}</div>
              )}
              {log.diff && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-red-300">
                    <span className="opacity-50 select-none mr-2">-</span>{log.diff.before}
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 p-2 rounded text-green-300">
                    <span className="opacity-50 select-none mr-2">+</span>{log.diff.after}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
