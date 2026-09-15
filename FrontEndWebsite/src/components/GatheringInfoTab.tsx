import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Thermometer,
  Ban,
  CheckCircle,
  Loader2,
  UserX,
  MessageCircle,
  User,
} from "lucide-react";
import { GatheringParticipant } from "@/types/GatheringDetail";
import { Day } from "@/types/Day";
import { Time } from "@/types/Time";
import { GatheringInfoTabProps } from "@/types/GatheringInfoTabProps";
import { useOpenPrivateChatRoom } from "@/hooks/useOpenPrivateChatRoom";
import { useRouter } from "next/navigation";

export function GatheringInfoTab({
  gathering,
  activeParticipants,
  cateTheme,
  isHost,
  isKicked,
  isAlreadyParticipant,
  isJoinGatheringPending,
  myId,
  handleJoinPress,
  handleKickPress,
  DAY_MAPS,
  TIME_MAPS,
}: GatheringInfoTabProps) {
  const router = useRouter();

  const [activeMenuParticipantId, setActiveMenuParticipantId] = useState<
    string | null
  >(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuParticipantId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { mutate: openDmMutation, isPending: isOpenDmPending } =
    useOpenPrivateChatRoom();

  return (
    <div className="p-5 space-y-6 flex-1 pb-16">
      <div className="bg-white shadow-xs border border-[#E7E5E4] rounded-3xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div className="flex justify-between items-center">
          <span
            style={{ backgroundColor: cateTheme.bg, color: cateTheme.text }}
            className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
          >
            {cateTheme.label} {cateTheme.emoji}
          </span>

          {isHost ? (
            <span className="text-[12px] font-bold text-[#78716C] bg-stone-100 border border-stone-200 px-3 py-1 rounded-lg">
              내가 만든 모임
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
              disabled={isJoinGatheringPending}
              className="bg-[#FF7A59] text-white text-xs font-extrabold px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#e06848] transition"
            >
              {isJoinGatheringPending ? (
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
              {DAY_MAPS[gathering.gatheringDay as Day] ||
                gathering.gatheringDay}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF7A59]" />
            <span>
              {TIME_MAPS[gathering.gatheringTime as Time] ||
                gathering.gatheringTime}
            </span>
          </div>
        </div>

        <div className="h-px bg-stone-100 my-4" />
        <p className="text-[15px] font-black text-[#292524] mb-1">모임 소개</p>
        <p className="text-[14px] font-medium text-stone-600 leading-relaxed whitespace-pre-wrap">
          {gathering.description || "등록된 소개글이 없습니다."}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-[15px] font-black text-[#292524] pl-1">
          참여 중인 멤버 ({activeParticipants.length}명)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeParticipants.map((p: GatheringParticipant, idx: number) => {
            const participantUserId = p.user?.id || p.userId;
            const isMe = participantUserId === myId;
            const isParticipantHost = participantUserId === gathering.host.id;
            const isMenuOpen = activeMenuParticipantId === participantUserId;

            return (
              <div
                key={participantUserId || idx}
                className="bg-white shadow-xs border border-[#E7E5E4] rounded-2xl p-3.5 flex items-center justify-between transition relative"
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => {
                      if (!isMe) {
                        setActiveMenuParticipantId(
                          isMenuOpen ? null : participantUserId,
                        );
                      }
                    }}
                    className={`w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center font-bold overflow-hidden relative ${
                      !isMe ? "cursor-pointer hover:opacity-80 transition" : ""
                    }`}
                  >
                    {p.user?.profileImg ? (
                      <img
                        src={p.user.profileImg}
                        alt="Member"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "🍑"
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[15px] font-bold text-[#292524]">
                        {p.user?.nickname || "참여자"}
                      </p>
                      {isParticipantHost && (
                        <span className="bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20 text-[10px] font-black px-2 py-0.5 rounded-full">
                          👑 방장
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-[#FF7A59] mt-0.5 flex flex-row">
                      <Thermometer className="w-3.5 h-3.5 mt-0.5 -ml-1" /> 매너
                      온도 {p.user?.mannerTemperature ?? 36.5}°C
                    </p>
                  </div>
                </div>


                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute left-14 top-2 z-20 bg-white border border-stone-200 shadow-xl rounded-2xl p-1.5 flex flex-col gap-1 min-w-[120px] animate-fadeIn"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuParticipantId(null);
                        router.push(`/profileInfo/${participantUserId}`);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl transition w-full text-left"
                    >
                      <User size={14} className="text-stone-500" />
                      프로필 보기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuParticipantId(null);
                        openDmMutation(participantUserId);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#FF7A59] hover:bg-orange-50 rounded-xl transition w-full text-left"
                    >
                      <MessageCircle size={14} className="text-[#FF7A59]" />
                      DM 보내기
                    </button>
                  </div>
                )}

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
  );
}
