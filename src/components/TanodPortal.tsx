import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Incident, UserProfile } from '@/src/types';
import { TacticalCard } from './ui/TacticalCard';
import { TacticalButton } from './ui/TacticalButton';
import { cn } from '@/src/lib/utils';
import { 
  Crosshair, 
  Files as FileBox, 
  Info, 
  GanttChartSquare,
  Navigation,
  Map as MapIcon,
  Flame,
  ShieldAlert,
  Activity,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TanodPortal() {
  const { user } = useAuth();
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [isGpsOn, setIsGpsOn] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<'On Patrol' | 'Responding' | 'Available'>('Available');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'incidents'),
      where('assignedTanods', 'array-contains', user.displayName),
      where('status', '!=', 'Resolved')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveIncident({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Incident);
        setCurrentStatus('Responding');
      } else {
        setActiveIncident(null);
        setCurrentStatus('Available');
      }
    });

    return () => unsub();
  }, [user]);

  const toggleGps = () => setIsGpsOn(!isGpsOn);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col font-mono">
      {/* V2 Header Section */}
      <div className="flex justify-between items-start border-b border-white/5 pb-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-tactical-card border border-tactical-cyan/30 flex items-center justify-center glow-cyan self-center animate-pulse-slow">
            <Crosshair className="w-6 h-6 text-tactical-cyan" />
          </div>
          <div>
            <div className="text-[10px] font-black text-tactical-cyan uppercase tracking-[0.4em] mb-1">
              UNIT IDENTITY: VERIFIED
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
              RESPONDER <span className="text-tactical-cyan">PORTAL</span>
            </h1>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
               TACTICAL INTERFACE // AI_LINKED
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
           <div className="flex space-x-2">
             <div className="w-2 h-2 rounded-full bg-tactical-cyan animate-ping" />
             <span className="text-[10px] font-black text-tactical-cyan uppercase tracking-widest">Linked_Neural_Grid</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex space-x-4">
             <TacticalButton variant="gray" className="flex-1">
               <FileBox className="w-4 h-4 mr-2" />
               FILE_INTEL
             </TacticalButton>
             <TacticalButton variant="gray" className="flex-1">
               <Info className="w-4 h-4 mr-2" />
               APP BRIEF
             </TacticalButton>
          </div>

          <TacticalCard subtitle="SERVICE STATUS" className="relative">
             <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col space-y-1">
                   <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LIVE GPS LINK</div>
                   <div className="text-xs font-black text-white uppercase italic">TRANSMITTING</div>
                </div>
                <div 
                  onClick={toggleGps}
                  className={cn(
                    "cursor-pointer flex items-center justify-between px-2 w-20 h-10 border rounded-sm transition-all",
                    isGpsOn ? "border-tactical-cyan bg-tactical-cyan/10" : "border-gray-700 bg-gray-900"
                  )}
                >
                  <span className={cn("text-[10px] font-black uppercase", isGpsOn ? "text-tactical-cyan" : "text-gray-500")}>
                    {isGpsOn ? 'ON' : 'OFF'}
                  </span>
                  <div className={cn("w-6 h-6 border rounded-sm", isGpsOn ? "bg-tactical-cyan translate-x-1" : "bg-gray-700 -translate-x-1")} />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex flex-col">
                   <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                     STATUS: <span className={cn(
                       currentStatus === 'Responding' ? "text-tactical-red" : "text-tactical-cyan"
                     )}>{currentStatus.toUpperCase()}</span>
                   </h2>
                   <div className="flex items-center space-x-3 mt-4">
                      <div className="w-12 h-12 bg-tactical-card border-tactical-border rounded-full flex items-center justify-center">
                         <GanttChartSquare className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-gray-500 uppercase">Designated Officer</div>
                         <div className="text-sm font-bold text-white uppercase">{user?.displayName}</div>
                      </div>
                   </div>
                </div>
             </div>
          </TacticalCard>

          <TacticalCard subtitle="INCIDENT HOTSPOT HEATMAP" title="GEODATA ACTIVE" accent="amber">
             <div className="bg-tactical-bg border border-white/5 p-8 flex flex-col items-center justify-center space-y-4 rounded-sm min-h-[300px] relative overflow-hidden">
                {/* Heatmap Simulation Background */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                   <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-tactical-red/40 rounded-full blur-3xl animate-pulse" />
                   <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-tactical-amber/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
                   <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-tactical-cyan/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
                </div>

                <div className="w-48 h-32 glass-tactical border-white/10 flex items-center justify-center text-center p-4 relative z-10">
                   <div className="animate-pulse">
                      <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Density Index</div>
                      <div className="text-3xl font-black text-tactical-amber italic">4.2</div>
                      <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">LVL_HIGH_INTENSITY</div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mt-8 relative z-10">
                   <div className="bg-white/5 p-3 rounded-lg flex items-center space-x-2 border border-white/5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-[9px] font-black uppercase text-white leading-none">Fire</div>
                        <div className="text-[8px] font-bold text-gray-600">3 ACTIVE</div>
                      </div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-lg flex items-center space-x-2 border border-white/5">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="text-[9px] font-black uppercase text-white leading-none">Crime</div>
                        <div className="text-[8px] font-bold text-gray-600">1 REPORT</div>
                      </div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-lg flex items-center space-x-2 border border-white/5">
                      <Activity className="w-4 h-4 text-cyan-500" />
                      <div>
                        <div className="text-[9px] font-black uppercase text-white leading-none">Medical</div>
                        <div className="text-[8px] font-bold text-gray-600">0 ACTIVE</div>
                      </div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-lg flex items-center space-x-2 border border-white/5">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-[9px] font-black uppercase text-white leading-none">Flood</div>
                        <div className="text-[8px] font-bold text-gray-600">0 ACTIVE</div>
                      </div>
                   </div>
                </div>

                <div className="w-full mt-6 flex justify-center">
                   <TacticalButton size="sm" variant="outline" className="border-tactical-amber/30 text-tactical-amber">
                     GENERATE_FULL_RECEPTACLE_REPORT
                   </TacticalButton>
                </div>
             </div>
          </TacticalCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <TacticalCard subtitle="EMERGENCY DISTRIBUTION" title="REAL_TIME">
              <div className="h-64 flex items-center justify-center border border-white/5 bg-tactical-bg border-dashed">
                 <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] italic">No active vectors</p>
              </div>
           </TacticalCard>

           <AnimatePresence>
             {activeIncident && (
               <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}>
                 <TacticalCard accent="red" subtitle="URGENT_DIRECTIVE" title="RESPOND_NOW">
                   <div className="space-y-4">
                      <div className="bg-tactical-red/10 border border-tactical-red/50 p-4 rounded-sm">
                         <div className="text-[10px] font-black text-tactical-red uppercase mb-1">Target Location</div>
                         <div className="text-sm font-bold text-white mb-2">{activeIncident.type}</div>
                         <TacticalButton variant="red" className="w-full">ENGAGE_PROTOCOL</TacticalButton>
                      </div>
                   </div>
                 </TacticalCard>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
