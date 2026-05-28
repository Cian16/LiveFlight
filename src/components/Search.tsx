"use client";

import { useState, useMemo } from "react";
import { FlightState } from "@/types/flight";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchProps {
  flights: FlightState[];
  onSelect: (flight: FlightState) => void;
  onClear: () => void;
  activeTarget: string | null;
}

export default function Search({ flights, onSelect, onClear, activeTarget }: SearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return flights
      .filter(f => 
        f.callsign.toLowerCase().includes(q) || 
        f.icao24.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query, flights]);

  return (
    <div className="relative flex items-center h-full px-6">
      <div className="flex items-center gap-4 group">
        <SearchIcon size={16} className="text-slate-500 group-focus-within:text-blue-500 transition-all duration-300" />
        <input 
          type="text"
          placeholder="Enter flight number..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent border-none outline-none text-[14px] font-medium text-slate-100 placeholder:text-slate-600 w-56 tracking-tight"
        />
        {(query || activeTarget) && (
          <button onClick={() => { setQuery(""); onClear(); }} className="text-slate-600 hover:text-white transition-colors p-2">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 mt-6 w-80 glass-panel rounded-[1.5rem] overflow-hidden z-[1200] animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5">
            <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Active Targets Found</span>
          </div>
          {results.map((flight) => (
            <button
              key={flight.icao24}
              onClick={() => {
                onSelect(flight);
                setQuery(flight.callsign);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-6 py-5 hover:bg-blue-600/10 transition-all text-left group border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">
                  {flight.callsign}
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {flight.origin_country}
                </p>
              </div>
              <span className="text-[10px] mono text-slate-600 font-bold uppercase tracking-widest">
                {flight.icao24}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
