import { KakaoAddressResult } from "@/types/KakaoAddressResult";
import Constants from "expo-constants";

export async function getKakaoAddress(
  lat: number | string,
  lng: number | string,
): Promise<KakaoAddressResult> {
  if (!lat || !lng) {
    throw new Error("좌표가 필요합니다.");
  }

  const apiKey =
    Constants.expoConfig?.extra?.kakaoRestApiKey ||
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  if (!apiKey) {
    console.error("Kakao REST API Key가 설정되지 않았습니다.");
    throw new Error("Kakao API Key가 설정되지 않았습니다.");
  }

  ///////////////////////////////////////////////////////////////////////////////////

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`카카오 API 요청 실패 (Status: ${response.status})`);
    }

    const addrData = await response.json();

    let roadAddress = "";

    if (addrData.documents && addrData.documents.length > 0) {
      const doc = addrData.documents[0];
      if (doc.road_address) {
        roadAddress = doc.road_address.building_name
          ? `${doc.road_address.building_name}`
          : `${doc.road_address.address_name}`;
      } else if (doc.address) {
        roadAddress = `${doc.address.address_name}`;
      }
    }

    return {
      address: roadAddress || "주소 정보 없음",
      raw: addrData,
    };
  } catch (error) {
    console.error("Kakao Geocode Error:", error);
    throw new Error("주소 변환 실패");
  }
}
