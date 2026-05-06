'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { ListTodo, Calendar, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Mock data
const MOCK_ACTIONS = [
  { id: '1', case_number: 'WP/1234/2024', directive: 'Clear pending dues', due_date: new Date(Date.now() + 86400000).toISOString(), status: 'PENDING' },
  { id: '2', case_number: 'SLP/552/2023', directive: 'File compliance report', due_date: new Date(Date.now() - 86400000).toISOString(), status: 'IN_PROGRESS' },
];

export default function OfficerDashboard() {
  const [stats] = useState({ pending: 8, dueThisWeek: 3, completedMonth: 12, overdue: 1 });
  const [actions, setActions] = useState(MOCK_ACTIONS);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'COMPLETED') {
      setUpdatingId(id);
      return;
    }
    
    // Optimistic update
    setActions(actions.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast.success('Status updated');
  };

  const submitCompletion = () => {
    if (!updatingId) return;
    setActions(actions.map(a => a.id === updatingId ? { ...a, status: 'COMPLETED' } : a));
    toast.success('Action marked as completed');
    setUpdatingId(null);
    setCompletionNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* STATS ROW */}
      <ErrorBoundary sectionName="Stats Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="gold-accent-top"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Pending Actions</div>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md"><ListTodo size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="gold-accent-top"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Due This Week</div>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md"><Calendar size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.dueThisWeek}</div>
          </div>
          
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="gold-accent-top"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="text-green-400 text-sm font-semibold uppercase tracking-wider">Completed Month</div>
              <div className="p-2 bg-green-500/10 text-green-500 rounded-md"><CheckCircle2 size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.completedMonth}</div>
          </div>
          
          <div className={`glass-card p-6 relative overflow-hidden ${stats.overdue > 0 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
            {stats.overdue > 0 && <div className="absolute top-0 left-10 right-10 h-[1px] bg-red-500/50"></div>}
            <div className="flex justify-between items-start mb-4">
              <div className="text-red-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                Overdue {stats.overdue > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <div className="p-2 bg-red-500/20 text-red-500 rounded-md"><AlertTriangle size={20} /></div>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
          </div>
        </div>
      </ErrorBoundary>

      {/* ACTION PLANS TABLE */}
      <ErrorBoundary sectionName="My Action Plans">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-6">Active Action Plans (Finance Dept)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default text-xs text-text-muted uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">Case No.</th>
                  <th className="pb-3 pr-4 font-semibold">Action Required</th>
                  <th className="pb-3 pr-4 font-semibold">Time Left</th>
                  <th className="pb-3 pr-4 font-semibold">Status Update</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {actions.map((a) => (
                  <tr key={a.id} className="border-b border-border-subtle hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4 font-semibold text-gold-400">
                      <Link href={`/officer/cases/${a.id}`} className="hover:underline">{a.case_number}</Link>
                    </td>
                    <td className="py-4 pr-4 text-white max-w-md">{a.directive}</td>
                    <td className="py-4 pr-4 font-mono"><DeadlineCountdown dueDate={a.due_date} /></td>
                    <td className="py-4 pr-4">
                      {updatingId === a.id ? (
                        <div className="flex flex-col gap-2 w-64 animate-fade-in">
                          <textarea 
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                            placeholder="Add completion notes / reference number..."
                            className="w-full bg-navy-950 border border-border-default rounded p-2 text-xs text-white min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setUpdatingId(null)} className="flex-1 py-1 bg-navy-800 text-text-muted text-xs rounded hover:text-white">Cancel</button>
                            <button onClick={submitCompletion} className="flex-1 py-1 bg-green-600 text-white font-bold text-xs rounded hover:bg-green-700">Submit</button>
                          </div>
                        </div>
                      ) : (
                        <select 
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          className={`bg-navy-950 border rounded-md py-1.5 px-3 text-xs font-semibold focus-gold outline-none ${
                            a.status === 'COMPLETED' ? 'border-green-500/50 text-green-400' :
                            a.status === 'IN_PROGRESS' ? 'border-amber-500/50 text-amber-400' :
                            'border-border-default text-text-secondary'
                          }`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Mark Completed ✓</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ErrorBoundary>

    </div>
  );
}
