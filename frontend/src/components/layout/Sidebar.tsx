'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, FolderOpen, Clock, Shield, UploadCloud, Users, 
  Link as LinkIcon, BarChart3, Settings, LogOut, CheckSquare, 
  ListTodo, Briefcase, Calendar
} from 'lucide-react';
import { IMAGES, getImageWithFallback } from '@/lib/images/image-loader';
import { Session } from '@/lib/auth/session';
import { DeleteProfileModal } from '../shared/DeleteProfileModal';

interface SidebarProps {
  role: 'admin' | 'reviewer' | 'officer';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const session = Session.get();
  const initials = session?.nicSsoId ? session.nicSsoId.substring(0, 2).toUpperCase() : role.substring(0, 2).toUpperCase();

  const roleTitle = role === 'admin' ? 'Administrator' : role === 'reviewer' ? 'Legal Cell Reviewer' : 'Department Officer';

  return (
    <>
      <aside className="w-[220px] h-screen fixed left-0 top-0 sidebar-glass flex flex-col z-30">
        <div className="h-[72px] flex items-center px-6 border-b border-border-subtle shrink-0">
          <Image
            src={getImageWithFallback(IMAGES.DASHBOARD.LOGO_SIDEBAR, '/placeholder.svg', 'Sidebar Logo')}
            alt="Logo"
            width={32}
            height={32}
            className="mr-3"
          />
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight leading-tight text-lg">NyayaSetu</span>
            <span className="text-[#d4af37] text-[9px] tracking-[2px] leading-none uppercase mt-1">न्यायसेतु</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin">
          
          {role === 'admin' && (
            <>
              {/* ADMIN NAV */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">Overview</div>
                <nav className="space-y-1">
                  <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/admin') && pathname === '/admin' ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Home size={18} /><span>Command Center</span>
                  </Link>
                  <Link href="/admin/cases" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/admin/cases') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <FolderOpen size={18} /><span>All Cases</span>
                  </Link>
                  <Link href="/admin/deadlines" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/admin/deadlines') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Clock size={18} /><span>Deadlines</span>
                  </Link>
                  <Link href="/admin/audit" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/admin/audit') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Shield size={18} /><span>Audit Trail</span>
                  </Link>
                </nav>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">Management</div>
                <nav className="space-y-1">
                  <Link href="/admin/upload" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/admin/upload') ? 'bg-gradient-gold text-navy-950 shadow-gold' : 'text-gold-400 border border-gold-500/30 hover:bg-gold-500/10'}`}>
                    <UploadCloud size={18} /><span>Upload Judgment</span>
                  </Link>
                  <Link href="/admin/users" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/admin/users') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Users size={18} /><span>User Management</span>
                  </Link>
                </nav>
              </div>
            </>
          )}

          {role === 'reviewer' && (
            <>
              {/* REVIEWER NAV */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">My Queue</div>
                <nav className="space-y-1">
                  <Link href="/reviewer" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${(isActive('/reviewer') && pathname === '/reviewer') || pathname.startsWith('/reviewer/verify') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <ListTodo size={18} /><span>Pending Review</span>
                  </Link>
                  <Link href="/reviewer/progress" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/reviewer/progress') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Clock size={18} /><span>In Progress</span>
                  </Link>
                  <Link href="/reviewer/completed" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/reviewer/completed') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <CheckSquare size={18} /><span>Completed</span>
                  </Link>
                </nav>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">Cases</div>
                <nav className="space-y-1">
                  <Link href="/reviewer/cases" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/reviewer/cases') && !pathname.includes('reviewed') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <FolderOpen size={18} /><span>All Cases</span>
                  </Link>
                  <Link href="/reviewer/cases/reviewed" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/reviewer/cases/reviewed') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Briefcase size={18} /><span>My Reviewed Cases</span>
                  </Link>
                </nav>
              </div>
            </>
          )}

          {role === 'officer' && (
            <>
              {/* OFFICER NAV */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">My Work</div>
                <nav className="space-y-1">
                  <Link href="/officer" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/officer') && pathname === '/officer' ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <ListTodo size={18} /><span>My Action Plans</span>
                  </Link>
                  <Link href="/officer/deadlines" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/officer/deadlines') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <Calendar size={18} /><span>Upcoming Deadlines</span>
                  </Link>
                </nav>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">Cases</div>
                <nav className="space-y-1">
                  <Link href="/officer/cases" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive('/officer/cases') ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                    <FolderOpen size={18} /><span>My Dept Cases</span>
                  </Link>
                </nav>
              </div>
            </>
          )}

          {/* COMMON SYSTEM */}
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 px-3">System</div>
            <nav className="space-y-1">
              <Link href={`/${role}/profile`} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive(`/${role}/profile`) ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
                <Settings size={18} /><span>Profile</span>
              </Link>
              <button 
                onClick={() => { Session.clear(); window.location.href = '/login'; }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} /><span>Logout</span>
              </button>
            </nav>
          </div>

        </div>

        {/* User Card Bottom */}
        <div className="p-4 border-t border-border-subtle shrink-0 bg-navy-950/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-navy border border-border-default flex items-center justify-center text-white font-bold">
              {mounted ? initials : role.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{mounted ? (session?.nicSsoId || role) : role}</div>
              <div className="text-[10px] text-gold-500 uppercase tracking-wide truncate">{roleTitle}</div>
            </div>
          </div>
          <button 
            onClick={() => setDeleteModalOpen(true)}
            className="w-full text-xs text-center py-1.5 text-red-400/80 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded transition-colors"
          >
            Delete Profile
          </button>
        </div>
      </aside>

      <DeleteProfileModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        userId={session?.nicSsoId || 'unknown'} 
      />
    </>
  );
}
