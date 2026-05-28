import { NextResponse } from "next/server";

// Keep URL simple
const OPENSKY_URL = "https://opensky-network.org/api/states/all";

// North America Bounding Box
const lamin = 24.396308;
const lomin = -124.848974;
const lamax = 49.384358;
const lomax = -66.93457;

export async function GET() {
  try {
    const url = `${OPENSKY_URL}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    
    // Simplest possible fetch for cloud environment
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API Response: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Vercel Proxy Error:", error.message);
    return NextResponse.json(
      { error: "Internal Connection Error" },
      { status: 500 }
    );
  }
}
