import React from 'react';
import { useAuth } from './AuthProvider';
import { ShieldAlert, LogOut, User, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-gray-900">
            BRGY.TANOD <span className="text-red-600">S.O.S</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-gray-900">{user?.displayName}</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{user?.role}</span>
            </div>
            <User className="w-8 h-8 p-1 bg-white rounded-full shadow-sm" />
          </div>

          <button 
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
