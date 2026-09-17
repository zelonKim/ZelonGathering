import { ConfigOS, OS } from "@/types/ConfigOS";

export const MOBILE_OS: Record<OS, ConfigOS> = {
  ios: {
    label: "iOS",
    qrPath: "/images/IOS_QR.png",
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
};
