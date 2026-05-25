import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { TacticalCard } from './ui/TacticalCard';
import { TacticalButton } from './ui/TacticalButton';
import { ShieldCheck, Lock, Mail, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'AUTHENTICATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tactical-bg flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundSize: '100px 100px', backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 glass-tactical border-tactical-cyan/40 flex items-center justify-center glow-cyan mb-6 relative group">
             <div className="absolute inset-0 border border-tactical-cyan animate-pulse group-hover:scale-125 transition-transform" />
             <ShieldCheck className="w-10 h-10 text-tactical-cyan" />
          </div>
          <div className="text-center">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em] leading-none mb-2">BRGY. DISTRICT COMMAND</div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              TANOD<span className="text-tactical-red">NET</span>
            </h1>
            <div className="flex items-center justify-center space-x-2 mt-2">
               <Zap className="w-3 h-3 text-tactical-cyan" />
               <span className="text-[8px] font-bold text-tactical-cyan uppercase tracking-[0.3em]">SECURE_INTERFACE_V2.4</span>
            </div>
          </div>
        </div>

        <TacticalCard subtitle="IDENTITY VERIFICATION" title="ENTRY_TERMINAL" className="shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-tactical-red/10 border border-tactical-red/50 text-tactical-red text-[10px] font-black uppercase tracking-widest animate-shake">
                ERROR: {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-tactical-cyan transition-colors">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="UNIT_IDENTIFIER (EMAIL)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050912] border border-white/5 px-12 py-4 text-xs font-bold text-white focus:outline-none focus:border-tactical-cyan/50 focus:ring-4 focus:ring-tactical-cyan/5 transition-all uppercase placeholder:text-gray-700"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-tactical-cyan transition-colors">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="password"
                  placeholder="SECURITY_GATEWAY (PASSWORD)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050912] border border-white/5 px-12 py-4 text-xs font-bold text-white focus:outline-none focus:border-tactical-cyan/50 focus:ring-4 focus:ring-tactical-cyan/5 transition-all uppercase placeholder:text-gray-700"
                  required
                />
              </div>
            </div>

            <TacticalButton 
              type="submit" 
              className="w-full" 
              size="lg" 
              glow
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? 'AUTHENTICATING...' : 'ESTABLISH_LINK'}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </div>
            </TacticalButton>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
               <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Protocol: 00-44-Secure</span>
               <button type="button" className="text-[8px] font-black text-tactical-cyan uppercase tracking-widest hover:underline">Request_Access</button>
            </div>
          </form>
        </TacticalCard>

        <div className="mt-8 text-center opacity-30">
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.4em]">
            SYSTEM_STABLE // ALL_LAYERS_ACTIVE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
