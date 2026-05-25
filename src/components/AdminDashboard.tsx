import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Incident, UserProfile, Announcement } from '@/src/types';
import { 
  Map as MapIcon, 
  Target, 
  Archive, 
  Radio, 
  Activity, 
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { TacticalCard } from './ui/TacticalCard';
import { TacticalButton } from './ui/TacticalButton';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimestamp, cn } from '@/src/lib/utils';
import { TacticalMap } from './TacticalMap';

export function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'mission' | 'archived'>('map');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
    });

    const qIncidents = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(10));
    const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident)));
    });

    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(5));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });

    // Simulated sync for the V2 aesthetic
    const interval = setInterval(() => {
      setSyncProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 1000);

    return () => {
      unsubUsers();
      unsubIncidents();
      unsubAnnouncements();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 font-mono">
      {/* V2 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 mb-8">
        <div className="flex items-center space-x-4 mb-6 md:mb-0">
          <div className="w-16 h-16 bg-tactical-card border border-tactical-cyan/30 flex items-center justify-center glow-cyan self-center animate-pulse-slow">
            <ShieldCheck className="w-8 h-8 text-tactical-cyan" />
          </div>
          <div>
            <div className="text-[10px] font-black text-tactical-cyan uppercase tracking-[0.4em] mb-1">
              BRGY. DISTRICT
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              COMMAND<span className="text-tactical-red">CENTER</span>
            </h1>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              ADMIN_PANEL_V2 // STRATEGIC_INTELLIGENCE_GRID
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-tactical-red animate-pulse" />
               <span className="text-[9px] font-black text-tactical-red uppercase tracking-widest">SIGNAL: SECURE ENCRYPTION ACTIVE</span>
             </div>
          </div>
          <div className="w-64 h-8 bg-tactical-card border border-white/5 p-1 relative">
            <div 
              className="h-full bg-tactical-cyan/40 transition-all duration-1000 relative"
              style={{ width: `${syncProgress}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-[2px] bg-tactical-cyan glow-cyan" />
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-3">
               <span className="text-[8px] font-black text-tactical-cyan uppercase tracking-widest mix-blend-difference">
                 SYNCING_GUARDIAN_NETWORK
               </span>
               <span className="text-[8px] font-black text-white mix-blend-difference">
                 {syncProgress}%
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs V2 */}
      <div className="flex space-x-4">
        <TacticalButton 
          variant={activeTab === 'map' ? 'cyan' : 'gray'} 
          onClick={() => setActiveTab('map')}
          className="flex-1"
        >
          <MapIcon className="w-4 h-4 mr-3" />
          WEBLLM MAP
        </TacticalButton>
        <TacticalButton 
          variant={activeTab === 'mission' ? 'cyan' : 'gray'} 
          onClick={() => setActiveTab('mission')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-3" />
          MISSION
        </TacticalButton>
        <TacticalButton 
          variant={activeTab === 'archived' ? 'cyan' : 'gray'} 
          onClick={() => setActiveTab('archived')}
          className="flex-1"
        >
          <Archive className="w-4 h-4 mr-3" />
          ARCHIVED
        </TacticalButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activeTab === 'map' ? (
                <TacticalCard 
                  subtitle="STRATEGIC RESPONSE MATRIX"
                  title="LIVE GEOSPATIAL FEED"
                  className="p-0 overflow-hidden"
                >
                  <div className="h-[500px]">
                    <TacticalMap incidents={incidents} />
                  </div>
                </TacticalCard>
              ) : (
                <TacticalCard 
                  subtitle="STRATEGIC RESPONSE MATRIX"
                  title={activeTab === 'mission' ? 'ACTIVE OPERATIONS' : 'HISTORICAL INTEL'}
                  className="min-h-[500px]"
                >
                  {activeTab === 'mission' && (
                    <div className="space-y-4">
                      {incidents.filter(i => i.status !== 'Resolved').map((incident) => (
                        <div key={incident.id} className="bg-white/5 border border-white/5 p-4 rounded-sm flex justify-between items-center group hover:border-tactical-red/50 transition-all">
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border",
                                incident.status === 'Responding' ? "bg-tactical-cyan/10 border-tactical-cyan text-tactical-cyan" : "bg-tactical-red/10 border-tactical-red text-tactical-red"
                              )}>
                                {incident.status}
                              </span>
                              <span className="text-[10px] text-gray-500">{formatTimestamp(incident.createdAt)}</span>
                            </div>
                            <h4 className="font-bold text-white uppercase italic">{incident.type}</h4>
                            <p className="text-xs text-gray-400 mt-1">{incident.description}</p>
                          </div>
                          <TacticalButton size="sm" variant="outline">VIEW_INTEL</TacticalButton>
                        </div>
                      ))}
                      {incidents.length === 0 && (
                        <div className="text-center py-20 opacity-20">
                          <Target className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-xs uppercase tracking-widest">No active threats detected</p>
                        </div>
                      )}
                    </div>
                  )}
                </TacticalCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Widgets V2 */}
        <div className="lg:col-span-4 space-y-6">
          <TacticalCard 
            subtitle="TACTICAL BROADCAST CENTER"
            title="PUBLIC ALERTS"
            accent="red"
          >
            <div className="space-y-4">
              <div className="bg-tactical-red/5 border border-tactical-red/20 p-4 rounded-sm">
                <div className="flex items-center space-x-3 mb-4">
                   <div className="w-10 h-10 bg-tactical-red/10 border border-tactical-red/50 flex items-center justify-center rounded-full">
                     <Radio className="w-5 h-5 text-tactical-red" />
                   </div>
                   <div>
                     <div className="text-[10px] font-black text-tactical-red uppercase leading-none mb-1">Status: Standby</div>
                     <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Encrypted Broadcast Channel 08</div>
                   </div>
                </div>
                <TacticalButton variant="red" className="w-full" size="lg" glow>
                  <Radio className="w-4 h-4 mr-3" />
                  BROADCAST SYSTEM S.O.S.
                </TacticalButton>
                <div className="text-center mt-3">
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                    DEPLOYS HIGH-PRIORITY ALERTS TO ALL ACTIVE UNITS
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Recent Logs</h5>
                {announcements.map((ann) => (
                  <div key={ann.id} className="flex items-start space-x-3 group">
                    <ChevronRight className="w-3 h-3 text-tactical-cyan mt-1 group-hover:translate-x-1 transition-transform" />
                    <div>
                      <div className="text-[10px] font-bold text-white uppercase">{ann.title}</div>
                      <div className="text-[8px] text-gray-600 uppercase tracking-tighter">{formatTimestamp(ann.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TacticalCard>

          <TacticalCard
            subtitle="FORCE COMPOSITION"
            title="UNIT READINESS"
          >
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-tactical-card border border-white/5 p-4">
                  <div className="text-[9px] font-black text-gray-500 uppercase mb-1">TOTAL_CITIZENS</div>
                  <div className="text-2xl font-black text-white italic">0</div>
               </div>
               <div className="bg-tactical-card border border-white/5 p-4">
                  <div className="text-[9px] font-black text-gray-500 uppercase mb-1">ACTIVE_UNITS</div>
                  <div className="text-2xl font-black text-tactical-cyan italic">0</div>
               </div>
               <div className="bg-tactical-card border border-white/5 p-4">
                  <div className="text-[9px] font-black text-gray-500 uppercase mb-1">INCIDENT_RATE</div>
                  <div className="text-2xl font-black text-tactical-amber italic">0%</div>
               </div>
               <div className="bg-tactical-card border border-white/5 p-4">
                  <div className="text-[9px] font-black text-gray-500 uppercase mb-1">ALPHA_MESH</div>
                  <div className="text-2xl font-black text-tactical-red italic">SEC</div>
               </div>
            </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
}
