import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident, UserProfile } from '@/src/types';
import { Shield, UserCircle, AlertTriangle } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Icons
const createCustomIcon = (color: string, iconComponent: React.ReactNode) => {
  const html = renderToStaticMarkup(
    <div className={`p-2 rounded-full border-2 border-white shadow-lg bg-${color}-500 text-white`}>
      {iconComponent}
    </div>
  );
  return L.divIcon({
    html,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const RESIDENT_ICON = createCustomIcon('blue', <UserCircle className="w-6 h-6" />);
const TANOD_ICON = createCustomIcon('indigo', <Shield className="w-6 h-6" />);
const EMERGENCY_ICON = createCustomIcon('red', <AlertTriangle className="w-6 h-6" />);

interface IncidentMapProps {
  incidents: Incident[];
  tanods: UserProfile[];
  userLocation: [number, number] | null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function IncidentMap({ incidents, tanods, userLocation }: IncidentMapProps) {
  const defaultCenter: [number, number] = [14.5995, 120.9842]; // Manila default

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border-4 border-white shadow-2xl z-0">
      <MapContainer 
        center={userLocation || defaultCenter} 
        zoom={15} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <>
            <Marker position={userLocation} icon={RESIDENT_ICON}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle 
              center={userLocation} 
              radius={200} 
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: '#3b82f6' }} 
            />
            <RecenterMap center={userLocation} />
          </>
        )}

        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.location.latitude, incident.location.longitude]} 
            icon={EMERGENCY_ICON}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-600">{incident.type}</h3>
                <p className="text-sm">{incident.description}</p>
                <p className="text-xs text-gray-500 mt-1">By: {incident.reporterName}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {tanods.map((tanod) => (
          tanod.lastLocation && (
            <Marker 
              key={tanod.uid} 
              position={[tanod.lastLocation.latitude, tanod.lastLocation.longitude]} 
              icon={TANOD_ICON}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{tanod.displayName}</h3>
                  <p className="text-xs text-green-600 font-semibold">{tanod.status}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
