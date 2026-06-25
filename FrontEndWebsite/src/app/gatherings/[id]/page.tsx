"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Trash2,
  LogOut,
  CheckCircle,
  Ban,
  Send,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  UserX,
  Loader2,
  Thermometer,
} from "lucide-react";
import { client } from "@/api/client";

// --- 매핑 및 테마 딕셔너리 ---
const CATEGORY_MAP: Record<
  string,
  { label: string; emoji: string; bg: string; text: string }
> = {
  STUDY: { label: "스터디", emoji: "📖", bg: "#E0F2FE", text: "#0369A1" },
  SPORTS: { label: "스포츠", emoji: "⚽️", bg: "#E6F4EA", text: "#137333" },
  ART: { label: "아트", emoji: "🎨", bg: "#FAE7F3", text: "#B80066" },
  FOOD: { label: "푸드", emoji: "🍔", bg: "#FEF0E6", text: "#D94E2B" },
  BOOK: { label: "독서", emoji: "📚", bg: "#F1ECE4", text: "#614E3D" },
  GAME: { label: "게임", emoji: "🎯", bg: "#EDE9FE", text: "#5B21B6" },
  TALK: { label: "토크", emoji: "🎙️", bg: "#F4F4F5", text: "#3F3F46" },
  TOUR: { label: "투어", emoji: "🚠", bg: "#E0F7FA", text: "#006064" },
};

const DAY_MAP: Record<string, string> = {
  MON: "월요일",
  TUE: "화요일",
  WED: "수요일",
  THU: "목요일",
  FRI: "금요일",
  SAT: "토요일",
  SUN: "일요일",
};

const TIME_MAP: Record<string, string> = {
  AM_06: "오전 6시",
  AM_07: "오전 7시",
  AM_08: "오전 8시",
  AM_09: "오전 9시",
  AM_10: "오전 10시",
  AM_11: "오전 11시",
  PM_12: "정오 12시",
  PM_01: "오후 1시",
  PM_02: "오후 2시",
  PM_03: "오후 3시",
  PM_04: "오후 4시",
  PM_05: "오후 5시",
  PM_06: "오후 6시",
  PM_07: "오후 7시",
  PM_08: "오후 8시",
  PM_09: "오후 9시",
  PM_10: "오후 10시",
};

