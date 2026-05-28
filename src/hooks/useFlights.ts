"use client";

import { useState, useEffect, useCallback } from "react";
import { FlightState } from "@/types/flight";

export function useFlights() {
  const [flights, setFlights] = useState<FlightState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      // Fetch from our own API route to avoid CORS
      const response = await fetch("/api/flights");
      
      if (!response.ok) {
        throw new Error("Radar synchronization failed");
      }

      const data = await response.json();
      
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
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Radar link unstable. Retrying...");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  return { flights, loading, error, refresh: fetchFlights };
}
