import { useState, useEffect } from "react";

const signupTexts = {
  ko: {
    greeting: "하이루 👋",
    subGreeting: "가입하고, 새로운 사람들과 인사해봐요.",
    emailLabel: "이메일 계정",
    emailPlaceholder: "example@zelon.com",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "영문, 숫자 포함 8자 이상",
    passwordConfirmLabel: "비밀번호 확인",
    passwordConfirmPlaceholder: "비밀번호를 한번 더 입력해 주세요",
    signupButton: "가입하기",
  },
  en: {
    greeting: "Nice to meet ya 👋",
    subGreeting: "Sign up and say hello to new people.",
    emailLabel: "Email Account",
    emailPlaceholder: "example@zelon.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters with letters and numbers",
    passwordConfirmLabel: "Confirm Password",
    passwordConfirmPlaceholder: "Enter your password once more",
    signupButton: "Sign Up",
  },
};

export function useSignupLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: signupTexts[locale], locale };
}
