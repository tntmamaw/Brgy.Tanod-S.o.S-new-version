import React from 'react';
import { cn } from "@/src/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

export function GlassCard({ children, className, variant = 'default', ...props }: GlassCardProps) {
  const variants = {
    default: "bg-white/70 border-white/40",
    danger: "bg-red-50/70 border-red-200/50",
    success: "bg-green-50/70 border-green-200/50"
  };

  return (
    <motion.div
      {...props}
      className={cn(
        "backdrop-blur-xl border rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
