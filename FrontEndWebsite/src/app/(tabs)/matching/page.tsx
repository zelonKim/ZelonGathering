"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react"; // Ionicons 대체
import { client } from "@/api/client";

export default function MatchingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 🔄 1. 백엔드에서 AI 매칭 알림 리스트 실시간 Fetch
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["aiMatchingNotifications"],
    queryFn: async () => {
      const { data } = await client.get("/users/notifications");
      // AI_MATCHING 타입 데이터만 필터링 슛
      return data.filter((item: any) => item.type === "AI_MATCHING");
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  // 🗑️ 2. 특정 알림 삭제(넘기기)를 위한 useMutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await client.delete(`/users/notifications/${notificationId}`);
    },
    onSuccess: () => {
      // 인프라 무효화를 통한 실시간 피드 갱신
      queryClient.invalidateQueries({ queryKey: ["aiMatchingNotifications"] });
    },
    onError: (error) => {
      console.error("알림 삭제 실패:", error);
      alert("알림을 넘기지 못했습니다. 다시 시도해주세요.");
    },
  });

  // 현재 지워지는 중인 아이템 ID 포착 (스피너 분기용)
  const deletingId = deleteNotificationMutation.isPending
    ? deleteNotificationMutation.variables
    : null;

  // 로딩 인프라 뷰
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-[60vh] justify-center items-center bg-[#FBFBF9] gap-3   ">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A59]" />
        <p className="text-sm font-semibold text-[#78716C]">
          AI 매칭 알림을 가져오고 있습니다.
        </p>
      </div>
    );
  }

  // 에러 핸들링 뷰
  if (isError) {
    return (
      <div className="flex flex-col flex-1 h-[60vh] justify-center items-center bg-[#FBFBF9] gap-3">
        <AlertCircle className="w-10 h-10 text-[#78716C]" />
        <p className="text-sm font-semibold text-[#78716C]">
          매칭 데이터를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFBF9] min-h-screen max-w-4xl mx-auto">
      {/* 1. 상단 타이틀 바 */}
      <header className="px-5 pt-4 pb-4 bg-[#FBFBF9]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-[#FF7A59] tracking-tight">
            AI Matching
          </h1>
        </div>
        <p className="text-sm font-bold text-[#292524] mt-1">
          🤖 AI가 찾아낸 취향 저격 소모임
        </p>
      </header>

      {/* 2. 실시간 피드 리스트 스트리밍 구역 */}
      <div className="px-5 pb-10 space-y-4">
        {notifications.map((item: any) => {
          const isCurrentItemDeleting = deletingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-[24px] p-5 border border-[#E7E5E4] shadow-[0_4px_12px_rgba(28,25,23,0.02)] transition-all duration-200"
            >
              {/* 카드 상단: AI 매칭률 & 시간 */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center bg-[#FFEBEB] px-2.5 py-1 rounded-lg gap-1">
                  <Sparkles className="w-3 h-3 text-[#F43F5E] fill-[#F43F5E]" />
                  <span className="text-[11px] text-[#F43F5E] font-extrabold">
                    매칭률 {item.matchRate}%
                  </span>
                </div>
                <span className="text-xs text-[#78716C] font-semibold">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>

              {/* 카드 본문: 타이틀 */}
              <h3 className="text-[17px] font-bold text-[#292524] leading-normal line-clamp-2 mb-2">
                {item.title}
              </h3>

              {/* AI가 추천한 이유 구역 (감성 박스) */}
              <div className="bg-[#F8F6F4] p-3.5 rounded-[14px] mb-4 text-sm leading-relaxed text-[#292524]">
                <span className="text-[#F43F5E] font-extrabold">
                  AI의 한마디:{" "}
                </span>
                {item.message}
              </div>

              {/* 하단 액션 버튼 그룹 */}
              <div className="flex gap-2.5">
                {/* 넘기기 버튼 */}
                <button
                  type="button"
                  onClick={() => deleteNotificationMutation.mutate(item.id)}
                  disabled={deleteNotificationMutation.isPending}
                  className="flex-1 bg-[#F2F0EC] hover:bg-[#e6e4e0] active:scale-[0.99] text-[#78716C] py-3 rounded-[14px] text-sm font-bold flex justify-center items-center transition disabled:opacity-60"
                >
                  {isCurrentItemDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#78716C]" />
                  ) : (
                    "넘기기"
                  )}
                </button>

                {/* 참여하러 가기 버튼 */}
                <button
                  type="button"
                  onClick={() => router.push(`/gatherings/${item.linkId}`)}
                  disabled={deleteNotificationMutation.isPending}
                  className="flex-[2] bg-[#FF7A59] hover:bg-[#e06848] active:scale-[0.99] text-white py-3 rounded-[14px] text-sm font-extrabold flex justify-center items-center transition shadow-[0_2px_6px_rgba(255,122,89,0.1)]"
                >
                  참여하러 가기
                </button>
              </div>
            </div>
          );
        })}

        {/* 데이터가 비었을 때 처리 */}
        {notifications.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-[#78716C] font-bold">
              아직 들어온 매칭 알림이 없습니다. 🍑
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
