import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "좌표가 필요합니다." }, { status: 400 });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    console.error("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
    return NextResponse.json(
      { error: "Kakao API Key가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const addrRes = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      },
    );

    const addrData = await addrRes.json();
    console.log("카카오 API 응답 결과:", JSON.stringify(addrData, null, 2));

    let roadAddress = "";

    if (addrData.documents && addrData.documents.length > 0) {
      const doc = addrData.documents[0];
      if (doc.road_address) {
        roadAddress = doc.road_address.building_name
          ? `${doc.road_address.building_name} `
          : `${doc.road_address.address_name}`;
      } else if (doc.address) {
        roadAddress = `${doc.address.address_name}`;
      }
    }

    return NextResponse.json({
      address: roadAddress || "주소 정보 없음",
      raw: addrData,
    });
  } catch (error) {
    console.error("Kakao Geocode Error:", error);
    return NextResponse.json({ error: "주소 변환 실패" }, { status: 500 });
  }
}
