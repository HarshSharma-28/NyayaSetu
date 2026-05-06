import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  score: number; // 0.0 to 1.0
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({ score, size = 'md' }: ConfidenceIndicatorProps) {
  const segments = 10;
  const activeSegments = Math.round(score * 10);
  
  let colorClass = 'bg-green-500';
  let emptyClass = 'bg-green-500/20';
  let textColor = 'text-green-400';
  
  if (score < 0.6) {
    colorClass = 'bg-red-500';
    emptyClass = 'bg-red-500/20';
    textColor = 'text-red-400';
  } else if (score <= 0.8) {
    colorClass = 'bg-amber-500';
    emptyClass = 'bg-amber-500/20';
    textColor = 'text-amber-400';
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div 
      className="flex items-center gap-2 group relative w-max"
      title="This score reflects clarity of extraction, not legal accuracy. Always verify manually."
    >
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 sm:w-2 rounded-sm ${heights[size]} ${i < activeSegments ? colorClass : emptyClass}`}
          />
        ))}
      </div>
      <div className={`font-mono font-bold flex items-center gap-1 ${textColor} ${textSizes[size]}`}>
        {Math.round(score * 100)}%
        {score < 0.6 && <AlertTriangle size={12} className="animate-pulse" />}
      </div>
      
      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-navy-800 text-[10px] text-white rounded border border-border-default opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-lg">
        This score reflects clarity of extraction, not legal accuracy. Always verify manually.
      </div>
    </div>
  );
}
