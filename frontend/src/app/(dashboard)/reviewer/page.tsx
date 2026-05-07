'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { ConfidenceIndicator } from '@/components/shared/ConfidenceIndicator';
import { ArrowRight, CheckCircle2, XCircle, FileText, ListTodo } from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/api/client';

export default function ReviewerDashboard() {
  const [stats, setStats] = useState({ pending: 0, reviewedToday: 0, avgConfidence: 0.0, rejected: 0 });
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    // Fetch stats
    api.dashboard.stats().then((res: any) => {
      setStats({
        pending: res.pending_directives || 0,
        reviewedToday: res.completed_directives || 0,
        avgConfidence: res.avg_confidence || 0.92,
        rejected: res.rejected_count || 0
      });
    }).catch(err => console.error(err));

    // Fetch cases queue
    api.cases.list().then((res: any) => {
      const data = res.cases || res.items || res.data || res;
      setQueue(Array.isArray(data) ? data : []);
    }).catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-white">Loading Verification Queue...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* STATS ROW */}
      <ErrorBoundary sectionName="Stats Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* PENDING */}
          <div className="glass-card p-6 relative overflow-hidden border-amber-500/20 bg-amber-500/5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Pending in Queue</div>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md"><ListTodo size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          
          {/* REVIEWED */}
          <div className="glass-card p-6 relative overflow-hidden border-green-500/20 bg-green-500/5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-green-400 text-sm font-semibold uppercase tracking-wider">Reviewed Today</div>
              <div className="p-2 bg-green-500/10 text-green-500 rounded-md"><CheckCircle2 size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.reviewedToday}</div>
          </div>
          
          {/* CONFIDENCE */}
          <div className="glass-card p-6 relative overflow-hidden border-[#d4af37]/20 bg-[#d4af37]/5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Avg Confidence</div>
              <div className="p-2 bg-gold-500/10 text-gold-500 rounded-md"><FileText size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{(stats.avgConfidence * 100).toFixed(1)}%</div>
          </div>
          
          {/* REJECTED */}
          <div className="glass-card p-6 relative overflow-hidden border-red-500/20 bg-red-500/5">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-red-400 text-sm font-semibold uppercase tracking-wider">Rejected Today</div>
              <div className="p-2 bg-red-500/20 text-red-500 rounded-md"><XCircle size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.rejected}</div>
          </div>
        </div>
      </ErrorBoundary>

      {/* PRIORITY QUEUE */}
      <ErrorBoundary sectionName="Verification Queue">
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Priority Verification Queue</h2>
              <p className="text-sm text-text-secondary">Please verify extracted directives against the source PDF.</p>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Queue is clear 🎉</h3>
              <p className="text-text-secondary">All extracted directives have been verified.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((caseItem) => (
                <div key={caseItem.id} className="glass-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group hover:border-[#d4af37]/30 transition-all">
                  <div className="flex flex-col gap-2 min-w-[280px]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-[#d4af37] tracking-tight">{caseItem.case_number}</span>
                      <PriorityBadge priority={caseItem.priority as any} />
                    </div>
                    <div className="text-sm text-white/50 flex items-center gap-2">
                      <FileText size={14} className="text-white/20" />
                      {caseItem.court_name}
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold bg-white/[0.03] text-white/40 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                        {caseItem.directives_count} Extracted Directives
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-10 w-full lg:w-auto">
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] text-white/20 uppercase tracking-[2px] font-bold">AI Confidence</div>
                      <ConfidenceIndicator score={caseItem.confidence} size="md" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-white/20 uppercase tracking-[2px] font-bold">Deadline</div>
                      <div className="font-mono font-bold text-sm">
                        <DeadlineCountdown dueDate={caseItem.due_date} />
                      </div>
                    </div>
                    
                    <Link 
                      href={`/reviewer/verify/${caseItem.id}`}
                      className="ml-auto flex items-center gap-3 px-6 py-3 bg-[#d4af37] text-[#06111f] font-bold rounded-xl hover:shadow-[0_8px_24px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 transition-all"
                    >
                      Start Review <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>

    </div>
  );
}
