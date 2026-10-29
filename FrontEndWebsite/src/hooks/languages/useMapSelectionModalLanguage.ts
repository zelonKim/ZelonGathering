import { useState, useEffect } from "react";

const mapModalTexts = {
  ko: {
    instructionTag: "원하는 모임 장소를 지도에서 터치해 주세요 📍",
    selectedTitle: "선택된 모임 장소",
    emptyInstruction: "지도를 클릭하여 모임 장소에 핀을 꽂아주세요!",
    confirmButton: "이 장소로 지정하기",
    alertNoSelection: "지도에서 모임 장소를 먼저 터치해 주세요! 📍",
    fallbackAddress: (lat: string, lng: string) => `선택된 위치: (${lat}, ${lng})`,
  },
  en: {
    instructionTag: "Tap on the map to select a gathering location 📍",
    selectedTitle: "Selected Location",
    emptyInstruction: "Click on the map to place a pin for your location!",
    confirmButton: "Set as Gathering Location",
    alertNoSelection: "Please tap a location on the map first! 📍",
    fallbackAddress: (lat: string, lng: string) => `Selected Location: (${lat}, ${lng})`,
  },
};

export function useMapSelectionModalLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: mapModalTexts[locale], locale };
}