import React from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Header } from './components/Header';
import { ResidentDashboard } from './components/ResidentDashboard';
import { TanodDashboard } from './components/TanodDashboard';
import { ShieldAlert, Lock, TriangleAlert } from 'lucide-react';
import { motion } from 'motion/react';

function DashboardRouter() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-bold tracking-widest text-xs uppercase animate-pulse">Initializing Guard System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {user.role === 'Resident' ? (
          <ResidentDashboard />
        ) : (
          <TanodDashboard />
        )}
      </main>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 bg-[dashed-grid]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full -mr-16 -mt-16" />
        
        <div className="flex justify-center mb-8">
          <div className="bg-red-600 p-5 rounded-3xl shadow-xl shadow-red-600/20 rotate-12 hover:rotate-0 transition-transform">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
          Brgy.Tanod <span className="text-red-600">S.O.S</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10 px-4">
          The Official Emergency Response Network for Philippine Barangays. Secure your safety with one tap.
        </p>

        <div className="space-y-4">
          <button 
            onClick={onLogin}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl"
          >
            <Lock className="w-5 h-5 text-red-500" />
            <span>Authenticated Login</span>
          </button>
          
          <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
            <TriangleAlert className="w-3 h-3" />
            <span>End-to-End Encrypted Guardroom</span>
          </div>
        </div>

        {/* Info badges */}
        <div className="grid grid-cols-2 gap-4 mt-12 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-gray-900 font-black text-xl leading-none tracking-tighter">PH</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Localized</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-900 font-black text-xl leading-none tracking-tighter">24/7</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Coverage</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
}
