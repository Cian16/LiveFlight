import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ callsign: string }> }
) {
  try {
    const { callsign } = await params;
    
    // Clean callsign (remove spaces)
    const cleanCallsign = callsign.trim();
    
    const response = await fetch(`https://api.adsbdb.com/v0/callsign/${cleanCallsign}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Route data not found" },
        { status: 404 }
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
