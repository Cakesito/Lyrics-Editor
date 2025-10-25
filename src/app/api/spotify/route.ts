import { NextRequest, NextResponse } from "next/server";
import Spotify from "@/lib/spotify";
const sp_dc = process.env.SP_DC!;
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get("track");

    if (!trackId)
      return NextResponse.json(
        { error: "No track id provided" },
        { status: 400 },
      );

    const client = new Spotify(sp_dc);
    const response = await client.getLyrics(trackId);

    return NextResponse.json(response);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
