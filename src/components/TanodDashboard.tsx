import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { IncidentMap } from './IncidentMap';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Incident, UserProfile } from '@/src/types';
import { handleFirestoreError, OperationType } from '@/src/lib/error-handler';
import { AlertCircle, CheckCircle, Navigation, MapPin, Shield, Activity } from 'lucide-react';
import { formatTimestamp, cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function TanodDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tanods, setTanods] = useState<UserProfile[]>([]);
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Tracking
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(async (pos) => {
        const newLoc = [pos.coords.latitude, pos.coords.longitude] as [number, number];
        setLocation(newLoc);
        
        // Update user location in DB if authenticated
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
    }, error => handleFirestoreError(error, OperationType.LIST, 'incidents'));

    const qTanods = query(collection(db, 'users'), where('role', '==', 'Tanod'));
    const unsubTanods = onSnapshot(qTanods, (snapshot) => {
      setTanods(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, error => handleFirestoreError(error, OperationType.LIST, 'users'));

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Incidents Queue */}
      <div className="lg:col-span-4 space-y-4 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-white p-4 rounded-xl sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-red-600 animate-pulse" />
            <h2 className="font-black text-lg tracking-tight uppercase">Emergency Queue</h2>
          </div>
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
            {incidents.filter(i => i.status === 'Pending').length} Alert(s)
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {incidents.map((incident) => (
            <motion.div
              key={incident.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all shadow-lg",
                incident.status === 'Pending' ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                  incident.status === 'Pending' ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                )}>
                  {incident.status}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{formatTimestamp(incident.createdAt)}</span>
              </div>
              
              <h3 className="font-black text-gray-900 text-lg leading-tight uppercase mb-1">{incident.type}</h3>
              <p className="text-gray-600 text-sm mb-3">Reported by <span className="font-bold">{incident.reporterName}</span></p>
              
              <div className="flex space-x-2">
                {incident.status === 'Pending' ? (
                  <button 
                    onClick={() => respondToIncident(incident)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Respond</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => resolveIncident(incident)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
              {incident.assignedTanods.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {incident.assignedTanods.map((name, i) => (
                    <span key={i} className="bg-white/60 text-[9px] px-1.5 py-0.5 rounded text-gray-700 font-bold border border-gray-100">
                      👨‍✈️ {name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {incidents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Shield className="w-12 h-12 mb-2 opacity-20" />
            <p className="italic text-sm">No active alerts at this moment.</p>
          </div>
        )}
      </div>

      {/* Map Content */}
      <div className="lg:col-span-8 h-[700px] space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg tracking-tight uppercase">Operational Grid</h2>
            <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live: {tanods.filter(t => t.status === 'On Duty').length} Active Units</span>
            </div>
          </div>
          <IncidentMap incidents={incidents} tanods={tanods} userLocation={location} />
        </div>
      </div>
    </div>
  );
}
