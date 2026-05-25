import React from 'react';
import { cn } from '@/src/lib/utils';

interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  accent?: 'cyan' | 'red' | 'amber';
}

export function TacticalCard({ children, className, title, subtitle, accent = 'cyan' }: TacticalCardProps) {
  const accentColors = {
    cyan: 'border-tactical-cyan/30',
    red: 'border-tactical-red/30',
    amber: 'border-tactical-amber/30'
  };

  return (
    <div className={cn(
      "glass-tactical border-l-2 p-6 transition-all duration-500",
      accentColors[accent],
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-6 border-b border-white/5 pb-4">
          {subtitle && (
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">
              {subtitle}
            </div>
          )}
          {title && (
            <h3 className="font-mono text-xl font-bold italic tracking-tighter text-white uppercase">
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
