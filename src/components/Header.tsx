import React from 'react';
import { useAuth } from './AuthProvider';
import { ShieldAlert, LogOut, User, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './ui/GlassCard';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <GlassCard className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between border-white/20">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20"
          >
            <ShieldAlert className="w-6 h-6 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-gray-900 leading-none">
              BRGY.GUARD <span className="text-red-600">S.O.S</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Tactical Response Network</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2 bg-gray-900/5 px-3 py-1.5 rounded-xl border border-gray-900/5">
            <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {navigator.onLine ? 'Telemetry Online' : 'Offline Mode'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white shadow-sm px-3 py-1.5 rounded-xl border border-gray-100">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-gray-900 leading-tight">{user?.displayName}</span>
                <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
            </div>

            <button 
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </GlassCard>
    </header>
  );
}
