"use client";

import { useState, useEffect, useCallback } from "react";
import { FlightState } from "@/types/flight";

export function useFlights() {
  const [flights, setFlights] = useState<FlightState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      const response = await fetch("/api/flights");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }
      
      if (data && data.states) {
        const transformedFlights: FlightState[] = data.states.map((s: any[]) => ({
          icao24: s[0],
          callsign: s[1]?.trim() || "N/A",
          origin_country: s[2],
          time_position: s[3],
          last_contact: s[4],
          longitude: s[5],
          latitude: s[6],
          baro_altitude: s[7],
          on_ground: s[8],
          velocity: s[9],
          true_track: s[10],
          vertical_rate: s[11],
          sensors: s[12],
          geo_altitude: s[13],
          squawk: s[14],
          spi: s[15],
          position_source: s[16],
        }));
        
        setFlights(transformedFlights);
        setError(null);
      } else if (data.warning) {
        setError(data.warning);
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Uplink Failed");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    // Increase interval to 20s for production to be safer with cloud IPs
    const interval = setInterval(fetchFlights, 20000); 
    return () => clearInterval(interval);
  }, [fetchFlights]);

  return { flights, loading, error, refresh: fetchFlights };
}
