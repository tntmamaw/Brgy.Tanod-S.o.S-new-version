import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { SOSButton } from './SOSButton';
import { IncidentMap } from './IncidentMap';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Incident, UserProfile, Announcement } from '@/src/types';
import { handleFirestoreError, OperationType } from '@/src/lib/error-handler';
import { Newspaper, Send, ShieldCheck, Clock } from 'lucide-react';
import { formatTimestamp } from '@/src/lib/utils';
import { motion } from 'motion/react';

export function ResidentDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tanods, setTanods] = useState<UserProfile[]>([]);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    // Subscribe to active incidents (last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const qIncidents = query(
      collection(db, 'incidents'),
      where('createdAt', '>=', yesterday)
    );
    const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'incidents'));

    // Subscribe to announcements
    const qAnnouncements = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'announcements'));

    // Subscribe to active Tanods
    const qTanods = query(
      collection(db, 'users'),
      where('role', '==', 'Tanod'),
      where('status', '==', 'On Duty')
    );
    const unsubTanods = onSnapshot(qTanods, (snapshot) => {
      setTanods(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, error => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => {
      unsubIncidents();
      unsubAnnouncements();
      unsubTanods();
    };
  }, []);

  const handleSOS = async () => {
    if (!user || !location) return;
    
    try {
      await addDoc(collection(db, 'incidents'), {
        reporterId: user.uid,
        reporterName: user.displayName,
        type: 'SOS ALERT',
        description: 'Auto-generated SOS from emergency button.',
        location: {
          latitude: location[0],
          longitude: location[1]
        },
        status: 'Pending',
        assignedTanods: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      // Voice feedback (Web Speech API)
      const utterance = new SpeechSynthesisUtterance("SOS Alert sent. Help is on the way. Please stay where you are.");
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'incidents');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 pb-32 max-w-7xl mx-auto">
      {/* Map Column */}
      <div className="lg:col-span-8 h-[500px] lg:h-[700px]">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg tracking-tight uppercase">Emergency Radar</h2>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tanods.length} Tanods On Duty</span>
            </div>
          </div>
          <IncidentMap 
            incidents={incidents} 
            tanods={tanods} 
            userLocation={location} 
          />
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="lg:col-span-4 space-y-6">
        {/* Info Card */}
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl">
          <h2 className="font-black text-2xl tracking-tighter mb-2">SAFE ZONE</h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-4">
            You are currently in a monitored zone. Use the SOS button only for life-threatening emergencies.
          </p>
          <div className="flex space-x-2">
            <div className="bg-indigo-800 p-3 rounded-xl flex-1 flex flex-col items-center">
              <ShieldCheck className="w-6 h-6 mb-1 text-green-400" />
              <span className="text-[10px] uppercase font-bold text-indigo-300">Active protection</span>
            </div>
            <div className="bg-indigo-800 p-3 rounded-xl flex-1 flex flex-col items-center">
              <Clock className="w-6 h-6 mb-1 text-blue-400" />
              <span className="text-[10px] uppercase font-bold text-indigo-300">24/7 Response</span>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b border-gray-50 pb-4">
            <Newspaper className="w-5 h-5 text-indigo-600" />
            <h2 className="font-black text-lg tracking-tight uppercase">Barangay News</h2>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {announcements.map((news) => (
              <motion.div 
                key={news.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group cursor-pointer"
              >
                <p className="text-xs font-bold text-indigo-600 mb-1">{formatTimestamp(news.createdAt)}</p>
                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{news.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{news.content}</p>
                <hr className="mt-4 border-gray-50" />
              </motion.div>
            ))}
            {announcements.length === 0 && (
              <p className="text-center text-gray-400 py-10 italic text-sm">No recent announcements.</p>
            )}
          </div>
        </div>
      </div>

      <SOSButton onTrigger={handleSOS} />
    </div>
  );
}
