"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Trash2,
  LogOut,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { GATHERING_CATEGORY_COLOR } from "@/constants/gatheringCategoryColor";
import { DAY_MAPS } from "@/constants/dayMaps";
import { TIME_MAPS } from "@/constants/timeMaps";
import { getGatheringDetail } from "@/app/api/gathering/getGatheringDetail";
import { getMyProfile } from "@/app/api/profile/getMyProfile";
import { GatheringParticipant } from "@/types/GatheringDetail";
import { getGatheringChats } from "@/app/api/chat/getGatheringChats";
import { useSendChatMessage } from "@/hooks/useSendChatMessage";
import { useJoinGathering } from "@/hooks/useJoinGathering";
import { useLeaveGathering } from "@/hooks/useLeaveGathering";
import { useDeleteGathering } from "@/hooks/useDeleteGathering";
import { useKickParticipant } from "@/hooks/useKickParticipant";
import { GatheringInfoTab } from "@/components/GatheringInfoTab";
import { GatheringChatTab } from "@/components/GatheringChatTab";

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

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ["gatheringDetail", id] });
      queryClient.resetQueries({ queryKey: ["gatheringChats", id] });
    };
  }, [id, queryClient]);

  //////////////////////////////////////////////////////////////////////////

  const {
    data: gathering,
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery({
    queryKey: ["gatheringDetail", id],
    queryFn: () => getGatheringDetail(id),
    enabled: !!id,
    refetchInterval: 3000,
  });

  //////////////////////////////////////////////////////////////////////////

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const myId = userProfile?.id;

  const myParticipation = gathering?.participants?.find(
    (p: GatheringParticipant) => p.user?.id === myId || p.userId === myId,
  );

  const isKicked = myParticipation?.status === "REJECTED";

  const isAlreadyParticipant =
    !!myId && !!myParticipation && myParticipation.status !== "REJECTED";

  const isHost = !!myId && gathering?.host?.id === myId;

  const canAccessChat = (isHost || isAlreadyParticipant) && !isKicked;

  //////////////////////////////////////////////////////////////////////////

  const { data: chatMessages = [] } = useQuery({
    queryKey: ["gatheringChats", id],
    queryFn: () => getGatheringChats(id),
    refetchInterval: 3000,
  });

  //////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (tabParam === "CHAT" && canAccessChat) {
      setActiveTab("CHAT");
    } else {
      setActiveTab("INFO");
    }
  }, [tabParam, canAccessChat]);

  useEffect(() => {
    if (activeTab === "CHAT") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  //////////////////////////////////////////////////////////////////////////

  const {
    mutate: sendChatMessageMutation,
    isPending: isChatMessageSendPending,
  } = useSendChatMessage(id);

  const handleSendMessage = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key === "Enter") {
      e.preventDefault();
    }

    if (!chatInput.trim() || isChatMessageSendPending) return;

    sendChatMessageMutation(chatInput.trim(), {
      onSuccess: () => {
        setChatInput("");
      },
    });
  };

  //////////////////////////////////////////////////////////////////////////

  const { mutate: joinGatheringMutation, isPending: isJoinGatheringPending } =
    useJoinGathering(id);

  const handleJoinPress = () => {
    if (confirm("정말로 이 소모임에 참여하시겠습니까?")) {
      joinGatheringMutation();
    }
  };

  //////////////////////////////////////////////////////////////////////////

  const { mutate: leaveGatheringMutation } = useLeaveGathering(id);

  const { mutate: deleteGatheringMutation } = useDeleteGathering(id);

  const handleOutAction = () => {
    if (isHost) {
      if (
        confirm(
          "정말로 이 소모임을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구는 불가능합니다.",
        )
      ) {
        deleteGatheringMutation();
      }
    } else {
      if (confirm("정말로 소모임 참여를 취소하고 나가시겠습니까?")) {
        leaveGatheringMutation();
      }
    }
  };

  //////////////////////////////////////////////////////////////////////////

  const { mutate: kickParticipantMutation } = useKickParticipant(id);

  const handleKickPress = (targetUserId: string, nickname: string) => {
    if (confirm(`정말로 '${nickname}' 멤버를 강퇴 하시겠습니까?`)) {
      kickParticipantMutation(targetUserId);
    }
  };
  //////////////////////////////////////////////////////////////////////////

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
          존재하지 않거나 이미 폐쇄된 소모임방입니다.
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

  const cateTheme = GATHERING_CATEGORY_COLOR[gathering.category?.toUpperCase()];

  const activeParticipants =
    gathering.participants?.filter(
      (p: GatheringParticipant) => p.status !== "REJECTED",
    ) || [];

  //////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen text-[#292524] flex flex-col max-w-5xl mx-auto bg-white border-x border-[#E7E5E4] relative">
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
            onClick={handleOutAction}
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

      <div className="flex bg-white border-b border-[#E7E5E4] shrink-0">
        <button
          onClick={() => setActiveTab("INFO")}
          className={`flex-1 py-3 text-center text-[15px] font-bold transition-all border-b-[3px] ${
            activeTab === "INFO"
              ? "border-[#FF7A59] text-[#FF7A59] font-black"
              : "border-transparent text-[#78716C]"
          }`}
        >
          모임 정보
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

      <div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col">
        {activeTab === "INFO" && (
          <GatheringInfoTab
            gathering={gathering}
            activeParticipants={activeParticipants}
            cateTheme={cateTheme}
            isHost={isHost}
            isKicked={isKicked}
            isAlreadyParticipant={isAlreadyParticipant}
            isJoinGatheringPending={isJoinGatheringPending}
            myId={myId}
            handleJoinPress={handleJoinPress}
            handleKickPress={handleKickPress}
            DAY_MAPS={DAY_MAPS}
            TIME_MAPS={TIME_MAPS}
          />
        )}

        {activeTab === "CHAT" && canAccessChat && (
          <GatheringChatTab
            chatMessages={chatMessages}
            myId={myId}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendMessage={handleSendMessage}
            isChatMessageSendPending={isChatMessageSendPending}
            chatEndRef={chatEndRef}
          />
        )}
      </div>
    </div>
  );
}
