'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { AuditTrail } from '@/components/shared/AuditTrail';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { FileText, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('DNA');
  const tabs = ['DNA', 'Directives', 'Action Plans', 'Audit Trail', 'Timeline'];

  // Dummy mock data for layout purposes
  const mockLogs = [
    { id: '1', action: 'Upload & Extraction', user: 'Admin User', timestamp: '2024-05-06T10:00:00Z' },
    { id: '2', action: 'Assigned to Legal Cell', user: 'System Auto-Router', timestamp: '2024-05-06T10:05:00Z', details: 'Confidence: 92%' },
  ];

  return (
    <ErrorBoundary sectionName="Case Detail View">
      <div className="h-[calc(100vh-120px)] flex gap-6 animate-fade-in">
        
        {/* LEFT PANEL - PDF VIEWER (45%) */}
        <div className="w-[45%] flex flex-col h-full glass-card overflow-hidden border-border-default">
          <div className="bg-navy-900/80 p-3 border-b border-border-subtle flex justify-between items-center">
            <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold">
              <FileText size={16} />
              <span>Judgment_Copy.pdf</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <button className="hover:text-white p-1"><ChevronLeft size={16}/></button>
              <span>Page 1 of 12</span>
              <button className="hover:text-white p-1"><ChevronRight size={16}/></button>
            </div>
          </div>
          <div className="flex-1 bg-[#e5e5e5] flex items-center justify-center p-4 overflow-y-auto">
            {/* Visual Stub for react-pdf */}
            <div className="w-full h-full max-w-[800px] bg-white shadow-lg relative p-12 text-black font-serif">
              <div className="text-center mb-8 font-bold text-xl">IN THE HIGH COURT OF JUDICATURE</div>
              <div className="mb-4">WP/1234/2024</div>
              <p className="mb-4 text-justify leading-relaxed opacity-50">
                ...Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
              <p className="mb-4 text-justify leading-relaxed bg-yellow-200 p-1">
                "The respondents are directed to clear all pending dues within a period of four weeks from the date of this order."
              </p>
              <p className="mb-4 text-justify leading-relaxed opacity-50">
                ...Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - TABS (55%) */}
        <div className="w-[55%] flex flex-col h-full">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/admin/cases" className="p-2 bg-navy-800 rounded hover:bg-navy-700 transition-colors border border-border-default">
              <ChevronLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-wide">WP/1234/2024</h1>
            <PriorityBadge priority="HIGH" className="ml-2" />
          </div>

          <div className="flex bg-navy-900/50 p-1 rounded-lg border border-border-subtle overflow-x-auto w-full mb-4 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md text-sm whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-navy-800 text-white shadow-sm border border-border-default font-semibold' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 glass-card p-6 overflow-y-auto relative">
            <div className="gold-accent-top"></div>
            
            {activeTab === 'DNA' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-gold-500 mb-4">Judgment DNA Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-navy-900/50 p-4 rounded-lg border border-border-subtle">
                    <div className="text-xs text-text-muted uppercase mb-1">Court Name</div>
                    <div className="text-sm font-semibold text-white">High Court of Judicature</div>
                  </div>
                  <div className="bg-navy-900/50 p-4 rounded-lg border border-border-subtle">
                    <div className="text-xs text-text-muted uppercase mb-1">Date of Order</div>
                    <div className="text-sm font-semibold text-white font-mono">2024-05-01</div>
                  </div>
                  <div className="bg-navy-900/50 p-4 rounded-lg border border-border-subtle col-span-2">
                    <div className="text-xs text-text-muted uppercase mb-1">Petitioner</div>
                    <div className="text-sm font-semibold text-white">Ramesh Kumar</div>
                  </div>
                  <div className="bg-navy-900/50 p-4 rounded-lg border border-border-subtle col-span-2">
                    <div className="text-xs text-text-muted uppercase mb-1">Respondents</div>
                    <div className="text-sm font-semibold text-white">State of Gov, Dept of Finance</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-white mb-3">AI Confidence Scores</h4>
                  <div className="bg-navy-900/30 p-4 rounded-lg border border-border-subtle flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Overall Extraction Quality</span>
                    <span className="text-sm font-bold text-green-400">94%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Directives' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-navy-900/80 border-l-2 border-gold-500 rounded-r-lg border-t border-b border-r border-border-subtle">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-navy-800 text-gold-400 text-xs px-2 py-1 rounded border border-gold-500/30 font-mono">D001</span>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30 flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>
                  </div>
                  <p className="text-sm text-white italic bg-navy-950/50 p-3 rounded mb-3 border border-border-default">
                    "The respondents are directed to clear all pending dues within a period of four weeks..."
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-text-muted block">Dept:</span> <span className="text-white">Finance</span></div>
                    <div><span className="text-text-muted block">Timeline:</span> <span className="text-white">four weeks</span></div>
                    <div><span className="text-text-muted block">Priority:</span> <span className="text-red-400 font-bold">HIGH</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Action Plans' && (
              <div className="animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-navy-900/50 border-b border-border-subtle">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Directive</th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Officer</th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase text-right">Time Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      <tr className="bg-red-500/5 border-l-2 border-red-500">
                        <td className="px-4 py-4 font-mono text-sm text-gold-400">D001</td>
                        <td className="px-4 py-4 text-sm text-white">Ashok Sharma</td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded flex items-center w-max gap-1">
                            <AlertCircle size={12}/> OVERDUE
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-mono text-red-500 font-bold">0d 0h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Audit Trail' && (
              <div className="animate-fade-in">
                <AuditTrail logs={mockLogs} />
              </div>
            )}

            {activeTab === 'Timeline' && (
              <div className="flex items-center justify-center h-full text-text-muted animate-fade-in">
                Timeline Component Placeholder
              </div>
            )}

          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
