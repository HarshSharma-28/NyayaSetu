'use client';

import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { AuditTrail } from '@/components/shared/AuditTrail';
import { FolderOpen, Clock, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api/client';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, dueThisWeek: 0, overdue: 0 });
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real data from the NyayaSetu backend
    api.dashboard.stats()
      .then(res => setStats(res as any))
      .catch(err => console.error("Stats fetch failed:", err));
      
    api.cases.list()
      .then(res => {
        const data = (res as any).items || (res as any).data || res;
        setCases(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Cases fetch failed:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 1. ALERT BANNER */}
      {stats.overdue > 0 && (
        <ErrorBoundary sectionName="Alert Banner">
          <div className="glass-card border-red-500/50 bg-red-500/5 p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20" />
              <div>
                <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide">Action Required</h3>
                <p className="text-white text-sm">
                  <span className="font-bold text-red-400">{stats.overdue} cases</span> are OVERDUE — contempt notice risk. 
                  (WP/992/2023, SLP/112/2024)
                </p>
              </div>
            </div>
            <Link href="/admin/cases?status=overdue" className="px-4 py-2 bg-red-500/20 text-red-400 font-semibold rounded hover:bg-red-500/30 transition-colors text-sm border border-red-500/30">
              View All
            </Link>
          </div>
        </ErrorBoundary>
      )}

      {/* 2. STATS ROW */}
      <ErrorBoundary sectionName="Stats Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="gold-accent-top"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Total Cases</div>
              <div className="p-2 bg-gold-500/10 text-gold-500 rounded-md"><FolderOpen size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="gold-accent-top"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Pending Verif.</div>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md"><Clock size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="gold-accent-top"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Due This Week</div>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md"><Calendar size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.dueThisWeek}</div>
          </div>
          
          <div className="glass-card p-6 relative overflow-hidden border-red-500/30 bg-red-500/5">
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-red-500/50"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-red-400 text-sm font-semibold uppercase tracking-wider">Overdue</div>
              <div className="p-2 bg-red-500/20 text-red-500 rounded-md"><AlertTriangle size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
          </div>
        </div>
      </ErrorBoundary>

      {/* 3. INSIGHT STRIP */}
      <ErrorBoundary sectionName="AI Insights">
        <div className="grid grid-cols-3 gap-6">
          <div className="glass-card-light px-6 py-4 flex justify-between items-center">
            <div className="text-xs text-text-muted uppercase">Avg Extraction Time</div>
            <div className="text-sm font-mono font-bold text-gold-400">1.2s</div>
          </div>
          <div className="glass-card-light px-6 py-4 flex justify-between items-center">
            <div className="text-xs text-text-muted uppercase">AI Confidence Avg</div>
            <div className="text-sm font-mono font-bold text-green-400">94.8%</div>
          </div>
          <div className="glass-card-light px-6 py-4 flex justify-between items-center">
            <div className="text-xs text-text-muted uppercase">Contempt Risk Warnings</div>
            <div className="text-sm font-mono font-bold text-red-400">2 Active</div>
          </div>
        </div>
      </ErrorBoundary>

      {/* 4. MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-6">
          <ErrorBoundary sectionName="Recent Cases">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Recent Cases</h2>
              <Link href="/admin/cases" className="text-sm text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default text-xs text-text-muted uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-semibold">Case No.</th>
                    <th className="pb-3 pr-4 font-semibold">Court</th>
                    <th className="pb-3 pr-4 font-semibold">Dept</th>
                    <th className="pb-3 pr-4 font-semibold">Priority</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Days Left</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {cases.map((c) => (
                    <tr key={c.id} className="border-b border-border-subtle hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => window.location.href = `/admin/cases/${c.id}`}>
                      <td className="py-4 pr-4 font-semibold text-gold-400 group-hover:text-gold-300">{c.case_number}</td>
                      <td className="py-4 pr-4 text-text-secondary truncate max-w-[150px]">{c.court_name}</td>
                      <td className="py-4 pr-4 text-white">{c.department}</td>
                      <td className="py-4 pr-4"><PriorityBadge priority={c.priority as any} /></td>
                      <td className="py-4 pr-4">
                        <span className="text-xs bg-navy-800 border border-border-default px-2 py-1 rounded">{c.status}</span>
                      </td>
                      <td className="py-4 pr-4 text-right font-mono"><DeadlineCountdown dueDate={c.due_date} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ErrorBoundary>
        </div>
        
        <div className="col-span-1 space-y-6">
          <ErrorBoundary sectionName="Upcoming Deadlines">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Upcoming Deadlines</h2>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 bg-navy-900/50 rounded-md border border-border-subtle hover:border-gold-500/30 transition-colors cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-white">WP/12{i}4/2024</div>
                      <div className="text-xs text-text-muted">Finance Dept</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-amber-500 font-bold">{i}d 14h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>

    </div>
  );
}
