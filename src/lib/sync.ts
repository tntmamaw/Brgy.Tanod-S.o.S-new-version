import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Incident } from '../types';

const QUEUE_KEY = 'sos_emergency_queue';

export interface QueuedIncident extends Omit<Incident, 'id'> {}

export const syncQueue = async () => {
  if (!navigator.onLine) return;

  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} queued incidents...`);

  const updatedQueue = [...queue];
  for (let i = 0; i < queue.length; i++) {
    try {
      await addDoc(collection(db, 'incidents'), queue[i]);
      updatedQueue.splice(i, 1);
      i--; // adjust index after removal
    } catch (error) {
      console.error("Sync failed for item:", error);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
};

export const queueIncident = (incident: QueuedIncident) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  queue.push(incident);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  // Try sync immediately if online
  if (navigator.onLine) {
    syncQueue();
  } else {
    console.warn("Offline: SOS queued for sync.");
  }
};

window.addEventListener('online', syncQueue);
