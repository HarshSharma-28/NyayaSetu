'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { ConfidenceIndicator } from '@/components/shared/ConfidenceIndicator';
import { FileText, ChevronLeft, ChevronRight, Check, Edit2, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Mock data
const MOCK_DIRECTIVES = [
  { id: 'd1', directive_id: 'D001', raw_text: "The respondents are directed to clear all pending dues within a period of four weeks from the date of this order.", action_type: 'COMPLIANCE', department: 'Finance', timeline_raw: 'four weeks', due_date: '2024-06-01', priority: 'HIGH', confidence: 0.94, source_page: 1 },
  { id: 'd2', directive_id: 'D002', raw_text: "Respondent No. 3 shall file a compliance report before the next date of hearing.", action_type: 'COMPLIANCE', department: 'Legal Cell', timeline_raw: 'before next hearing', due_date: '', priority: 'MEDIUM', confidence: 0.75, source_page: 2 },
];

export default function VerificationPage({ params }: { params: { caseId: string } }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [directives, setDirectives] = useState(MOCK_DIRECTIVES);
  const [isEditing, setIsEditing] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Editable state
  const [editState, setEditState] = useState(directives[currentIdx]);

  const current = directives[currentIdx];
  const progressPercent = ((currentIdx + 1) / directives.length) * 100;

  const router = useRouter();

  const handleNext = () => {
    if (currentIdx < directives.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setEditState(directives[currentIdx + 1]);
      setIsEditing(false);
    } else {
      localStorage.setItem('demo_upload_done', 'true');
      toast.success('All directives verified successfully! Routing to Dashboard...');
      setTimeout(() => router.push('/admin'), 1500);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setEditState(directives[currentIdx - 1]);
      setIsEditing(false);
    }
  };

  const handleApprove = () => {
    toast.success(`Directive ${current.directive_id} verified and approved.`);
    // In real app: POST /api/v1/verify/{id}/approve
    handleNext();
  };

  const handleSaveEdit = () => {
    toast.success(`Directive ${current.directive_id} updated and approved.`);
    // In real app: PUT /api/v1/directives/{id} then POST /api/v1/verify/{id}/edit
    const updated = [...directives];
    updated[currentIdx] = editState;
    setDirectives(updated);
    setIsEditing(false);
    handleNext();
  };

  const handleReject = () => {
    if (!rejectReason) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    toast.success(`Directive ${current.directive_id} rejected.`);
    // In real app: POST /api/v1/verify/{id}/reject
    setIsRejectModalOpen(false);
    setRejectReason('');
    handleNext();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 animate-fade-in relative">
      
      {/* LEFT PANEL - PDF VIEWER (50%) */}
      <div className="w-1/2 flex flex-col h-full glass-card overflow-hidden border-border-default">
        <div className="bg-navy-900/80 p-3 border-b border-border-subtle flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold">
            <FileText size={16} />
            <span>WP_1234_2024.pdf</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <button className="hover:text-white p-1"><ChevronLeft size={16}/></button>
            <span>Page {current.source_page} of 12</span>
            <button className="hover:text-white p-1"><ChevronRight size={16}/></button>
          </div>
        </div>
        <div className="flex-1 bg-[#e5e5e5] relative p-8 overflow-auto flex justify-center">
          {/* Visual Stub for react-pdf */}
          <div className="w-[600px] h-max min-h-full bg-white shadow-lg p-12 text-black font-serif relative">
            <div className="text-center mb-8 font-bold text-xl">IN THE HIGH COURT OF JUDICATURE</div>
            <p className="mb-4 text-justify leading-relaxed opacity-50">
              ...Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt...
            </p>
            
            {/* Highlight Box */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-yellow-300/30 border-2 border-yellow-400 rounded pointer-events-none mix-blend-multiply"></div>
              <p className="mb-4 text-justify leading-relaxed relative z-10">
                {current.raw_text}
              </p>
            </div>
            
            <p className="mb-4 text-justify leading-relaxed opacity-50">
              ...Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo...
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - VERIFICATION (50%) */}
      <div className="w-1/2 flex flex-col h-full">
        
        {/* Header & Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <Link href="/reviewer" className="text-text-muted hover:text-white text-xs mb-2 flex items-center gap-1">
                <ChevronLeft size={14}/> Back to Queue
              </Link>
              <h1 className="text-xl font-bold text-white">Directive Verification</h1>
            </div>
            <div className="text-sm font-bold text-gold-400">
              Directive {currentIdx + 1} of {directives.length}
            </div>
          </div>
          <div className="w-full bg-navy-900 rounded-full h-1.5 border border-border-subtle overflow-hidden">
            <div className="bg-gradient-gold h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <ErrorBoundary sectionName="Verification Form">
          <div className="flex-1 glass-card p-6 overflow-y-auto space-y-6">
            
            {/* SOURCE TEXT BOX */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Source Text <span className="normal-case text-text-muted font-normal">(verbatim from judgment)</span>
                </label>
                <ConfidenceIndicator score={current.confidence} size="sm" />
              </div>
              <div className="bg-amber-500/5 border border-amber-500/30 rounded-md p-4 text-white text-sm leading-relaxed font-serif relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-md"></div>
                "{current.raw_text}"
              </div>
            </div>

            {/* EDITABLE FIELDS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border-subtle pb-1">Structured Extraction</h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${isEditing ? 'bg-navy-800 text-white' : 'text-gold-500 hover:bg-gold-500/10'}`}
                >
                  <Edit2 size={12} /> {isEditing ? 'Cancel Edit' : 'Edit Fields'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Action Type</label>
                  <select 
                    disabled={!isEditing}
                    value={editState.action_type}
                    onChange={(e) => setEditState({...editState, action_type: e.target.value})}
                    className="w-full bg-navy-950/50 border border-border-default rounded py-2 px-3 text-sm text-white disabled:opacity-70 disabled:bg-navy-900"
                  >
                    <option value="COMPLIANCE">COMPLIANCE</option>
                    <option value="APPEAL">APPEAL</option>
                    <option value="INFORMATION">INFORMATION</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Department</label>
                  <select 
                    disabled={!isEditing}
                    value={editState.department}
                    onChange={(e) => setEditState({...editState, department: e.target.value})}
                    className="w-full bg-navy-950/50 border border-border-default rounded py-2 px-3 text-sm text-white disabled:opacity-70 disabled:bg-navy-900"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Legal Cell">Legal Cell</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Timeline (Raw)</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={editState.timeline_raw}
                    onChange={(e) => setEditState({...editState, timeline_raw: e.target.value})}
                    className="w-full bg-navy-950/50 border border-border-default rounded py-2 px-3 text-sm text-white disabled:opacity-70 disabled:bg-navy-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Calculated Due Date</label>
                  <input 
                    type="date"
                    disabled={!isEditing}
                    value={editState.due_date}
                    onChange={(e) => setEditState({...editState, due_date: e.target.value})}
                    className="w-full bg-navy-950/50 border border-border-default rounded py-2 px-3 text-sm text-white disabled:opacity-70 disabled:bg-navy-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-muted block mb-1">Priority</label>
                  <select 
                    disabled={!isEditing}
                    value={editState.priority}
                    onChange={(e) => setEditState({...editState, priority: e.target.value})}
                    className="w-full bg-navy-950/50 border border-border-default rounded py-2 px-3 text-sm text-white disabled:opacity-70 disabled:bg-navy-900"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-muted block mb-1">Reviewer Notes (Optional)</label>
                  <textarea 
                    disabled={!isEditing}
                    placeholder="Add context for the department officer..."
                    className="w-full bg-navy-950/50 border border-border-default rounded py-2 px-3 text-sm text-white disabled:opacity-70 disabled:bg-navy-900 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ACTIONS ROW */}
          <div className="mt-4 flex gap-3 shrink-0">
            {isEditing ? (
              <button 
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Check size={18} /> Save & Approve
              </button>
            ) : (
              <button 
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors shadow-lg"
              >
                <Check size={18} /> Verify & Approve
              </button>
            )}
            
            <button 
              onClick={() => setIsRejectModalOpen(true)}
              className="px-6 py-3 bg-navy-900 text-red-400 font-bold rounded-md hover:bg-red-500/10 border border-red-500/30 transition-colors flex items-center gap-2"
            >
              <X size={18} /> Reject
            </button>
          </div>
        </ErrorBoundary>

        {/* Reject Modal */}
        {isRejectModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card max-w-sm w-full p-6 border border-red-500/30 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Reject Extraction
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                Provide a reason for rejecting this AI extraction. This will flag the directive for administrative review.
              </p>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full bg-navy-950 border border-border-default rounded py-2 px-3 text-sm text-white mb-4 min-h-[100px] focus:border-red-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 py-2 bg-navy-800 text-white rounded text-sm hover:bg-navy-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
