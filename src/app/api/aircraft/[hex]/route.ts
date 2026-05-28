import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hex: string }> }
) {
  try {
    const { hex } = await params;
    
    // Attempt lookup with User-Agent and no-cache for Vercel stability
    const response = await fetch(`https://hexdb.io/api/v1/aircraft/${hex}`, {
      headers: { 'User-Agent': 'LiveFlight/1.0' },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      // Fallback to adsb.lol
      const fallbackResponse = await fetch(`https://api.adsb.lol/v2/hex/${hex}`, {
        headers: { 'User-Agent': 'LiveFlight/1.0' },
        cache: 'no-store'
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.ac && fallbackData.ac.length > 0) {
          const ac = fallbackData.ac[0];
          return NextResponse.json({
            Registration: ac.r || "RESTRICTED",
            Type: ac.t || "Unknown Type",
            RegisteredOwners: ac.ownOp || "Private Operator",
            ICAOTypeCode: ac.t || "---"
          });
        }
      }

      return NextResponse.json(
        { error: "Metadata unavailable" },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Metadata Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
