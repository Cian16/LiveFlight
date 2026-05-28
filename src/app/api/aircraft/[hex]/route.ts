import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hex: string }> }
) {
  try {
    const { hex } = await params;
    
    // Fallback to hexdb.io
    const response = await fetch(`https://hexdb.io/api/v1/aircraft/${hex}`);
    
    if (!response.ok) {
      // If hexdb fails, try adsb.lol as a fallback
      const fallbackResponse = await fetch(`https://api.adsb.lol/v2/hex/${hex}`);
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

      return NextResponse.json(
        { error: "Aircraft metadata not found" },
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
