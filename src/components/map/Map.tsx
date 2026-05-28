"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FlightState } from "@/types/flight";
import { useEffect, useState } from "react";

// Custom Aircraft Icon using SVG
const createAircraftIcon = (rotation: number, isSelected: boolean) => {
  const color = isSelected ? "#3b82f6" : "#f8fafc";
  const size = isSelected ? 32 : 24;
  
  return L.divIcon({
    html: `
      <div style="transform: rotate(${rotation}deg); width: ${size}px; height: ${size}px;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14.5L13 9.5V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9.5L2 14.5V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" 
            fill="${color}" 
            stroke="black" 
            stroke-width="0.5"
          />
        </svg>
      </div>
    `,
    className: "custom-aircraft-icon",
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

function MapController({ selectedFlight }: { selectedFlight: FlightState | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedFlight?.latitude && selectedFlight?.longitude) {
      map.setView([selectedFlight.latitude, selectedFlight.longitude], map.getZoom(), {
        animate: true,
      });
    }
  }, [selectedFlight, map]);
  return null;
}

interface MapProps {
  flights: FlightState[];
  onSelectFlight: (flight: FlightState | null) => void;
  selectedFlight: FlightState | null;
  selectedPath: [number, number][];
  projectedPath: [number, number][];
  showWeather: boolean;
}

export default function Map({ flights, onSelectFlight, selectedFlight, selectedPath, projectedPath, showWeather }: MapProps) {
  const [weatherTimestamp, setWeatherTimestamp] = useState<number | null>(null);
  const center: [number, number] = [40.7128, -74.006];
  const worldBounds: L.LatLngBoundsExpression = [[-90, -180], [90, 180]];

  useEffect(() => {
    if (showWeather) {
      fetch("https://api.rainviewer.com/public/weather-maps.json")
        .then(res => res.json())
        .then(data => {
          if (data && data.radar && data.radar.past) {
            const latest = data.radar.past[data.radar.past.length - 1].time;
            setWeatherTimestamp(latest);
          }
        });
    }
  }, [showWeather]);

  return (
    <div className="h-full w-full bg-[#020408]">
      <MapContainer
        center={center}
        zoom={5}
        minZoom={3}
        maxZoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
        maxBounds={worldBounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
          bounds={worldBounds}
        />

        {showWeather && weatherTimestamp && (
          <TileLayer
            url={`https://tilecache.rainviewer.com/v2/radar/${weatherTimestamp}/512/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.6}
            zIndex={100}
          />
        )}
        
        <MapController selectedFlight={selectedFlight} />

        {selectedPath.length > 1 && (
          <Polyline 
            positions={selectedPath} 
            pathOptions={{ color: "#3b82f6", weight: 2, opacity: 0.5, dashArray: "8, 8" }} 
          />
        )}

        {projectedPath.length > 1 && (
          <Polyline 
            positions={projectedPath} 
            pathOptions={{ color: "#22d3ee", weight: 3, opacity: 0.8, dashArray: "4, 12", lineCap: "round" }} 
          />
        )}
        
        {flights.map((flight) => {
          if (flight.latitude === null || flight.longitude === null) return null;
          const isSelected = selectedFlight?.icao24 === flight.icao24;
          return (
            <Marker
              key={flight.icao24}
              position={[flight.latitude, flight.longitude]}
              icon={createAircraftIcon(flight.true_track || 0, isSelected)}
              eventHandlers={{ click: () => onSelectFlight(flight) }}
              zIndexOffset={isSelected ? 1000 : 0}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
