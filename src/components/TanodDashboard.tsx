import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { IncidentMap } from './IncidentMap';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Incident, UserProfile } from '@/src/types';
import { handleFirestoreError, OperationType } from '@/src/lib/error-handler';
import { CheckCircle, Navigation, Shield, Activity, Users, Map as MapIcon } from 'lucide-react';
import { formatTimestamp, cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { StatusBadge } from './ui/StatusBadge';

export function TanodDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tanods, setTanods] = useState<UserProfile[]>([]);
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(async (pos) => {
        const newLoc = [pos.coords.latitude, pos.coords.longitude] as [number, number];
        setLocation(newLoc);
        
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              lastLocation: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                timestamp: new Date().toISOString()
              },
              status: 'On Duty'
            });
          } catch (error) {
            console.error("Location sync failed:", error);
          }
        }
      });
    }

    const qIncidents = query(
      collection(db, 'incidents'),
      where('status', 'in', ['Pending', 'Responding']),
      orderBy('createdAt', 'desc')
    );
    const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident)));
    });

    const qTanods = query(collection(db, 'users'), where('role', '==', 'Tanod'));
    const unsubTanods = onSnapshot(qTanods, (snapshot) => {
      setTanods(snapshot.docs.map(doc => doc.data() as UserProfile));
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      unsubIncidents();
      unsubTanods();
    };
  }, [user]);

  const respondToIncident = async (incident: Incident) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'incidents', incident.id), {
        status: 'Responding',
        assignedTanods: [...incident.assignedTanods, user.displayName],
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `incidents/${incident.id}`);
    }
  };

  const resolveIncident = async (incident: Incident) => {
    try {
      await updateDoc(doc(db, 'incidents', incident.id), {
        status: 'Resolved',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `incidents/${incident.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-b-4 border-b-red-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Alerts</span>
              <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">
                {incidents.filter(i => i.status === 'Pending').length}
              </h3>
            </div>
            <div className="bg-red-50 p-2 rounded-xl">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-b-4 border-b-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responders Live</span>
              <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">
                {tanods.filter(t => t.status === 'On Duty').length}
              </h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-b-4 border-b-green-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel Status</span>
              <h3 className="text-xl font-black text-green-600 leading-none mt-1 uppercase">Operational</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Alerts Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="font-black text-lg tracking-tight uppercase flex items-center space-x-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Priority Stream</span>
            </h2>
          </div>
          
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {incidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GlassCard 
                    variant={incident.status === 'Pending' ? 'danger' : 'default'}
                    className="p-5 border-2"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <StatusBadge status={incident.status} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{formatTimestamp(incident.createdAt)}</span>
                    </div>
                    
                    <h4 className="font-black text-gray-900 text-xl leading-tight uppercase mb-1">{incident.type}</h4>
                    <p className="text-gray-500 text-sm mb-4">Reported by <span className="font-bold text-gray-900">{incident.reporterName}</span></p>
                    
                    {incident.aiGuidance && (
                      <div className="mb-4 bg-white/50 p-3 rounded-xl border border-gray-100 italic text-[11px] text-gray-600">
                        " {incident.aiGuidance.substring(0, 100)}... "
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {incident.status === 'Pending' ? (
                        <button 
                          onClick={() => respondToIncident(incident)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xl shadow-red-600/20"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Dispatch Self</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => resolveIncident(incident)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xl shadow-green-600/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                    {incident.assignedTanods.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100/50 flex flex-wrap gap-2">
                        {incident.assignedTanods.map((name, i) => (
                          <span key={i} className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                            <Shield className="w-3 h-3" />
                            <span>{name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {incidents.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <Shield className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">All Zones Clear</p>
              </div>
            )}
          </div>
        </div>

        {/* Tactical Map Column */}
        <div className="lg:col-span-8 h-[800px]">
          <GlassCard className="h-full p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-2xl tracking-tighter uppercase flex items-center space-x-2">
                <MapIcon className="w-6 h-6 text-indigo-600" />
                <span>Tactical Command</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Satellite Link Stable</span>
              </div>
            </div>
            <div className="flex-1 rounded-3xl overflow-hidden shadow-inner border border-gray-100">
              <IncidentMap incidents={incidents} tanods={tanods} userLocation={location} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
