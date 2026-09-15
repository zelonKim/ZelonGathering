"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, User } from "lucide-react";
import { CHAT_CATEGORY_COLOR } from "@/constants/chatCategoryColor";
import { ChatRoomListItem } from "../../../types/ChatRoomListItem";
import { PrivateChatRoomListItem } from "../../../types/PrivateChatRoomListItem";
import { getMyChats } from "@/app/api/chat/getMyChats";
import { getMyPrivateChats } from "@/app/api/chat/getMyPrivateChatRooms";
import { getMyProfile } from "@/app/api/profile/getMyProfile";

function ChatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"Gathering" | "DM">(
    tabParam === "DM" ? "DM" : "Gathering",
  );

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const myId = myProfile?.id;

  ////////////////////////////////////////////////////////////////

  const {
    data: gatheringChats = [],
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery<ChatRoomListItem[]>({
    queryKey: ["myChats"],
    queryFn: getMyChats,
    refetchInterval: 5000,
  });

  const {
    data: privateChats = [],
    isLoading: isPrivateLoading,
    isError: isPrivateError,
  } = useQuery<PrivateChatRoomListItem[]>({
    queryKey: ["myPrivateChats"],
    queryFn: getMyPrivateChats,
    refetchInterval: 5000,
  });

  const isLoading = isGatheringLoading || isPrivateLoading;
  const isError = isGatheringError || isPrivateError;

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

  //////////////////////////////////////////////////////////////////////////////

  return (
    <div className="w-full bg-[#FBFBF9] min-h-screen max-w-5xl mx-auto">
      <header className="px-5 py-[15px]">
        <div>
          <h1 className="text-3xl font-black text-[#FF7A59] tracking-tight">
            Chatting
          </h1>
          <p className="text-lg font-bold text-gray-900 mt-1 ">
            👋 우리들의 실시간 대화
          </p>
        </div>

        <div className="flex flex-row justify-center w-full border-b border-[#E7E5E4] mt-4">
          <button
            onClick={() => setActiveTab("Gathering")}
            className={`flex-1 pb-2 font-bold text-base text-center transition ${
              activeTab === "Gathering"
                ? "text-[#FF7A59] border-b-2 border-[#FF7A59]"
                : "text-[#78716C]"
            }`}
          >
            💬 소모임 채팅
          </button>
          <button
            onClick={() => setActiveTab("DM")}
            className={`flex-1 pb-2 font-bold text-base text-center transition ${
              activeTab === "DM"
                ? "text-[#FF7A59] border-b-2 border-[#FF7A59]"
                : "text-[#78716C]"
            }`}
          >
            👤 DM
          </button>
        </div>
      </header>

      <main className="px-6 pt-1.5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeTab === "Gathering" &&
          gatheringChats.map((item) => {
            const categoryKey = item.category?.toUpperCase();
            const theme = CHAT_CATEGORY_COLOR[categoryKey];

            return (
              <div
                key={item.id}
                onClick={() => router.push(`/gatherings/${item.id}?tab=CHAT`)}
                className="flex items-center bg-white p-3 rounded-[20px] border border-[#E7E5E4] cursor-pointer shadow-xs hover:shadow-sm hover:shadow-orange-50 hover:border-orange-400 active:scale-[0.99] transition"
              >
                <div
                  style={{ backgroundColor: theme?.bg }}
                  className="w-13 h-13 rounded-[18px] flex justify-center items-center text-2xl shrink-0"
                >
                  {theme?.icon}
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
                    className={`text-sm text-[#78716C] truncate ${
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

        {activeTab === "DM" &&
          privateChats.map((room) => {
            const partner = room.userAId === myId ? room.userB : room.userA;
            const lastMsg = room.messages[0];

            return (
              <div
                key={room.id}
                onClick={() => router.push(`/DM/${room.id}`)}
                className="flex items-center bg-white p-3 rounded-[20px] border border-[#E7E5E4] cursor-pointer shadow-xs hover:shadow-sm hover:shadow-orange-50 hover:border-orange-400 active:scale-[0.99] transition"
              >
                <div className="w-13 h-13 rounded-[18px] overflow-hidden bg-stone-100 flex justify-center items-center shrink-0">
                  {partner?.profileImg ? (
                    <img
                      src={partner.profileImg}
                      alt={partner.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#78716C]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 mx-3.5">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[15px] font-bold text-[#292524] truncate max-w-[75%]">
                      {partner?.nickname}
                    </h3>
                    <span className="text-xs text-[#78716C] font-medium shrink-0">
                      {lastMsg?.createdAt
                        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-[#78716C] truncate">
                    {lastMsg?.message || "대화를 시작해 보세요!"}
                  </p>
                </div>
              </div>
            );
          })}
      </main>

      {activeTab === "Gathering" && gatheringChats.length === 0 && (
        <div className="flex flex-col gap-3 items-center text-center text-[15px] font-bold text-[#78716C] pt-20 leading-[22px]">
          <span>현재 참여 중인 소모임 채팅방이 없습니다.</span>
        </div>
      )}

      {activeTab === "DM" && privateChats.length === 0 && (
        <div className="flex flex-col gap-3 items-center text-center text-[15px] font-bold text-[#78716C] pt-20 leading-[22px]">
          <span>진행 중인 1:1 대화가 없습니다.</span>
        </div>
      )}
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////

export default function ChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 h-96 justify-center items-center bg-[#FBFBF9] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF7A59]" />
        </div>
      }
    >
      <ChatsContent />
    </Suspense>
  );
}
