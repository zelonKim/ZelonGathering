"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react"; // Ionicons 대체
import { client } from "@/api/client";

// 🎨 카테고리별 아바타 테마 색상 및 이모지 맵 (공통 스펙 싱크 보존)
const CATEGORY_MAP: Record<string, { bg: string; icon: string }> = {
  STUDY: { bg: "#E0F2FE", icon: "📖" },
  SPORTS: { bg: "#E6F4EA", icon: "⚽️" },
  ART: { bg: "#FAE7F3", icon: "🎨" },
  FOOD: { bg: "#FEF0E6", icon: "🍔" },
  BOOK: { bg: "#F1ECE4", icon: "📚" },
  GAME: { bg: "#EDE9FE", icon: "🎯" },
  TALK: { bg: "#F4F4F5", icon: "🎙️" },
  TOUR: { bg: "#E0F7FA", icon: "🚠" },
};

export default function ChatsPage() {
  const router = useRouter();

  // 🔄 1. 내가 속한 소모임 채팅방 목록 API Fetch (React Query v5 규격 유지)
  const {
    data: chatRooms = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myChats"],
    queryFn: async () => {
      const { data } = await client.get("/users/chats");
      return data;
    },
    refetchInterval: 5000, // 실시간 메시지 요약을 위한 폴링 주기 유지
  });

  // 로딩 상태 UI 공정
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-96 justify-center items-center bg-[#FBFBF9] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF7A59]" />
        <p className="text-sm font-semibold text-[#78716C]">
          채팅방 목록을 불러오는 중입니다
        </p>
      </div>
    );
  }

  // 에러 상태 UI 공정
  if (isError) {
    return (
      <div className="flex flex-col flex-1 h-96 justify-center items-center bg-[#FBFBF9] gap-3">
        <AlertCircle className="w-12 h-12 text-[#78716C]" />
        <p className="text-sm font-semibold text-[#78716C]">
          채팅 목록을 가져오지 못했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FBFBF9] min-h-screen max-w-4xl mx-auto ">
      {/* 1. 상단 타이틀 바 */}
      <header className="px-5 pt-[15px] pb-[15px]">
        <h1 className="text-2xl font-black text-[#FF7A59] tracking-tight">
          Chatting
        </h1>
        <p className="text-base font-bold text-[#292524] mt-0.5">
          💬 나의 실시간 채팅방
        </p>
      </header>

      {/* 2. 실시간 소모임 채팅 리스트 피드 */}
      <main className="px-5 pt-1.5 pb-24 space-y-3">
        {chatRooms.map((item: any) => {
          // 카테고리에 맞는 아바타 테마 추출 (기본값 TALK)
          const categoryKey = item.category?.toUpperCase() || "TALK";
          const theme = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.TALK;

          return (
            <div
              key={item.id}
              onClick={() =>
                // 🚀 카드를 누르면 해당 소모임 상세 화면의 [실시간 채팅방] 탭 브랜치 주소로 무브
                router.push(`/gatherings/${item.id}?tab=CHAT`)
              }
              className="flex items-center bg-white p-4 rounded-[20px] border border-[#E7E5E4] cursor-pointer hover:shadow-md active:scale-[0.99] transition shadow-[0_4px_8px_rgba(0,0,0,0.01)]"
            >
              {/* 왼쪽: 모달 카테고리 기반 힙한 그래픽 아바타 */}
              <div
                style={{ backgroundColor: theme.bg }}
                className="w-[52px] h-[52px] rounded-[18px] flex justify-center items-center text-xl shrink-0"
              >
                {theme.icon}
              </div>

              {/* 가운데: 소모임 타이틀 & 최신 대화 요약 */}
              <div className="flex-1 min-w-0 mx-3.5">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[15px] font-bold text-[#292524] truncate max-w-[75%]">
                    {item.title}
                  </h3>
                  <span className="text-xs text-[#78716C] font-medium shrink-0">
                    {item.lastMessageTime || ""}
                  </span>
                </div>

                <p
                  className={`text-13px text-[#78716C] truncate leading-[18px] ${
                    item.unreadCount > 0 ? "text-[#292524] font-semibold" : ""
                  }`}
                >
                  {item.lastMessage ||
                    "아직 주고받은 대화가 없습니다. 첫 인사를 건네보세요!"}
                </p>
              </div>

              {/* 오른쪽: 안 읽은 알림 카운트 배지 */}
              {item.unreadCount > 0 && (
                <div className="bg-[#FF7A59] min-w-[20px] h-5 rounded-full flex justify-center items-center px-1.5 text-[11px] text-white font-black shrink-0">
                  {item.unreadCount}
                </div>
              )}
            </div>
          );
        })}

        {/* 채팅방 엠티 컴포넌트 처리 */}
        {chatRooms.length === 0 && (
          <div className="text-center text-sm font-semibold text-[#78716C] pt-20 leading-[22px] whitespace-pre-line">
            현재 참여 중인 소모임 채팅방이 없습니다.{"\n"}
            마음에 드는 소모임에 가입해 보세요! 🏃
          </div>
        )}
      </main>
    </div>
  );
}
