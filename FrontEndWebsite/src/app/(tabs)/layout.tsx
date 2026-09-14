"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  Home,
  MessageCircleMore,
  Sparkles,
  User,
} from "lucide-react";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "홈",
      href: "/",
      icon: Home,
    },
    {
      name: "채팅",
      href: "/chats",
      icon: MessageCircleMore,
    },
    {
      name: "매칭 알림",
      href: "/matching",
      icon: Bell,
    },
    {
      name: "프로필",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] flex flex-col justify-between">
      <main className="flex-1 w-full mx-auto min-h-screen pb-20 shadow-sm border-x border-[#E7E5E4]">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E5E5EA] z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-around px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const IconComponent = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center flex-1 h-full relative group"
              >
                <div className="relative p-1">
                  <IconComponent
                    className={`w-6 h-6 transition-transform duration-200 group-active:scale-95 ${
                      isActive ? "text-[#FF7A59]" : "text-[#8E8E93]"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

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
