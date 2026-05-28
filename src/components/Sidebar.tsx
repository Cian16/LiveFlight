"use client";

import { FlightState, AircraftMetadata, FlightRoute } from "@/types/flight";
import { Plane, Wind, Navigation, ArrowUpRight, ArrowDownRight, Globe, X, Info, Shield, Radar, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface SidebarProps {
  flight: FlightState | null;
  onClose: () => void;
  onProject: () => void;
}

// Haversine Distance Helper (meters)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function Sidebar({ flight, onClose, onProject }: SidebarProps) {
  const [metadata, setMetadata] = useState<AircraftMetadata | null>(null);
  const [route, setRoute] = useState<FlightRoute | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flight?.icao24) {
      setLoading(true);
      
      // 1. Fetch Aircraft Metadata
      fetch(`/api/aircraft/${flight.icao24}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setMetadata(data);
          else setMetadata(null);
        })
        .catch(() => setMetadata(null));

      // 2. Fetch Flight Route
      if (flight.callsign && flight.callsign !== "N/A") {
        fetch(`/api/route/${flight.callsign}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.response?.flightroute) setRoute(data.response.flightroute);
            else setRoute(null);
          })
          .catch(() => setRoute(null))
          .finally(() => setLoading(false));
      } else {
        setRoute(null);
        setLoading(false);
      }
    } else {
      setMetadata(null);
      setRoute(null);
    }
  }, [flight?.icao24, flight?.callsign]);

  // Calculate Live ETA and Distance
  const missionMetrics = useMemo(() => {
    if (!flight || !route || !flight.latitude || !flight.longitude || !flight.velocity) return null;
    
    const distToDest = getDistance(flight.latitude, flight.longitude, route.destination.latitude, route.destination.longitude);
    const distTotal = getDistance(route.origin.latitude, route.origin.longitude, route.destination.latitude, route.destination.longitude);
    
    // Time = Distance / Velocity (m / mps)
    const secondsLeft = distToDest / flight.velocity;
    const minutesLeft = Math.round(secondsLeft / 60);
    
    const progress = Math.min(Math.max(((distTotal - distToDest) / distTotal) * 100, 0), 100);

    return {
      distance: (distToDest / 1852).toFixed(0), // convert to Nautical Miles
      eta: minutesLeft > 60 ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m` : `${minutesLeft}m`,
      progress
    };
  }, [flight, route]);

  const getStatus = () => {
    if (!flight) return null;
    if (flight.on_ground) return { label: "On Ground", color: "bg-amber-500/20 text-amber-500 border-amber-500/20" };
    const rate = flight.vertical_rate || 0;
    if (rate > 1) return { label: "Climbing", color: "bg-blue-500/20 text-blue-400 border-blue-500/20", icon: <ArrowUpRight size={12} /> };
    if (rate < -1) return { label: "Descending", color: "bg-rose-500/20 text-rose-400 border-rose-500/20", icon: <ArrowDownRight size={12} /> };
    return { label: "Level Flight", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20", icon: <Navigation size={12} className="rotate-90" /> };
  };

  const status = getStatus();

  return (
    <AnimatePresence>
      {flight && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-6 top-6 bottom-6 w-[420px] z-[1100] glass-toolbar rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col border border-white/10"
        >
          {/* Header */}
          <div className="p-8 pb-6 border-b border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                    {flight.callsign || "N/A"}
                  </h2>
                  {status && (
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-500" /> {flight.origin_country}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-white/10 text-slate-500 transition-all hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
            
            {/* 1. Mission Progress (New!) */}
            {route && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Mission</span>
                </div>
                
                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Origin</p>
                      <p className="text-xl font-black text-white leading-none">{route.origin.iata_code}</p>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">{route.origin.municipality}</p>
                    </div>
                    <div className="flex-1 px-6 flex flex-col items-center gap-2">
                      <Plane size={16} className="text-blue-500 rotate-90" />
                      <div className="w-full h-[1px] bg-white/10 relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                          style={{ width: `${missionMetrics?.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                      <p className="text-xl font-black text-white leading-none">{route.destination.iata_code}</p>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">{route.destination.municipality}</p>
                    </div>
                  </div>

                  {missionMetrics && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-emerald-400" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Arrival In</p>
                          <p className="text-sm font-black text-white italic">{missionMetrics.eta}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Radar size={14} className="text-blue-400" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Remaining</p>
                          <p className="text-sm font-black text-white italic">{missionMetrics.distance} NM</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Identity */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Operator</p>
                  <p className="text-sm font-bold text-white">
                    {loading ? "Analyzing..." : metadata?.RegisteredOwners || "Private / Data Restricted"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Model</p>
                    <p className="text-xs font-bold text-white uppercase truncate">{loading ? "..." : metadata?.Type || "Unknown"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Registration</p>
                    <p className="text-xs font-mono font-bold text-blue-400">{loading ? "..." : metadata?.Registration || "N/A"}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Telemetry */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Radar size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MetricBox 
                  icon={<Plane size={14} className="text-blue-400" />}
                  label="Alt"
                  value={`${flight.baro_altitude ? Math.round(flight.baro_altitude * 3.28084).toLocaleString() : "---"}`}
                  unit="FT"
                />
                <MetricBox 
                  icon={<Wind size={14} className="text-emerald-400" />}
                  label="Speed"
                  value={`${flight.velocity ? Math.round(flight.velocity * 1.94384) : "---"}`}
                  unit="KTS"
                />
                <MetricBox 
                  icon={<Navigation size={14} className="text-amber-400" />}
                  label="Course"
                  value={`${flight.true_track ? Math.round(flight.true_track) : "---"}`}
                  unit="DEG"
                />
                <MetricBox 
                  icon={<ArrowUpRight size={14} className="text-blue-400" />}
                  label="V. Speed"
                  value={`${flight.vertical_rate ? Math.round(flight.vertical_rate * 196.85) : "---"}`}
                  unit="FPM"
                />
              </div>
            </section>
          </div>

          <div className="p-8 bg-blue-600/5 border-t border-white/5">
            <button 
              onClick={onProject}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Run Trajectory Projection
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricBox({ icon, label, value, unit }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-xl font-black text-white tracking-tighter leading-none">{value}</p>
        <span className="text-[10px] font-bold text-slate-600">{unit}</span>
      </div>
    </div>
  );
}
