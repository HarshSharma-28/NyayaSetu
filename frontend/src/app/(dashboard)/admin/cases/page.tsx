'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Search, Filter, Download } from 'lucide-react';
import Link from 'next/link';

export default function AdminCasesPage() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Pending', 'In Review', 'Verified', 'Overdue'];

  return (
    <ErrorBoundary sectionName="Cases Full List">
      <div className="space-y-6 animate-fade-in">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Case Registry</h1>
            <p className="text-sm text-text-secondary">Manage and monitor all judicial directives across departments.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-md hover:bg-navy-700 transition-colors border border-border-default text-sm">
            <Download size={16} />
            Export CSV
          </button>
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
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gold-400">
                      WP/202{item}/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      Ramesh Kumar vs State
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      Revenue Department
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={item % 2 === 0 ? 'HIGH' : 'CRITICAL'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-secondary">
                      2024-12-{10 + item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/cases/${item}`} className="text-gold-500 hover:text-gold-400">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between bg-navy-900/30">
            <span className="text-xs text-text-muted">Showing 1 to 5 of 142 cases</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-navy-800 border border-border-default rounded text-xs text-text-muted disabled:opacity-50">Previous</button>
              <button className="px-3 py-1 bg-navy-800 border border-border-default rounded text-xs text-white hover:bg-navy-700">Next</button>
            </div>
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
