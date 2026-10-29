import { useState, useEffect } from "react";

const loginTexts = {
  ko: {
    downloadApp: "앱 다운로드",
    title: "Zelon \nGathering",
    subtitle: "외출 준비 완료! 🍑 \n지금 내 주변 힙한 소모임 속으로",
    emailLabel: "이메일 주소",
    emailPlaceholder: "이메일 주소를 입력하세요",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력하세요",
    loginButton: "로그인하기",
    noAccount: "아직 계정이 없으신가요?",
    signup: "회원가입",
  },
  en: {
    downloadApp: "Download App",
    title: "Zelon \nGathering",
    subtitle:
      "Ready to go out! 🍑 \nDive into trendy local gatherings around you",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Log In",
    noAccount: "Don't have an account yet?",
    signup: "Sign up",
  },
};

export function useLoginLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: loginTexts[locale] };
}
