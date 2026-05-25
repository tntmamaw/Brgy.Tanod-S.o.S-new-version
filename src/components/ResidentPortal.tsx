import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { collection, addDoc, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { EmergencyType, Incident } from '@/src/types';
import { TacticalCard } from './ui/TacticalCard';
import { TacticalButton } from './ui/TacticalButton';
import { Shield, MessageSquare, Mic, Volume2, Info, Radio, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export function ResidentPortal() {
  const { user } = useAuth();
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [isGuardianActive, setIsGuardianActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'incidents'),
      where('reporterId', '==', user.uid),
      where('status', '!=', 'Resolved'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveIncident({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Incident);
      } else {
        setActiveIncident(null);
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            triggerSOS();
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  const triggerSOS = async () => {
    if (!user) return;
    setIsHolding(false);
    setHoldProgress(0);
    
    try {
      await addDoc(collection(db, 'incidents'), {
        reporterId: user.uid,
        reporterName: user.displayName,
        type: EmergencyType.OTHER,
        description: 'Auto-triggered SOS alert from personal safety terminal.',
        location: { latitude: 0, longitude: 0 }, // Placeholder for actual GPS
        status: 'Pending',
        assignedTanods: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("SOS Trigger Failed", e);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col font-mono relative overflow-hidden">
      {/* V2 Header Section */}
      <div className="flex justify-between items-start border-b border-white/5 pb-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-tactical-card border border-tactical-cyan/30 flex items-center justify-center glow-cyan self-center">
            <Shield className="w-6 h-6 text-tactical-cyan" />
          </div>
          <div>
            <div className="text-[10px] font-black text-tactical-cyan uppercase tracking-[0.4em] mb-1">
              RESIDENT SECURITY STATUS: VERIFIED
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
              PROTECT <span className="text-tactical-cyan">LOCAL</span>
            </h1>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              PERSONAL SAFETY TERMINAL // AI_CORE_CONNECTED
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-9 space-y-6">
          {/* Quick Controls Section */}
          <div className="flex space-x-4">
             <TacticalButton 
               variant={isGuardianActive ? 'cyan' : 'gray'}
               className="flex-1"
               onClick={() => setIsGuardianActive(!isGuardianActive)}
             >
               <Zap className={cn("w-4 h-4 mr-2", isGuardianActive && "animate-pulse")} />
               GUARDIAN AI {isGuardianActive ? 'ON' : 'OFF'}
             </TacticalButton>
             <TacticalButton variant="gray" className="flex-1">
               <Info className="w-4 h-4 mr-2" />
               APP BRIEF
             </TacticalButton>
          </div>

          <AnimatePresence>
            {activeIncident ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <TacticalCard accent="red" subtitle="EMERGENCY INCIDENT LIVE" title={activeIncident.status.toUpperCase()} className="glow-red">
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                    <div className="bg-tactical-red/10 border border-tactical-red p-8 rounded-full animate-pulse">
                      <Radio className="w-16 h-16 text-tactical-red" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Emergency Signal Transmitting</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Local authorities have been notified. Response units are being dispatched.</p>
                    </div>
                    <div className="flex space-x-4 w-full px-12">
                       <div className="flex-1 border-b border-tactical-red/50 pb-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase block">Dispatch</span>
                          <span className="text-white font-bold">10:42 PM</span>
                       </div>
                       <div className="flex-1 border-b border-tactical-red/10 pb-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase block">En Route</span>
                          <span className="text-gray-700 font-bold">PENDING</span>
                       </div>
                    </div>
                    <TacticalButton variant="gray" className="w-full">ACKNOWLEDGE</TacticalButton>
                  </div>
                </TacticalCard>
              </motion.div>
            ) : (
              <TacticalCard className="flex-1 flex flex-col items-center justify-center py-20 bg-tactical-bg/40 border-dashed">
                <div className="relative mb-12">
                   {/* SOS Ring Animation */}
                   <div className={cn(
                     "absolute inset-0 rounded-full border-4 border-tactical-red/20 scale-150 transition-transform duration-500",
                     isHolding ? "scale-[1.8]" : "scale-110"
                   )} />
                   <div className={cn(
                     "absolute inset-0 rounded-full border-2 border-tactical-red/40 scale-125 animate-pulse",
                     isHolding && "scale-140"
                   )} />
                   
                   <button
                     onMouseDown={() => setIsHolding(true)}
                     onMouseUp={() => setIsHolding(false)}
                     onMouseLeave={() => setIsHolding(false)}
                     onTouchStart={() => setIsHolding(true)}
                     onTouchEnd={() => setIsHolding(false)}
                     className={cn(
                       "relative w-48 h-48 rounded-full bg-tactical-red flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl",
                       isHolding ? "glow-red scale-105" : "hover:scale-105"
                     )}
                   >
                     <div 
                       className="absolute inset-0 rounded-full bg-white/20 transition-all duration-75"
                       style={{ clipPath: `inset(${100 - holdProgress}% 0 0 0)` }}
                     />
                     <Shield className="w-12 h-12 text-white mb-2" />
                     <span className="text-sm font-black text-white uppercase tracking-tighter text-center px-4">
                       Hold to<br />Activate SOS
                     </span>
                   </button>
                </div>
                
                <div className="flex flex-col items-center space-y-2 opacity-50">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-tactical-cyan" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-tactical-cyan">Guardian AI System Standby</span>
                   </div>
                   <p className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Encrypted link established with District Command</p>
                </div>
              </TacticalCard>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Mini Actions Panel */}
        <div className="lg:col-span-3">
          <TacticalCard className="h-full px-4 py-8" subtitle="S.O.S." title="PANEL">
             <div className="flex flex-col space-y-6">
                <button className="flex flex-col items-center justify-center p-8 bg-purple-500/10 border border-purple-500/20 rounded-3xl group hover:bg-purple-500/20 transition-all hover:-translate-y-1">
                   <MessageSquare className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Chat</span>
                </button>
                <button className="flex flex-col items-center justify-center p-8 bg-blue-500/10 border border-blue-500/20 rounded-3xl group hover:bg-blue-500/20 transition-all hover:-translate-y-1">
                   <Mic className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Voice</span>
                </button>
                <button className="flex flex-col items-center justify-center p-8 bg-amber-500/10 border border-amber-500/20 rounded-3xl group hover:bg-amber-500/20 transition-all hover:-translate-y-1">
                   <Volume2 className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Siren</span>
                </button>

                <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                   <div className="flex items-center space-x-3 opacity-50">
                      <div className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse" />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Signal: Triple_Mesh_Lock</span>
                   </div>
                   <div className="text-[8px] font-bold text-gray-600 uppercase leading-relaxed">
                     SECURE EMERGENCY CHANNEL ACTIVE. VOICE ENCRYPTION ENABLED.
                   </div>
                </div>
             </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
}
