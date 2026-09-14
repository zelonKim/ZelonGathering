"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { CHAT_CATEGORY_COLOR } from "@/constants/chatCategoryColor";
import { ChatRoomListItem } from "../../../types/ChatRoomListItem";
import { getMyChats } from "@/app/api/chat/getMyChats";

export default function ChatsPage() {
  const router = useRouter();

  const {
    data: chatRooms = [],
    isLoading,
    isError,
  } = useQuery<ChatRoomListItem[]>({
    queryKey: ["myChats"],
    queryFn: getMyChats,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-96 justify-center items-center bg-[#FBFBF9] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF7A59]" />
      </div>
    );
  }

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

  ///////////////////////////////////////////////////////////////////////////////

  return (
    <div className="w-full bg-[#FBFBF9] min-h-screen max-w-5xl mx-auto ">
      <header className="px-5 py-[15px]">
        <h1 className="text-3xl font-black text-[#FF7A59] tracking-tight">
          Chatting
        </h1>
        <p className="text-lg font-bold text-[#292524] mt-1 ml-1">
          💬 나의 실시간 채팅방
        </p>
      </header>

      <main className="px-6 pt-1.5  grid grid-cols-1 md:grid-cols-2 gap-3">
        {chatRooms.map((item: ChatRoomListItem) => {
          const categoryKey = item.category?.toUpperCase();
          const theme = CHAT_CATEGORY_COLOR[categoryKey];

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/gatherings/${item.id}?tab=CHAT`)}
              className="flex items-center bg-white p-3 rounded-[20px] border border-[#E7E5E4] cursor-pointer shadow-xs  hover:shadow-sm hover:shadow-orange-50 hover:border-orange-400 active:scale-[0.99] transition"
            >
              <div
                style={{ backgroundColor: theme.bg }}
                className="w-13 h-13 rounded-[18px] flex justify-center items-center text-2xl shrink-0"
              >
                {theme.icon}
              </div>

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
                  className={`text-sm text-[#78716C] truncate  ${
                    item.unreadCount > 0 ? "text-[#292524] font-semibold" : ""
                  }`}
                >
                  {item.lastMessage ||
                    "아직 주고받은 대화가 없습니다. 첫 인사를 건네보세요!"}
                </p>
              </div>

              {item.unreadCount > 0 && (
                <div className="bg-[#FF7A59] min-w-[20px] h-5 rounded-full flex justify-center items-center px-1.5 text-[11px] text-white font-black shrink-0">
                  {item.unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {chatRooms.length === 0 && (
        <div className="flex flex-col gap-3 items-center text-center text-[15px] font-bold text-[#78716C] pt-50 leading-[22px] whitespace-pre-line ]">
          <span>현재 참여 중인 채팅방이 없습니다.</span>
          <span>마음에 드는 소모임에 입장해 보세요! 🏃</span>
        </div>
      )}
    </div>
  );
}
