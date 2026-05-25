import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { SOSButton } from './SOSButton';
import { IncidentMap } from './IncidentMap';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Incident, UserProfile, Announcement, EmergencyType } from '@/src/types';
import { handleFirestoreError, OperationType } from '@/src/lib/error-handler';
import { Newspaper, ShieldCheck, Clock, BrainCircuit, History } from 'lucide-react';
import { formatTimestamp } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { StatusBadge } from './ui/StatusBadge';
import { queueIncident } from '@/src/lib/sync';

export function ResidentDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tanods, setTanods] = useState<UserProfile[]>([]);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [recentSOS, setRecentSOS] = useState<Incident | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const qIncidents = query(collection(db, 'incidents'), where('createdAt', '>=', yesterday));
    const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      setIncidents(data);
      
      // Check for user's own active SOS
      if (user) {
        const myActive = data.find(i => i.reporterId === user.uid && i.status !== 'Resolved');
        setRecentSOS(myActive || null);
      }
    });

    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(5));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });

    const qTanods = query(collection(db, 'users'), where('role', '==', 'Tanod'), where('status', '==', 'On Duty'));
    const unsubTanods = onSnapshot(qTanods, (snapshot) => {
      setTanods(snapshot.docs.map(doc => doc.data() as UserProfile));
    });

    return () => {
      unsubIncidents();
      unsubAnnouncements();
      unsubTanods();
    };
  }, [user]);

  const [showCategories, setShowCategories] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSOSTrigger = () => {
    setShowCategories(true);
  };

  const executeSOS = async (type: EmergencyType) => {
    if (!user || !location) return;
    setShowCategories(false);
    
    const description = `Emergency: ${type}. Please respond immediately.`;

    const incidentData = {
      reporterId: user.uid,
      reporterName: user.displayName,
      type: type,
      description,
      location: { latitude: location[0], longitude: location[1] },
      status: 'Pending' as const,
      assignedTanods: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (navigator.onLine) {
        const docRef = await addDoc(collection(db, 'incidents'), incidentData);
        fetch('/api/gemini/sos-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, description })
        }).then(res => res.json()).then(data => {
          if (data.guidance) {
            updateDoc(doc(db, 'incidents', docRef.id), { aiGuidance: data.guidance });
            const utterance = new SpeechSynthesisUtterance(data.guidance);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
          }
        });
      } else {
        queueIncident(incidentData);
        const utterance = new SpeechSynthesisUtterance("You are offline. SOS alert has been queued.");
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'incidents');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Category Selection Modal/Overlay */}
      <AnimatePresence>
        {showCategories && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md"
          >
            <GlassCard className="max-w-md w-full p-8 border-red-500/20 shadow-2xl">
              <h3 className="font-black text-2xl text-center uppercase tracking-tighter mb-6">Select Emergency Type</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(EmergencyType).map((type) => (
                  <button
                    key={type}
                    onClick={() => executeSOS(type)}
                    className="w-full py-4 px-6 rounded-2xl bg-gray-50 hover:bg-red-600 hover:text-white transition-all text-left font-black uppercase text-xs tracking-widest border border-gray-100 flex items-center justify-between group"
                  >
                    <span>{type}</span>
                    <History className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                <button 
                  onClick={() => setShowCategories(false)}
                  className="mt-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-[0.2em]"
                >
                  Cancel Protocol
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 h-[600px] relative"
        >
          <GlassCard className="h-full p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-black text-2xl tracking-tighter uppercase text-gray-900 leading-none">Emergency Grid</h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 inline-block">Real-time Telemetry Active</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 flex items-center space-x-3">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-green-700 uppercase tracking-widest">{tanods.length} Responders On Grid</span>
              </div>
            </div>
            <div className="flex-1 rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
              <IncidentMap incidents={incidents} tanods={tanods} userLocation={location} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Guidance Card */}
          <AnimatePresence>
            {recentSOS && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <GlassCard variant="danger" className="p-6 border-red-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-lg tracking-tight uppercase text-red-700">AI Guard Guidance</h3>
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl text-sm text-red-900 leading-relaxed font-medium italic">
                    {recentSOS.aiGuidance || "Analyzing emergency situation... stay calm."}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={recentSOS.status} />
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Responders incoming</span>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <GlassCard className="p-6">
            <h3 className="font-black text-lg tracking-tight uppercase mb-6 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Zone Security</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-2xl font-black text-gray-900">2.4m</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Response</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-2xl font-black text-gray-900">24/7</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monitoring</span>
              </div>
            </div>
          </GlassCard>

          {/* Announcements */}
          <GlassCard className="p-6">
            <h3 className="font-black text-lg tracking-tight uppercase mb-6 flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-indigo-600" />
              <span>Official Bulletins</span>
            </h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
              {announcements.map((news) => (
                <div key={news.id} className="relative pl-4 border-l-2 border-indigo-100 group">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-200 group-hover:bg-indigo-600 transition-colors" />
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">
                    {formatTimestamp(news.createdAt)}
                  </span>
                  <h4 className="font-bold text-gray-900 leading-tight mb-1">{news.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{news.content}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <SOSButton onTrigger={handleSOSTrigger} disabled={!!recentSOS} />
    </div>
  );
}
