'use client';

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api/client';

export default function ReviewerCasesPage() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Pending', 'In Review', 'Verified', 'Overdue'];

  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.cases.list()
      .then(res => {
        const data = (res as any).cases || (res as any).items || (res as any).data || res;
        setCases(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Cases fetch failed:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCases = activeTab === 'All'
    ? cases
    : cases.filter(c => (c.status || '').toLowerCase().replace('_', ' ') === activeTab.toLowerCase());

  return (
    <ErrorBoundary sectionName="Reviewer Cases List">
      <div className="space-y-6 animate-fade-in">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Case Registry</h1>
            <p className="text-sm text-text-secondary">Review assigned judicial directives.</p>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex bg-navy-900/50 p-1 rounded-lg border border-border-subtle overflow-x-auto w-full md:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-navy-800 text-white shadow-sm border border-border-default font-semibold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search cases..."
                className="w-full bg-navy-900/80 border border-border-default rounded-md py-2 pl-9 pr-3 text-sm text-white focus-gold"
              />
            </div>
            <button className="flex items-center justify-center w-10 h-10 bg-navy-900/80 border border-border-default rounded-md text-text-muted hover:text-white transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-navy-900/50 border-b border-border-subtle">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Case Number</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Petitioner</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted">Loading cases...</td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                      No cases found.
                    </td>
                  </tr>
                ) : filteredCases.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gold-400">
                      {item.case_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {item.petitioner || item.court_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.department || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={item.priority || 'MEDIUM'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-secondary">
                      {item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/reviewer/cases/${item.id}`} className="text-gold-500 hover:text-gold-400">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between bg-navy-900/30">
            <span className="text-xs text-text-muted">Showing {filteredCases.length} cases</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-navy-800 border border-border-default rounded text-xs text-text-muted disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 bg-navy-800 border border-border-default rounded text-xs text-white hover:bg-navy-700 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
