'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/shared/PriorityBadge';

export default function OfficerCasesPage() {
  return (
    <ErrorBoundary sectionName="My Dept Cases">
      <div className="space-y-6 animate-fade-in">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">My Department Cases</h1>
            <p className="text-sm text-text-secondary">Read-only view of all cases assigned to the Finance Department.</p>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search department cases..." 
              className="w-full bg-navy-900/80 border border-border-default rounded-md py-2 pl-9 pr-3 text-sm text-white focus-gold"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-navy-900/50 border-b border-border-subtle">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Case Number</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Court</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Directives</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gold-400">
                      WP/202{item}/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      Supreme Court
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority="HIGH" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item} Assigned
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/officer/cases/${item}`} className="text-gold-500 hover:text-gold-400">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
