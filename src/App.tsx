import React, { useState } from 'react';
import { useAuth } from './components/AuthProvider';
import { AdminDashboard } from './components/AdminDashboard';
import { TanodPortal } from './components/TanodPortal';
import { ResidentPortal } from './components/ResidentPortal';
import { Navbar } from './components/Navbar';
import { TacticalSidebar } from './components/TacticalSidebar';
import { LoginPage } from './components/LoginPage';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-tactical-cyan/10 border-t-tactical-cyan rounded-full animate-spin glow-cyan" />
        <div className="text-[10px] font-black text-tactical-cyan uppercase tracking-[0.5em] animate-pulse">
           Initializing_Tactical_Grid
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-tactical-bg text-gray-300 font-mono selection:bg-tactical-cyan selection:text-black">
      <TacticalSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:pl-80 transition-all duration-500">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="relative">
          {user.role === 'Admin' && <AdminDashboard />}
          {user.role === 'Tanod' && <TanodPortal />}
          {user.role === 'Resident' && <ResidentPortal />}
          
          {/* V2 Tactical Scan Effect Overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tactical-cyan to-transparent h-[100px] animate-scan" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
