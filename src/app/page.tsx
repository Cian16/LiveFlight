"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import FlightMap from "@/components/map";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import { useFlights } from "@/hooks/useFlights";
import { FlightState } from "@/types/flight";
import { Zap, CloudRain } from "lucide-react";

export default function Home() {
  const { flights, loading, error } = useFlights();
  const [selectedFlight, setSelectedFlight] = useState<FlightState | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const [projectedPath, setProjectedPath] = useState<[number, number][]>([]);
  const [showWeather, setShowWeather] = useState(false);

  const visibleFlights = useMemo(() => {
    if (selectedFlight) {
      return flights.filter(f => f.icao24 === selectedFlight.icao24);
    }
    return flights;
  }, [flights, selectedFlight?.icao24]);

  const projectFuturePath = useCallback(() => {
    if (!selectedFlight || !selectedFlight.latitude || !selectedFlight.longitude || !selectedFlight.velocity || !selectedFlight.true_track) {
      return;
    }

    const points: [number, number][] = [[selectedFlight.latitude, selectedFlight.longitude]];
    const velocity_mps = selectedFlight.velocity;
    const heading_rad = (selectedFlight.true_track * Math.PI) / 180;
    const timeIntervals = [300, 600, 900, 1200, 1500, 1800]; 
    const R = 6371000;

    timeIntervals.forEach(t => {
      const distance = velocity_mps * t;
      const lat1 = (selectedFlight.latitude! * Math.PI) / 180;
      const lon1 = (selectedFlight.longitude! * Math.PI) / 180;
      const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) + Math.cos(lat1) * Math.sin(distance / R) * Math.cos(heading_rad));
      const lon2 = lon1 + Math.atan2(Math.sin(heading_rad) * Math.sin(distance / R) * Math.cos(lat1), Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
      points.push([(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI]);
    });

    setProjectedPath(points);
  }, [selectedFlight]);

  useEffect(() => {
    if (selectedFlight) {
      const currentData = flights.find(f => f.icao24 === selectedFlight.icao24);
      if (currentData && currentData.latitude && currentData.longitude) {
        setPath(prev => {
          const lastPoint = prev[prev.length - 1];
          if (!lastPoint || lastPoint[0] !== currentData.latitude || lastPoint[1] !== currentData.longitude) {
            return [...prev, [currentData.latitude!, currentData.longitude!]];
          }
          return prev;
        });
        setSelectedFlight(currentData);
        if (projectedPath.length > 0) projectFuturePath();
      }
    }
  }, [flights, selectedFlight?.icao24, projectFuturePath, projectedPath.length]);

  const handleSelectFlight = (flight: FlightState | null) => {
    setSelectedFlight(flight);
    setProjectedPath([]);
    if (flight && flight.latitude && flight.longitude) {
      setPath([[flight.latitude, flight.longitude]]);
    } else {
      setPath([]);
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#020408]">
      
      {/* Top Left: Strategic Control Strip */}
      <div className="absolute top-12 left-12 z-[1000] flex flex-col gap-4">
        <div className="glass-panel rounded-[1.75rem] flex items-center h-14 overflow-hidden pr-2">
          
          {/* Brand */}
          <div className="flex items-center gap-4 px-8 border-r border-white/5 h-8">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(37,99,235,0.5)]">
              <Zap className="text-white fill-white" size={16} />
            </div>
            <span className="text-[14px] font-black tracking-tight text-white uppercase italic leading-none">
              LiveFlight <span className="text-blue-500">PRO</span>
            </span>
          </div>

          {/* Environmental Controls */}
          <div className="flex items-center gap-2 px-6 border-r border-white/5 h-8">
            <button 
              onClick={() => setShowWeather(!showWeather)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${showWeather ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}
            >
              <CloudRain size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Weather</span>
            </button>
          </div>

          {/* Telemetry Overview */}
          <div className="flex items-center gap-10 px-10 border-r border-white/5 h-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Radar Signals</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[16px] mono font-bold text-white leading-none tracking-tighter">
                  {flights.length.toString().padStart(4, '0')}
                </span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Active</span>
              </div>
            </div>
          </div>

          <Search 
            flights={flights} 
            onSelect={handleSelectFlight} 
            onClear={() => handleSelectFlight(null)}
            activeTarget={selectedFlight?.icao24 || null}
          />
        </div>
      </div>

      {/* Main Radar Map Engine */}
      <div className="h-full w-full">
        <FlightMap 
          flights={visibleFlights} 
          onSelectFlight={handleSelectFlight}
          selectedFlight={selectedFlight}
          selectedPath={path}
          projectedPath={projectedPath}
          showWeather={showWeather}
        />
      </div>

      <Sidebar 
        flight={selectedFlight} 
        onClose={() => handleSelectFlight(null)} 
        onProject={projectFuturePath}
      />

      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-[#020408] to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_transparent_0%,_#020408_100%)] opacity-70"></div>
      </div>
    </main>
  );
}
