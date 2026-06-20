"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Sparkles, User } from "lucide-react";

interface TabsLayoutProps {
  children: React.ReactNode;
}

export default function TabsLayout({ children }: TabsLayoutProps) {
  const pathname = usePathname();

  // 🌟 각 탭 메뉴의 정보 정의 (기존 Expo 라우트 이식)
  const tabs = [
    {
      name: "홈",
      href: "/",
      icon: Home,
    },
    {
      name: "채팅",
      href: "/chats",
      icon: MessageSquare,
      badge: 3, // 🌟 기존 tabBarBadge: 3 완벽 재현
    },
    {
      name: "AI 매칭",
      href: "/matching",
      icon: Sparkles,
    },
    {
      name: "프로필",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] flex flex-col justify-between">
      {/* 1. 상단 메인 콘텐츠 영역 */}
      <main className="flex-1 w-full mx-auto bg-white min-h-screen pb-20 shadow-sm border-x border-[#E7E5E4]">
        {children}
      </main>

      {/* 2. 하단 내비게이션 바 (하단 고정 모바일 앱 감성 레이아웃) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E5E5EA] z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-around px-2">
          {tabs.map((tab) => {
            // 🌟 현재 경로 활성화(Active) 상태 체크
            const isActive = pathname === tab.href;
            const IconComponent = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center flex-1 h-full relative group"
              >
                {/* 아이콘 컨테이너 */}
                <div className="relative p-1">
                  <IconComponent
                    className={`w-6 h-6 transition-transform duration-200 group-active:scale-95 ${
                      isActive ? "text-[#FF7A59]" : "text-[#8E8E93]"
                    }`}
                    // focused 상태에 따라 테두리 굵기나 스타일 채우기 에뮬레이션
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* 🔴 채팅 배지 알림 수치 (tabBarBadge) */}
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#FF7A59] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ring-1 ring-[#FF7A59]/10">
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* 텍스트 라벨 */}
                <span
                  className={`text-[10px] mt-1 font-bold transition-colors ${
                    isActive ? "text-[#FF7A59]" : "text-[#8E8E93]"
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