export default function GatheringDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"INFO" | "CHAT">(
    tabParam === "CHAT" ? "CHAT" : "INFO",
  );

  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 언마운트 시 캐시 초기화 가드
  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ["gatheringDetail", id] });
      queryClient.resetQueries({ queryKey: ["gatheringChats", id] });
    };
  }, [id, queryClient]);

  // 🔄 1. 백엔드 소모임 단건 상세 정보 FETCH
  const {
    data: gathering,
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery({
    queryKey: ["gatheringDetail", id],
    queryFn: async () => {
      const { data } = await client.get(`/gatherings/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 3000,
  });

  // 👤 2. 현재 로그인 세션 내 프로필 캐시 FETCH
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await client.get("/users/me");
      return data;
    },
  });

  const myId = userProfile?.id;

  // 🛡️ [권한 로직 인터셉터]
  const myParticipation = gathering?.participants?.find(
    (p: any) => p.user?.id === myId || p.userId === myId,
  );

  const isKicked = myParticipation?.status === "REJECTED";
  const isAlreadyParticipant =
    !!myId && !!myParticipation && myParticipation.status !== "REJECTED";
  const isHost = !!myId && gathering?.hostId === myId;
  const canAccessChat = (isHost || isAlreadyParticipant) && !isKicked;

  // 쿼리 스트링 서브 탭 동기화 효과
  useEffect(() => {
    if (tabParam === "CHAT" && canAccessChat) {
      setActiveTab("CHAT");
    } else {
      setActiveTab("INFO");
    }
  }, [tabParam, canAccessChat]);

  // 💬 3. 실시간 단체 채팅 목록 수신
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["gatheringChats", id], // 🌟 기준 정형 키 설정 완료
    queryFn: async () => {
      const { data } = await client.get(`/chats/public/${id}`);
      return [...data].reverse();
    },
    // enabled: !!id && canAccessChat,
    refetchInterval: 3000,
  });

  console.log(chatMessages);

  // 새로운 메시지 수신 시 아래로 부드럽게 스크롤링
  useEffect(() => {
    if (activeTab === "CHAT") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // 🚀 4. 메시지 전송 MUTATION
  const sendChatMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await client.post(`/chats/public/${id}`, { message });
    },
    onSuccess: () => {
      setChatInput("");
      // 🌟 [교정] 무효화 타겟 주소의 대소문자를 'gatheringChats'로 한 자의 오차 없이 정렬했습니다.
      queryClient.invalidateQueries({ queryKey: ["gatheringChats", id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "메시지를 보내지 못했습니다.");
    },
  });

  // 🚀 5. 소모임 참여 신청 MUTATION
  const joinGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/gatherings/${id}/join`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          "소모임방 참여 중 문제가 발생했습니다.",
      );
    },
  });

  // 🚪 6. 참여 철회 및 탈퇴 MUTATION
  const leaveGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.delete(`/gatherings/${id}/leave`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      router.back();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "소모임방에서 나가지 못했습니다.");
      router.back();
    },
  });

  // 🗑️ 7. 소모임 폭파 MUTATION (방장 전용)
  const deleteGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.delete(`/gatherings/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data?.message) alert(data.message);
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      router.back();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "소모임방을 삭제하지 못했습니다.");
    },
  });

  // 🚫 8. 유저 멤버 강퇴 MUTATION (방장 전용)
  const kickParticipantMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return await client.patch(`/gatherings/${id}/participants`, {
        userId: targetUserId,
        status: "REJECTED",
      });
    },
    onSuccess: () => {
      alert("해당 멤버를 소모임에서 강퇴 처리했습니다.");
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "멤버 강퇴 처리에 실패했습니다.");
    },
  });

  // 💬 [수정 완공] 엔터키 연속 버스팅 및 리프레시 버그 차단막이 탑재된 핸들러 함수
  const handleSendMessage = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key === "Enter") {
      e.preventDefault();
    }

    // 🍏 [더블 방어막] 이미 전송 중이거나 인풋이 비어있으면 아예 패스!
    if (!chatInput.trim() || sendChatMessageMutation.isPending) return;

    sendChatMessageMutation.mutate(chatInput.trim());
  };

  const handleJoinPress = () => {
    if (confirm("정말로 이 소모임에 참여하시겠습니까?")) {
      joinGatheringMutation.mutate();
    }
  };

  const handleKickPress = (targetUserId: string, nickname: string) => {
    if (
      confirm(
        `정말로 '${nickname}' 멤버를 강퇴 하시겠습니까?\n\n‼️ 강퇴된 멤버는 다시 가입할 수 없습니다.`,
      )
    ) {
      kickParticipantMutation.mutate(targetUserId);
    }
  };

  const handleHeaderAction = () => {
    if (isHost) {
      if (
        confirm(
          "정말로 이 소모임을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구는 불가능합니다.",
        )
      ) {
        deleteGatheringMutation.mutate();
      }
    } else {
      if (confirm("정말로 소모임 참여를 취소하고 나가시겠습니까?")) {
        leaveGatheringMutation.mutate();
      }
    }
  };

  if (isGatheringLoading || isProfileLoading) {
    return (
      <div className="flex flex-col h-[80vh] justify-center items-center bg-[#FBFBF9] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A59]" />
        <p className="text-sm font-semibold text-[#78716C]">
          소모임방에 입장하는 중입니다 🍑
        </p>
      </div>
    );
  }

  if (isGatheringError || isProfileError || !gathering) {
    return (
      <div className="flex flex-col h-[80vh] justify-center items-center bg-[#FBFBF9] gap-3 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-[#78716C]" />
        <p className="text-sm font-semibold text-[#78716C]">
          존재하지 않거나 이미 폐쇄된 소모임방입니다. 👀
        </p>
        <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["gatherings"] });
            router.replace("/");
          }}
          className="bg-[#FF7A59] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  const catTheme = CATEGORY_MAP[
    gathering.category?.toUpperCase() || "TALK"
  ] || {
    label: gathering.category,
    emoji: "📍",
    bg: "#F2F0EC",
    text: "#292524",
  };
  const activeParticipants =
    gathering.participants?.filter((p: any) => p.status !== "REJECTED") || [];

  return (
    <div className="min-h-screen text-[#292524] flex flex-col max-w-5xl mx-auto bg-white border-x border-[#E7E5E4] relative">
      {/* 1. 상단 타이틀 헤더 바 */}
      <header className="flex justify-between items-center px-4 py-3.5 bg-white border-b border-[#E7E5E4] shrink-0 sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-stone-100 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6 text-[#292524]" />
        </button>
        <h2 className="text-base font-bold max-w-[65%] truncate">
          {gathering.title}
        </h2>

        {canAccessChat ? (
          <button
            onClick={handleHeaderAction}
            className="p-1.5 hover:bg-stone-100 rounded-full transition text-[#292524]"
          >
            {isHost ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* 2. 네비게이션 탭 토글 바 */}
      <div className="flex bg-white border-b border-[#E7E5E4] shrink-0">
        <button
          onClick={() => setActiveTab("INFO")}
          className={`flex-1 py-3 text-center text-[15px] font-bold transition-all border-b-[3px] ${
            activeTab === "INFO"
              ? "border-[#FF7A59] text-[#FF7A59] font-black"
              : "border-transparent text-[#78716C]"
          }`}
        >
          모임 소개 정보
        </button>
        <button
          onClick={() => {
            if (!canAccessChat) {
              alert(
                isKicked
                  ? "강퇴된 소모임이므로 채팅방에 입장할 수 없습니다."
                  : "소모임에 참여한 멤버만 채팅방에 입장할 수 있습니다.",
              );
              return;
            }
            setActiveTab("CHAT");
          }}
          className={`flex-1 py-3 text-center text-[15px] font-bold transition-all border-b-[3px] ${
            activeTab === "CHAT"
              ? "border-[#FF7A59] text-[#FF7A59] font-black"
              : "border-transparent text-[#78716C]"
          }`}
        >
          실시간 채팅방
        </button>
      </div>

      {/* 3. 본문 뷰 렌더링 파이프라인 */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col">
        {/* TAB 1. 소모임 정보 피드 란 */}
        {activeTab === "INFO" && (
          <div className="p-5 space-y-6 flex-1 pb-16">
            <div className="bg-white shadow-xs border border-[#E7E5E4] rounded-3xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex justify-between items-center">
                <span
                  style={{ backgroundColor: catTheme.bg, color: catTheme.text }}
                  className="text-[12px] font-black px-2.5 py-1 rounded-lg"
                >
                  {catTheme.label} {catTheme.emoji}
                </span>

                {isHost ? (
                  <span className="text-[12px] font-bold text-[#78716C] bg-stone-100 border border-stone-200 px-3 py-1 rounded-lg">
                    내가 만든 모임 👑
                  </span>
                ) : isKicked ? (
                  <span className="text-[12px] font-bold text-[#EF4444] bg-red-50 border border-red-200 px-3 py-1 rounded-lg flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    참여 불가
                  </span>
                ) : isAlreadyParticipant ? (
                  <span className="text-[12px] font-extrabold text-[#FF7A59] bg-[#FFEBE5] border border-[#FF7A59]/30 px-3 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    참여 완료
                  </span>
                ) : (
                  <button
                    onClick={handleJoinPress}
                    disabled={joinGatheringMutation.isPending}
                    className="bg-[#FF7A59] text-white text-xs font-extrabold px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#e06848] transition"
                  >
                    {joinGatheringMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "참여하기 🚀"
                    )}
                  </button>
                )}
              </div>

              <h3 className="text-[22px] font-black text-[#292524] tracking-tight leading-snug">
                {gathering.title}
              </h3>
              <div className="inline-block bg-stone-100 px-2.5 py-1 rounded-md text-xs font-bold text-[#78716C]">
                모집 현황: {activeParticipants.length} /{" "}
                {gathering.maxParticipants ?? 4}명
              </div>

              <div className="space-y-2 pt-1 border-t border-stone-50 text-[13.5px] font-semibold text-[#78716C]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A59]" />
                  <span>{gathering.gatheringPlace}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF7A59]" />
                  <span>
                    {gathering.gatheringDay
                      ?.map((d: string) => DAY_MAP[d] || d)
                      .join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A59]" />
                  <span>
                    {gathering.gatheringTime
                      ?.map((t: string) => TIME_MAP[t] || t)
                      .join(", ")}
                  </span>
                </div>
              </div>

              <div className="h-px bg-stone-100 my-4" />
              <p className="text-[15px] font-black text-[#292524] mb-1">
                모임 소개
              </p>
              <p className="text-[14px] font-medium text-stone-600 leading-relaxed whitespace-pre-wrap">
                {gathering.description || "등록된 소개글이 없습니다."}
              </p>
            </div>

            {/* 방장 컴포넌트 */}
            <div className="space-y-2">
              <h4 className="text-[15px] font-black text-[#292524] pl-1">
                방장
              </h4>
              <div className="md:max-w-[486px] shadow-xs bg-white border border-[#E7E5E4] rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center font-bold overflow-hidden">
                  {gathering.host?.profileImg ? (
                    <img
                      src={gathering.host.profileImg}
                      alt="Host"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "🍑"
                  )}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#292524]">
                    {gathering.host?.nickname || "방장"}
                  </p>
                  <p className="text-[12px] font-bold text-[#FF7A59] mt-0.5 flex flex-row">
                    <Thermometer className="w-3.5 h-3.5 mt-0.5 -ml-1" /> 매너
                    온도 {gathering.host?.mannerTemperature}°C
                  </p>
                </div>
              </div>
            </div>

            {/* 참여 멤버 명단 */}
            <div className="space-y-2">
              <h4 className="text-[15px] font-black text-[#292524] pl-1 ">
                참여 중인 멤버 ({activeParticipants.length}명)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                {activeParticipants.map((p: any, idx: number) => {
                  const participantUserId = p.user?.id || p.userId;
                  return (
                    <div
                      key={participantUserId || idx}
                      className="bg-white shadow-xs border border-[#E7E5E4] rounded-2xl p-3.5 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center font-bold overflow-hidden">
                          {p.user?.profileImg ? (
                            <img
                              src={p.user.profileImg}
                              alt="Member"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "🏃"
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-[#292524]">
                            {p.user?.nickname || "참여자"}
                          </p>
                          <p className="text-[12px] font-bold text-[#FF7A59] mt-0.5 flex flex-row">
                            <Thermometer className="w-3.5 h-3.5 mt-0.5 -ml-1" />{" "}
                            매너 온도 {p.user?.mannerTemperature ?? 36.5}°C
                          </p>
                        </div>
                      </div>

                      {isHost && participantUserId !== myId && (
                        <button
                          onClick={() =>
                            handleKickPress(
                              participantUserId,
                              p.user?.nickname || "참여자",
                            )
                          }
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-[#E11D48] text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2. 단체 실시간 채팅방 피드 란 */}
        {activeTab === "CHAT" && canAccessChat && (
          <div className="flex flex-col flex-1 h-full min-h-[60vh] bg-orange-50">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-12rem)]">
              {chatMessages.length === 0 ? (
                <div className="text-center py-48 text-sm font-semibold text-stone-400 whitespace-pre-line leading-relaxed">
                  실시간 채팅방이 개설되었습니다! {"\n"} 모임원들과 첫 대화를
                  나눠보세요 💬
                </div>
              ) : (
                chatMessages.map((msg: any) => {
                  const isMe = msg.senderId === myId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-lg bg-stone-200 shrink-0 overflow-hidden flex items-center justify-center text-sm">
                          {msg.sender?.profileImg ? (
                            <img
                              src={msg.sender.profileImg}
                              alt="Sender"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "🏃"
                          )}
                        </div>
                      )}
                      <div
                        className={` flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-stone-400 mb-1">
                            {msg.sender?.nickname || "멤버"}
                          </span>
                        )}
                        <div
                          className={`p-3 rounded-2xl text-sm font-semibold leading-relaxed ${
                            isMe
                              ? "bg-[#FF7A59] text-white rounded-tr-none"
                              : "bg-white text-[#292524] border border-[#E7E5E4] rounded-tl-none"
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

            {/* 웹 하단 플로팅 챗 샌더 인풋 덱 */}
            <div className="p-5 bg-white border-t border-[#E7E5E4] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                // 🍏 [해결] onKeyDown 대신 onKeyUp을 사용하면 한글 조합 버그 및 더블 서브밋이 완벽하게 치료됩니다!
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="메시지를 입력해주세요"
                className="flex-1 bg-[#F5F5F4] px-4 py-2.5 rounded-full text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={
                  !chatInput.trim() || sendChatMessageMutation.isPending
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition shrink-0 ${
                  chatInput.trim()
                    ? "bg-[#FF7A59] hover:bg-[#e06848]"
                    : "bg-stone-200 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
