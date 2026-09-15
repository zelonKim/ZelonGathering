"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/app/api/client";
import { getMyProfile } from "@/app/api/profile/getMyProfile";

interface UserProfile {
  id: string;
  nickname: string;
  profileImg?: string;
  mannerTemperature?: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: {
    id: string;
    nickname: string;
    profileImg?: string;
  };
}

interface PrivateChatRoomDetail {
  id: string;
  userAId: string;
  userBId: string;
  userA: UserProfile;
  userB: UserProfile;
  messages: Message[];
}

// 1) 대화 내역 가져오기 API
const getPrivateMessages = async (
  roomId: string,
  limit: number,
): Promise<Message[]> => {
  const { data } = await client.get<Message[]>(
    `/chats/private/messages/${roomId}`,
    { params: { limit } },
  );
  // DB에서 desc(최신순)로 가져온 경우, 채팅창 출력을 위해 시간순(asc)으로 정렬
  return data.reverse();
};

// 2) 메시지 전송 (DB 저장) API
const sendPrivateMessage = async (
  roomId: string,
  message: string,
): Promise<Message> => {
  const { data } = await client.post<Message>(
    `/chats/private/message/${roomId}`,
    { message },
  );
  return data;
};

export default function PrivateChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;
  const queryClient = useQueryClient();

  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 내 프로필 정보 가져오기
  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });
  const myId = myProfile?.id;

  // 채팅방 상세 정보 가져오기 (상대방 프로필 정보용)
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

  // 내 ID 기준으로 상대방 유저 자동 판별
  const partnerUser = roomData
    ? roomData.userAId === myId
      ? roomData.userB
      : roomData.userA
    : null;

  // DB에서 대화 내역 가져오기
  const { data: chatMessages = [], isLoading: isMessagesLoading } = useQuery<
    Message[]
  >({
    queryKey: ["privateMessages", roomId],
    queryFn: () => getPrivateMessages(roomId, 500),
    enabled: !!roomId,
  });

  // 메시지 전송 Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      sendPrivateMessage(roomId, messageText),
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(
        ["privateMessages", roomId],
        (old = []) => [...old, newMessage],
      );
      setChatInput("");
    },
    onError: () => {
      alert("메시지 전송에 실패했습니다.");
    },
  });

  // 메시지 목록이 추가될 때마다 자동으로 최하단 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(chatInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F4]">
      {/* 헤더 */}
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

      {/* 메시지 영역 */}
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

      {/* 입력 폼 */}
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
          disabled={!chatInput.trim() || sendMessageMutation.isPending}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition shrink-0 ${
            chatInput.trim() && !sendMessageMutation.isPending
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
