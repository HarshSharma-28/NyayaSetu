'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { Session } from '@/lib/auth/session';
import { api } from '@/lib/api/client';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Very basic breadcrumb extraction
  const pathParts = pathname.split('/').filter(p => p);
  const pageTitle = pathParts[pathParts.length - 1] || 'Dashboard';
  const displayTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const session = Session.get();
  const [mounted, setMounted] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    // Fetch real notifications
    api.notifications.list(true)
      .then(res => {
        const data = (res as any).items || (res as any).data || res;
        setUnreadCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(err => console.error("Notifications fetch failed:", err));

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = mounted && session?.nicSsoId ? session.nicSsoId.substring(0, 2).toUpperCase() : 'AD';

  return (
    <header className="h-[72px] bg-navy-900/60 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Left: Title & Breadcrumbs */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-white tracking-tight leading-none mb-1 capitalize">{displayTitle}</h1>
        <div className="text-[10px] text-white/20 flex items-center gap-2 uppercase tracking-widest font-bold">
          <span>NyayaSetu</span>
          <span className="text-white/10">/</span>
          {pathParts.map((part, i) => (
            <React.Fragment key={part}>
              <span className={i === pathParts.length - 1 ? 'text-[#d4af37]' : ''}>
                {part}
              </span>
              {i < pathParts.length - 1 && <span className="text-white/10">/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center: Smart Search */}
      <div className="flex-1 max-w-xl mx-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-text-muted group-focus-within:text-gold-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cases, petitioners, court names..."
          className="w-full bg-navy-950/50 border border-border-default rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-text-placeholder focus-gold transition-all"
        />
        {/* Placeholder for dropdown results if searching */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <button 
            className="relative text-text-muted hover:text-white transition-colors"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-navy-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-4 w-80 bg-navy-900 border border-border-default rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-border-subtle bg-navy-950/50 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Notifications</span>
                {unreadCount > 0 && <span className="text-xs text-gold-400 cursor-pointer hover:text-gold-300">Mark all read</span>}
              </div>
              <div className="p-4 flex flex-col items-center justify-center min-h-[120px]">
                {unreadCount > 0 ? (
                  <span className="text-sm text-text-secondary">You have {unreadCount} new notification(s).</span>
                ) : (
                  <>
                    <Bell size={32} className="text-text-muted/30 mb-2" />
                    <span className="text-sm text-text-muted">No new notifications</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-border-subtle pl-6">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-white">{mounted ? (session?.nicSsoId || 'Admin') : 'Admin'}</div>
            <div className="text-xs text-[#d4af37]">Administrator</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center text-white font-bold cursor-pointer hover:border-gold-500 transition-colors">
            {initials}
          </div>
        </div>
      </div>
      
    </header>
  );
}
