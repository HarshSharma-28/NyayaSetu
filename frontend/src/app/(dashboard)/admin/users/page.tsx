'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Search, MoreVertical, Shield, Eye, User as UserIcon } from 'lucide-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import toast from 'react-hot-toast';

const MOCK_USERS = [
  { id: '1', name: 'Admin One', nic_sso_id: 'admin_123', role: 'admin', dept: 'All', active: true, last_login: '2024-05-06 10:15' },
  { id: '2', name: 'Reviewer Two', nic_sso_id: 'rev_456', role: 'reviewer', dept: 'Legal Cell', active: true, last_login: '2024-05-05 14:20' },
  { id: '3', name: 'Officer Three', nic_sso_id: 'off_789', role: 'officer', dept: 'Finance', active: false, last_login: '2024-05-01 09:00' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield size={14} className="text-red-400" />;
    if (role === 'reviewer') return <Eye size={14} className="text-amber-400" />;
    return <UserIcon size={14} className="text-blue-400" />;
  };

  const handleToggleActive = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
    toast.success('User status updated');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setUsers(users.filter(u => u.id !== deleteModal.id));
    toast.success('User soft deleted');
    setDeleteModal({ isOpen: false, id: null });
  };

  return (
    <ErrorBoundary sectionName="User Management">
      <div className="space-y-6 animate-fade-in">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
            <p className="text-sm text-text-secondary">Provision and monitor department personnel access.</p>
          </div>
          <button className="px-4 py-2 bg-gradient-gold text-navy-950 font-bold rounded-md hover:shadow-gold transition-all text-sm">
            + Provision User
          </button>
        </div>

        <div className="glass-card p-4">
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, NIC ID..." 
              className="w-full bg-navy-900/80 border border-border-default rounded-md py-2 pl-9 pr-3 text-sm text-white focus-gold"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-navy-900/50 border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">NIC SSO ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-800 border border-border-default flex items-center justify-center text-xs font-bold text-gold-500">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">
                      {u.nic_sso_id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-white bg-navy-800 px-2 py-1 rounded w-max border border-border-subtle">
                        {getRoleIcon(u.role)}
                        <span className="capitalize">{u.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {u.dept}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleActive(u.id)}
                        className={`text-xs px-2 py-1 rounded-full border ${u.active ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                      >
                        {u.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3 text-sm">
                        <button className="text-gold-500 hover:text-gold-400">Edit</button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: u.id })}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmModal 
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null })}
          title="Delete User"
          description="Are you sure you want to soft delete this user? They will immediately lose access."
          confirmText="Delete User"
          onConfirm={handleDelete}
        />
      </div>
    </ErrorBoundary>
  );
}
