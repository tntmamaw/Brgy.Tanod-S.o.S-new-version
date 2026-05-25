import React from 'react';
import { cn } from '@/src/lib/utils';

export type TacticalButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'cyan' | 'red' | 'gray' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
};

export function TacticalButton({ 
  className, 
  variant = 'cyan', 
  size = 'md', 
  glow = false,
  children,
  ...props 
}: TacticalButtonProps) {
  const variants = {
    cyan: 'bg-tactical-cyan/10 border-tactical-cyan text-tactical-cyan hover:bg-tactical-cyan/20 active:bg-tactical-cyan/30 shadow-[inset_0_0_10px_rgba(0,242,255,0.1)]',
    red: 'bg-tactical-red/10 border-tactical-red text-tactical-red hover:bg-tactical-red/20 active:bg-tactical-red/30 shadow-[inset_0_0_10px_rgba(255,62,62,0.1)]',
    gray: 'bg-tactical-card border-tactical-border text-gray-400 hover:text-white hover:border-gray-500',
    outline: 'border-white/10 text-gray-400 hover:bg-white/5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm'
  };

  return (
    <button
      className={cn(
        'font-mono font-black uppercase tracking-[0.2em] border transition-all duration-300 rounded-sm relative group active:scale-[0.98]',
        variants[variant],
        sizes[size],
        glow && variant === 'cyan' && 'glow-cyan',
        glow && variant === 'red' && 'glow-red',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none overflow-hidden">
        <div className="bg-white w-full h-[50%] animate-scan" />
      </div>
      {children}
    </button>
  );
}
