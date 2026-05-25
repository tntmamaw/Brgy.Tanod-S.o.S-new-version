import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + Vite
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TacticalMapProps {
  center?: [number, number];
  zoom?: number;
  incidents?: any[];
}

// Component to handle thematic map styling
function ThemeController() {
  const map = useMap();
  useEffect(() => {
    // Force a resize check for proper rendering
    map.invalidateSize();
  }, [map]);
  return null;
}

export function TacticalMap({ center = [13.4432, 121.8389], zoom = 13, incidents = [] }: TacticalMapProps) {
  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden rounded-sm border border-white/5">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#030712' }}
        zoomControl={false}
      >
        {/* Dark Matter tiles for the tactical look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ThemeController />

        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.location.latitude || center[0], incident.location.longitude || center[1]]}
          >
            <Popup className="tactical-popup">
              <div className="p-2 font-mono text-[10px] uppercase">
                <div className="font-bold text-tactical-red">{incident.type}</div>
                <div className="text-gray-500 mt-1">{incident.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tactical Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none z-[1000] opacity-10">
          <div className="w-full h-full" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, #00f2ff 1px, transparent 1px), linear-gradient(to bottom, #00f2ff 1px, transparent 1px)' }} />
        </div>
      </MapContainer>
    </div>
  );
}
