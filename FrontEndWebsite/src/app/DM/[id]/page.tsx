"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/app/api/client";

interface UserProfile {
  id: string;
  nickname: string;
  profileImg?: string;
  mannerTemperature?: number;
}

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: UserProfile;
}

interface PrivateChatRoomDetail {
  id: string;
  userAId: string;
  userBId: string;
  userA: UserProfile;
  userB: UserProfile;
  messages: Message[];
}

export default function PrivateChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const myId = "실제_로그인한_유저_ID";

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. DM 채팅방 상세 데이터 및 메시지 내역 조회
  const {
    data: roomData,
    isLoading,
    isError,
  } = useQuery<PrivateChatRoomDetail>({
    queryKey: ["privateChatRoom", roomId],
    queryFn: async () => {
      const { data } = await client.get(`/chats/private/room/${roomId}`);
      return data;
    },
    enabled: !!roomId,
  });

  const partnerUser = roomData
    ? roomData.userAId === myId
      ? roomData.userB
      : roomData.userA
    : null;

  useEffect(() => {
    if (roomData?.messages) {
      setChatMessages(roomData.messages);
    }
  }, [roomData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: myId,
      message: chatInput,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-stone-400">
        채팅방을 불러오는 중...
      </div>
    );
  }

  if (isError || !partnerUser) {
    return (
      <div className="p-4 text-center text-stone-400">
        채팅방을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F4]">
      <header className="sticky top-0 z-10 bg-white border-b border-[#E7E5E4] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 hover:bg-stone-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center font-bold overflow-hidden border border-stone-200">
              {partnerUser.profileImg ? (
                <img
                  src={partnerUser.profileImg}
                  alt={partnerUser.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                "🍑"
              )}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#292524] leading-tight">
                {partnerUser.nickname}
              </h2>
              <p className="text-[11px] font-semibold text-stone-400">
                매너온도 {partnerUser.mannerTemperature ?? 36.5}°C
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-8rem)]">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12 text-sm font-semibold text-stone-400 whitespace-pre-line leading-relaxed">
            💬 {partnerUser.nickname}님과의 첫 메시지를 보내보세요!
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderId === myId;

            return (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-lg bg-stone-200 shrink-0 overflow-hidden flex items-center justify-center text-sm border border-stone-300">
                    {partnerUser.profileImg ? (
                      <img
                        src={partnerUser.profileImg}
                        alt="Partner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "🍑"
                    )}
                  </div>
                )}

                <div
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {!isMe && (
                    <span className="text-[10px] font-bold text-stone-400 mb-1 pl-1">
                      {partnerUser.nickname}
                    </span>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-sm font-semibold leading-relaxed break-all ${
                      isMe
                        ? "bg-[#FF7A59] text-white rounded-tr-none shadow-xs"
                        : "bg-white text-[#292524] border border-[#E7E5E4] rounded-tl-none shadow-xs"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 하단 메시지 입력 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-[#E7E5E4] flex items-center gap-2 shrink-0 sticky bottom-0"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 bg-[#F5F5F4] px-4 py-2.5 rounded-full text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition shrink-0 ${
            chatInput.trim()
              ? "bg-[#FF7A59] hover:bg-[#E0684B]"
              : "bg-stone-200 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
