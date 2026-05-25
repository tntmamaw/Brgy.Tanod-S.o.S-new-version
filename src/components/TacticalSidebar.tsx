import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  Terminal, 
  Database, 
  Map as MapIcon, 
  Users, 
  ShieldCheck, 
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { UserRole } from '@/src/types';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  key?: string | number;
}

function SidebarItem({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-6 py-4 transition-all duration-300 group",
        active 
          ? "bg-tactical-red text-white shadow-[0_0_15px_rgba(255,62,62,0.3)] z-10 scale-[1.02] rounded-r-lg" 
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
      )}
    >
      <div className="flex items-center space-x-4">
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-gray-500 group-hover:text-tactical-cyan")} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      {active && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
      {badge && !active && <span className="text-[8px] bg-tactical-cyan/10 text-tactical-cyan px-1.5 py-0.5 rounded-sm border border-tactical-cyan/30">{badge}</span>}
    </button>
  );
}

export function TacticalSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { id: 'command', icon: Terminal, label: 'Command', roles: ['Admin', 'Tanod'] as UserRole[] },
    { id: 'activity', icon: Activity, label: 'Activity Logs', roles: ['Admin'] as UserRole[] },
    { id: 'intel', icon: Database, label: 'Live Intel', roles: ['Admin', 'Tanod'] as UserRole[] },
    { id: 'gps', icon: MapIcon, label: 'Tactical GPS', roles: ['Admin', 'Tanod'] as UserRole[] },
    { id: 'residents', icon: Users, label: 'Residents', roles: ['Admin'] as UserRole[] },
    { id: 'verification', icon: ShieldCheck, label: 'Verification', roles: ['Admin'] as UserRole[] },
  ];

  const filteredItems = menuItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-80 bg-[#0a0f18] border-r border-white/5 z-50 transform transition-transform duration-500 lg:translate-x-0 flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-8 border-b border-white/5 mb-4">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 glass-tactical border-tactical-cyan/30 flex items-center justify-center glow-cyan">
               <ShieldCheck className="w-6 h-6 text-tactical-cyan" />
            </div>
            <div>
               <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">BRGY DISTRICT</div>
               <div className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">TANOD<span className="text-tactical-red">NET</span></div>
               <div className="text-[8px] font-bold text-tactical-cyan uppercase tracking-widest mt-1">ACTIVE INTEL GRID</div>
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em] border-y border-white/5 py-1 px-4">CENTRAL_COMMAND</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={item.icon} 
                label={item.label} 
                active={item.id === 'command'} // Temporary
              />
            ))}
          </div>
        </div>

        {/* Footer Profile */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5">
           <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 rounded-sm bg-tactical-cyan/10 border border-tactical-cyan/30 flex items-center justify-center text-tactical-cyan">
                 {user?.displayName.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                 <div className="text-[10px] font-black text-white uppercase truncate">{user?.displayName}</div>
                 <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">{user?.role === 'Admin' ? 'SYSTEM_PRIME' : 'ACTIVE_UNIT'}</div>
              </div>
           </div>
           
           <button 
             onClick={signOut}
             className="w-full flex items-center justify-center space-x-2 py-3 border border-white/5 text-gray-500 hover:text-tactical-red hover:bg-tactical-red/5 transition-all text-[8px] font-black uppercase tracking-widest"
           >
             <LogOut className="w-3 h-3" />
             <span>Signout_Link</span>
           </button>
        </div>
      </div>
    </>
  );
}
