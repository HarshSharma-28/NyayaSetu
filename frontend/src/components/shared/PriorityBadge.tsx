import React from 'react';

interface PriorityBadgeProps {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const styles = {
    CRITICAL: 'bg-red-500/20 text-red-500 border-red-500/50',
    HIGH: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
    MEDIUM: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    LOW: 'bg-green-500/20 text-green-500 border-green-500/50',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[priority]} ${className}`}>
      {priority === 'CRITICAL' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      )}
      {priority}
    </span>
  );
}
