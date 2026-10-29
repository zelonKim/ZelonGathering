import { useState, useEffect } from 'react';

const qrModalTexts = {
  ko: {
    title: "Zelon Gathering 앱 설치",
    subtitle: "스마트폰 카메라로 QR 코드를 스캔하세요",
    qrReady: "QR 준비 중",
  },
  en: {
    title: "Install Zelon Gathering App",
    subtitle: "Scan the QR code with your smartphone camera",
    qrReady: "QR Preparing",
  },
};

export function useQrModalLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: qrModalTexts[locale], locale };
}