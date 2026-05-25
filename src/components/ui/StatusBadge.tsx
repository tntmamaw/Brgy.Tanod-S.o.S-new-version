import { cn } from "@/src/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-red-500 text-white shadow-red-500/20';
      case 'responding': return 'bg-amber-500 text-white shadow-amber-500/20';
      case 'resolved': return 'bg-green-500 text-white shadow-green-500/20';
      case 'on duty': return 'bg-blue-500 text-white shadow-blue-500/20';
      default: return 'bg-gray-500 text-white shadow-gray-500/20';
    }
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg inline-block",
      getColors(),
      className
    )}>
      {status}
    </span>
  );
}
