'use client';

import React, { useState, useRef } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { UploadCloud, FileText, X, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pipelineState, setPipelineState] = useState<number>(0); 
  // 0: none, 1: upload, 2: extract, 3: dna, 4: deadlines, 5: route, 6: done
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.', { id: 'PDF_002' });
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 20MB.', { id: 'PDF_001' });
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const startPipeline = () => {
    if (!file) return;
    setPipelineState(1);
    
    // Simulate pipeline steps
    setTimeout(() => setPipelineState(2), 1000);
    setTimeout(() => setPipelineState(3), 2500);
    setTimeout(() => setPipelineState(4), 4000);
    setTimeout(() => setPipelineState(5), 5000);
    setTimeout(() => setPipelineState(6), 6000);
  };

  const steps = [
    { id: 1, text: "Uploading to secure storage..." },
    { id: 2, text: "Extracting text (PyMuPDF / OCR)..." },
    { id: 3, text: "Building Judgment DNA™..." },
    { id: 4, text: "Resolving deadlines..." },
    { id: 5, text: "Routing to departments..." },
  ];

  return (
    <ErrorBoundary sectionName="Upload Judgment">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Upload Judgment</h1>
          <p className="text-sm text-text-secondary">Process court orders through the NyayaSetu AI pipeline.</p>
        </div>

        {pipelineState === 0 && (
          <div className="glass-card p-8">
            {!file ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging ? 'border-gold-500 bg-gold-500/5' : 'border-border-default hover:border-gold-500/50 hover:bg-white/5'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 mb-4 shadow-lg border border-border-default">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Drag & Drop PDF</h3>
                <p className="text-sm text-text-muted max-w-sm">
                  Upload a scanned or digital court judgment. The system will automatically extract and route directives.
                </p>
                <div className="mt-6 flex gap-2">
                  <span className="text-xs bg-navy-900 border border-border-subtle px-2 py-1 rounded text-text-muted">PDF Only</span>
                  <span className="text-xs bg-navy-900 border border-border-subtle px-2 py-1 rounded text-text-muted">Max 20MB</span>
                </div>
              </div>
            ) : (
              <div className="animate-scale-in">
                <div className="bg-navy-900/50 border border-gold-500/30 rounded-lg p-6 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{file.name}</div>
                      <div className="text-xs text-text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-text-muted hover:text-red-400 transition-colors p-2">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="text-sm font-semibold text-text-secondary uppercase tracking-wider block">Assign Reviewer</label>
                  <select className="w-full bg-navy-950 border border-border-default rounded-md py-3 px-4 text-sm text-white focus-gold appearance-none">
                    <option value="">Select a Legal Cell Reviewer...</option>
                    <option value="rev_1">Reviewer One (Legal Dept)</option>
                    <option value="rev_2">Reviewer Two (Legal Dept)</option>
                  </select>
                </div>

                <button 
                  onClick={startPipeline}
                  className="w-full py-3.5 bg-gradient-gold text-navy-950 font-bold rounded-md hover:shadow-gold transition-all duration-300"
                >
                  Upload & Process
                </button>
              </div>
            )}
          </div>
        )}

        {pipelineState > 0 && (
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              {pipelineState < 6 ? (
                <><Loader2 size={24} className="text-gold-500 animate-spin" /> Processing Judgment Pipeline</>
              ) : (
                <><CheckCircle2 size={24} className="text-green-500" /> Processing Complete</>
              )}
            </h2>
            
            <div className="space-y-4 mb-8 pl-4 border-l border-border-default relative">
              {steps.map((step) => {
                const isPast = pipelineState > step.id;
                const isCurrent = pipelineState === step.id;
                const isPending = pipelineState < step.id;
                
                return (
                  <div key={step.id} className="relative pl-6">
                    <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 ring-4 ring-navy-900 ${
                      isPast ? 'bg-green-500 border-green-500' :
                      isCurrent ? 'bg-gold-500 border-gold-500 animate-pulse' :
                      'bg-navy-900 border-border-default'
                    }`} />
                    <div className={`text-sm font-medium transition-colors ${
                      isPast ? 'text-text-secondary' :
                      isCurrent ? 'text-white font-bold' :
                      'text-text-muted'
                    }`}>
                      {step.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {pipelineState === 6 && (
              <div className="animate-fade-in">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                  <div className="text-sm text-green-400 font-bold mb-2">Success: 3 Directives Extracted</div>
                  <div className="text-xs text-text-secondary font-mono">Case: WP/5522/2024</div>
                </div>
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-navy-800 text-white font-bold rounded-md hover:bg-navy-700 transition-all border border-border-default">
                  Go to Verification <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}
