'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Session } from '@/lib/auth/session';
import toast from 'react-hot-toast';

interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function DeleteProfileModal({ isOpen, onClose, userId }: DeleteProfileModalProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (inputValue !== 'DELETE') return;
    
    setIsLoading(true);
    try {
      await api.users.delete(userId);
      Session.clear();
      toast.success('Profile deleted successfully.');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to delete profile.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 relative border border-red-500/40">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Delete Account</h2>
          <p className="text-sm text-red-400 font-semibold mb-4">This action cannot be undone.</p>
          
          <div className="text-sm text-text-secondary text-left w-full bg-navy-900/50 p-4 rounded-md border border-border-default mb-6">
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Your profile will be permanently removed.</li>
              <li>You will immediately lose access to NyayaSetu.</li>
            </ul>
            <ul className="list-disc pl-5 space-y-1 text-text-muted">
              <li>Cases previously assigned to you will remain intact.</li>
              <li>Audit logs referencing your ID will be preserved for compliance.</li>
            </ul>
          </div>

          <div className="w-full text-left">
            <label className="text-xs text-text-muted block mb-2">
              Type <strong className="text-white select-none">DELETE</strong> to confirm:
            </label>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-navy-950 border border-border-default rounded-md py-2 px-3 text-white focus:border-red-500 focus:outline-none transition-colors"
              placeholder="DELETE"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-navy-800 text-white rounded-md hover:bg-navy-700 transition-colors border border-border-default"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || inputValue !== 'DELETE'}
            className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Delete Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
