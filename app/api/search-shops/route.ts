import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!barcode) {
    return NextResponse.json(
      { error: "Missing required parameter: barcode" },
      { status: 400 },
    );
  }

  // Use provided coordinates or default to Tokyo
  const latitude = lat ? parseFloat(lat) : 35.6762;
  const longitude = lng ? parseFloat(lng) : 139.6503;

  try {
    // Construct the API URL with the provided parameters
    const apiUrl = `https://bandainamco-am.co.jp/data/search/result?domain=bandai_gasha_shop&lat=${latitude}&log=${longitude}&spot_code=gashaItem_${barcode}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GachaShopFinder/1.0)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to match expected format
    if (data.hits && data.hits.hits) {
      return NextResponse.json({ shops: data.hits.hits });
    } else if (data.shops) {
      return NextResponse.json({ shops: data.shops });
    } else {
      return NextResponse.json({ shops: [] });
    }
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops from external API" },
      { status: 500 },
    );
  }
}
