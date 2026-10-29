import React from "react";
import { OS } from "@/types/ConfigOS";

// 언어별 OS 가이드 데이터를 한 곳에 정의합니다.
const mobileOsData = {
  ko: {
    android: {
      label: "Android",
      qrPath: "/images/Android_QR.png",
      qrAlt: "Android QR",
      title: "Android 설치 가이드",
      guide: (
        <>
          1. 기본 카메라 앱으로 QR 코드를 인식합니다.
          <br />
          2. 링크에서 제공되는{" "}
          <strong className="font-bold text-orange-500">APK 설치 파일</strong>을
          다운로드하여 실행해 주세요.
        </>
      ),
    },
    ios: {
      label: "iOS",
      qrPath: "/images/iOS_QR.png",
      qrAlt: "iOS TestFlight QR",
      title: "iOS 설치 가이드",
      guide: (
        <>
          1. 기본 카메라 앱으로 QR 코드를 인식합니다.
          <br />
          2. <strong className="font-bold text-[#FF7A59]">TestFlight</strong>를
          수락하고 베타 버전을 다운로드 받아주세요.
        </>
      ),
    },
  },
  en: {
    android: {
      label: "Android",
      qrPath: "/images/Android_QR.png",
      qrAlt: "Android QR",
      title: "Android Installation Guide",
      guide: (
        <>
          1. Scan the QR code with your default camera app.
          <br />
          2. Download and run the{" "}
          <strong className="font-bold text-orange-500">APK installation file</strong> provided from the link.
        </>
      ),
    },
    ios: {
      label: "iOS",
      qrPath: "/images/iOS_QR.png",
      qrAlt: "iOS TestFlight QR",
      title: "iOS Installation Guide",
      guide: (
        <>
          1. Scan the QR code with your default camera app.
          <br />
          2. Accept <strong className="font-bold text-[#FF7A59]">TestFlight</strong> and download the beta version.
        </>
      ),
    },
  },
};

// 💡 외부에서 locale을 받아 알맞은 데이터를 리턴해주는 함수로 변경합니다.
export const getMobileOsConfig = (locale: "ko" | "en") => {
  return mobileOsData[locale];
};