'use client';

import React, { useEffect, useState } from 'react';

interface DeadlineCountdownProps {
  dueDate: string; // ISO string
}

export function DeadlineCountdown({ dueDate }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft({ days, hours });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [dueDate]);

  if (!timeLeft) return <span className="text-text-muted text-sm">Calculating...</span>;

  const isOverdue = timeLeft.days === 0 && timeLeft.hours === 0;
  const isUrgent = !isOverdue && timeLeft.days < 7;
  const isSafe = !isOverdue && !isUrgent;

  let colorClass = 'text-green-500';
  if (isOverdue) colorClass = 'text-red-500 font-bold';
  else if (isUrgent) colorClass = 'text-amber-500';

  if (isOverdue) {
    return <span className={colorClass}>OVERDUE</span>;
  }

  if (timeLeft.days === 0) {
    return <span className={colorClass}>{timeLeft.hours}h left</span>;
  }

  return <span className={colorClass}>{timeLeft.days}d {timeLeft.hours}h</span>;
}
