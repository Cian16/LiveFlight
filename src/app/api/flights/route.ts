import { NextResponse } from "next/server";

const OPENSKY_URL = "https://opensky-network.org/api/states/all";

// North America Bounding Box
const BOUNDS = {
  lamin: 24.396308,
  lomin: -124.848974,
  lamax: 49.384358,
  lomax: -66.93457,
};

export async function GET() {
  try {
    const url = `${OPENSKY_URL}?lamin=${BOUNDS.lamin}&lomin=${BOUNDS.lomin}&lamax=${BOUNDS.lamax}&lomax=${BOUNDS.lomax}`;
    
    const response = await fetch(url, {
      next: { revalidate: 10 }, // Cache for 10 seconds to stay within rate limits
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "OpenSky API returned an error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
