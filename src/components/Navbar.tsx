import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { 
  Menu, 
  Plus, 
  Bell, 
  ShieldAlert, 
  ChevronDown,
  Power
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UserRole } from '@/src/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const switchRole = async (role: UserRole) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { role });
      setShowRoleMenu(false);
    } catch (e) {
      console.error("Role switch failed", e);
    }
  };

  return (
    <nav className="h-20 bg-[#0a0f18]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="p-3 bg-tactical-card border border-white/5 rounded-lg text-gray-400 hover:text-tactical-cyan hover:border-tactical-cyan/30 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <div className="text-[14px] font-black text-white italic tracking-tighter uppercase leading-none">
            Brgy. Tanod
          </div>
          <div className="text-[8px] font-black text-tactical-red uppercase tracking-[0.2em] mt-0.5">
            S.O.S. SYSTEM
          </div>
        </div>
      </div>

      {/* Center - Quick Actions V2 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <button className="p-3 bg-tactical-red rounded-xl shadow-[0_0_15px_rgba(255,62,62,0.3)] text-white hover:scale-110 active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
        <button className="p-3 bg-tactical-card border border-white/5 rounded-xl text-gray-400 hover:text-tactical-amber transition-all">
          <ShieldAlert className="w-5 h-5" />
        </button>
        <button className="p-3 bg-tactical-card border border-white/5 rounded-xl text-gray-400 hover:text-tactical-cyan transition-all relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-tactical-red rounded-full border border-[#0a0f18]" />
        </button>
      </div>

      {/* Right - Profile & Role Selector V2 */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-3 px-4 py-2 bg-tactical-card border border-white/5 rounded-lg hover:border-white/20 transition-all"
          >
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden md:block">
              {user?.role.toUpperCase()}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", showRoleMenu && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {showRoleMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-tactical-card border border-white/5 shadow-2xl rounded-lg overflow-hidden z-50"
              >
                {(['Admin', 'Tanod', 'Resident'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={cn(
                      "w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                      user?.role === role ? "bg-tactical-cyan/10 text-tactical-cyan" : "text-gray-500 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {role} View
                  </button>
                ))}
                <div className="border-t border-white/5 p-2">
                   <button 
                     onClick={signOut}
                     className="w-full flex items-center space-x-2 px-4 py-2 text-[9px] font-black text-tactical-red uppercase hover:bg-tactical-red/5 rounded transition-all"
                   >
                     <Power className="w-3 h-3" />
                     <span>Terminate Session</span>
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
