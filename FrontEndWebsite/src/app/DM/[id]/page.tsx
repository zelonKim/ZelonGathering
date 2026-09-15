"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/app/api/client";
import { getMyProfile } from "@/app/api/profile/getMyProfile";
import { ChatMessage } from "@/types/ChatMessage";
import { PrivateChatRoomDetail } from "@/types/PrivateChatRoomDetail";
import { getPrivateMessages } from "@/app/api/chat/getPrivateMessages";

import { io, Socket } from "socket.io-client";

export default function PrivateChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;
  const queryClient = useQueryClient();

  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const myId = myProfile?.id;

  /////////////////////////////////////////////////////////

  useEffect(() => {
    if (!roomId || !myId) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ 웹소켓 연결 성공! Socket ID:", socket.id);
      socket.emit("join_room", { roomId });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ 웹소켓 연결 실패:", err.message);
    });

    socket.on("new_private_message", (newMessage: ChatMessage) => {
      console.log("📩 새 메시지 수신:", newMessage);
      queryClient.setQueryData<ChatMessage[]>(
        ["privateMessages", roomId],
        (old = []) => {
          if (old.some((msg) => msg.id === newMessage.id)) return old;
          return [...old, newMessage];
        },
      );
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.disconnect();
    };
  }, [roomId, myId, queryClient]);

  /////////////////////////////////////////////////////////////////////

  const {
    data: roomData,
    isLoading: isRoomLoading,
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

  /////////////////////////////////////////////////////////////////////////

  const { data: chatMessages = [], isLoading: isMessagesLoading } = useQuery<
    ChatMessage[]
  >({
    queryKey: ["privateMessages", roomId],
    queryFn: () => getPrivateMessages(roomId, 500),
    enabled: !!roomId,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /////////////////////////////////////////////////////////////////////////

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socketRef.current || !myId) return;

    socketRef.current.emit("send_private_message", {
      roomId,
      senderId: myId,
      dto: { message: chatInput },
    });

    setChatInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /////////////////////////////////////////////////////////////////////////

  if (isRoomLoading) {
    return (
      <div className="relative top-1/2 -translate-y-1/2 p-12 text-[15px] text-center text-stone-400">
        채팅방을 불러오는 중...
      </div>
    );
  }

  if (isError || !partnerUser) {
    return (
      <div className="relative top-1/2 -translate-y-1/2 p-12 text-[15px] text-center text-stone-400">
        채팅방을 찾을 수 없습니다.
      </div>
    );
  }

  /////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F4]">
      <header className="sticky top-0 z-10 bg-white border-b border-[#E7E5E4] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/chats?tab=DM")}
            className="p-1.5 hover:bg-stone-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center font-bold overflow-hidden border border-orange-400">
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
              <p className="text-[12px] font-semibold text-orange-500">
                매너온도 {partnerUser.mannerTemperature ?? 36.5}°C
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-8rem)]">
        {isMessagesLoading ? (
          <div className="text-center py-12 text-[15px] text-stone-400">
            대화 내역을 불러오는 중...
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center py-12 text-[15px] font-semibold text-stone-400 whitespace-pre-line leading-relaxed">
            💬 아직 주고 받은 대화가 없습니다. <br />첫 메시지를 보내보세요!
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
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#FFFFFF] border-t border-[#E7E5E4] flex items-center gap-2 shrink-0 sticky bottom-0"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
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
