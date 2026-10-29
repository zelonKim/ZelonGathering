import { useState, useEffect } from "react";

const tabsTexts = {
  ko: {
    home: "홈",
    chats: "채팅",
    matching: "매칭 알림",
    profile: "프로필",
  },
  en: {
    home: "Home",
    chats: "Chats",
    matching: "Notifications",
    profile: "Profile",
  },
};

export function useTabsLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: tabsTexts[locale] };
}