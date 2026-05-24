import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Phone, Navigation } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SOSButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
}

export function SOSButton({ onTrigger, disabled }: SOSButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const PRESS_DURATION = 3000; // 3 seconds

  const startPress = () => {
    if (disabled) return;
    setIsPressing(true);
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(timerRef.current!);
        onTrigger();
        resetPress();
      }
    }, 50);
  };

  const resetPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-center">
      <AnimatePresence>
        {isPressing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          >
            HOLD FOR SOS: {Math.ceil((100 - progress) / 33)}s
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onMouseDown={startPress}
        onMouseUp={resetPress}
        onMouseLeave={resetPress}
        onTouchStart={startPress}
        onTouchEnd={resetPress}
        className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden",
          disabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:scale-105 active:scale-95"
        )}
      >
        {/* Progress Fill */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-red-800 transition-all duration-75" 
          style={{ height: `${progress}%` }}
        />

        <div className="relative z-10 flex flex-col items-center text-white">
          <AlertCircle className="w-10 h-10 mb-1 animate-pulse" />
          <span className="text-sm font-black tracking-tighter uppercase italic">SOS</span>
        </div>

        {/* Outer Ring Animation */}
        {isPressing && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 bg-red-400 rounded-full"
          />
        )}
      </button>
    </div>
  );
}
