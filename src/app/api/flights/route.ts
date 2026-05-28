import { NextResponse } from "next/server";

// Switching to ADSB.lol - A more reliable, community-run aggregator for cloud IPs
const ADSB_LOL_URL = "https://api.adsb.lol/v2/lat/40.71/lon/-74.00/dist/250";

export async function GET() {
  try {
    console.log("Routing via ADSB.lol Gateway...");

    const response = await fetch(ADSB_LOL_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LiveFlight_Radar_v1.0'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Gateway rejected request: ${response.status}`);
      return NextResponse.json(
        { error: `Gateway Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // ADSB.lol returns an 'ac' array. We must transform it back to our FlightState format.
    if (!data.ac || data.ac.length === 0) {
      return NextResponse.json({ states: [] });
    }

    // Transform ADSB.lol format to our app's internal format
    const transformedStates = data.ac.map((ac: any) => [
      ac.hex,           // 0: icao24
      ac.flight || "N/A", // 1: callsign
      ac.t || "Unknown", // 2: origin (using type as placeholder)
      ac.seen,          // 3: time_position
      ac.seen,          // 4: last_contact
      ac.lon,           // 5: longitude
      ac.lat,           // 6: latitude
      ac.alt_baro,      // 7: baro_altitude
      ac.gs === 0,      // 8: on_ground
      ac.gs / 1.94384,  // 9: velocity (kts to m/s)
      ac.track,         // 10: true_track
      ac.baro_rate,     // 11: vertical_rate
      null,             // 12: sensors
      ac.alt_geom,      // 13: geo_altitude
      ac.squawk,        // 14: squawk
      false,            // 15: spi
      0                 // 16: position_source
    ]);

    return NextResponse.json({ states: transformedStates });

  } catch (error: any) {
    console.error("ADSB.lol Bridge Error:", error.message);
    return NextResponse.json(
      { error: "Global Gateway Offline" },
      { status: 500 }
    );
  }
}
