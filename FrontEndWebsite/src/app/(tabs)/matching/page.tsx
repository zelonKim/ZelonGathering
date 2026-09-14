"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { getMyNotifications } from "@/app/api/notification/getMyNotifications";
import { useDeleteNotification } from "@/hooks/useDeleteNotification";
import { NotificationItem } from "@/types/NotificationItem";

export default function MatchingPage() {
  const router = useRouter();

  const {
    mutate: deleteNotiMutation,
    isPending: isDeleteNotiPending,
    variables: deleteNotiId,
  } = useDeleteNotification();

  const deletingId = isDeleteNotiPending ? deleteNotiId : null;

  /////////////////////////////////////////////////////

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery<NotificationItem[]>({
    queryKey: ["myNotifications"],
    queryFn: getMyNotifications,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-[60vh] justify-center items-center bg-[#FBFBF9] gap-3   ">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A59]" />
      </div>
    );
  }

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

  //////////////////////////////////////////////////////////////////

  return (
    <div className="bg-[#FBFBF9] min-h-screen max-w-5xl mx-auto">
      <header className="px-5 pt-4 pb-4 bg-[#FBFBF9]">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black text-[#FF7A59] tracking-tight">
            AI Matching
          </h1>
        </div>
        <p className="text-lg font-bold text-[#292524] mt-1">
          🤖 AI가 찾아낸 취향 저격 소모임
        </p>
      </header>

      <div className="px-5 pb-10 grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {notifications.map((item: NotificationItem) => {
          const isCurrentItemDeleting = deletingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-[24px] p-5 border border-[#E7E5E4]  transition-all duration-200 shadow-xs"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center bg-[#FFEBEB] px-2.5 py-1 rounded-lg gap-1">
                  <Sparkles className="w-3 h-3 text-[#F43F5E] fill-[#F43F5E]" />
                  <span className="text-[12px] text-[#F43F5E] font-extrabold">
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

              <h3 className="text-[17px] font-bold text-[#292524] leading-normal line-clamp-2 mb-2">
                {item.title}
              </h3>

              <div className="bg-[#F8F6F4] p-3.5 rounded-[14px] mb-4 text-sm leading-relaxed text-[#292524]">
                <span className="text-[#F43F5E] font-extrabold">
                  AI의 한마디:{" "}
                </span>
                {item.message}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => deleteNotiMutation(item.id)}
                  disabled={isDeleteNotiPending}
                  className="flex-1 bg-[#F2F0EC] hover:bg-[#e6e4e0] active:scale-[0.99] text-[#78716C] py-3 rounded-[14px] text-sm font-bold flex justify-center items-center transition disabled:opacity-60"
                >
                  {isCurrentItemDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#78716C]" />
                  ) : (
                    "넘기기"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/gatherings/${item.linkId}`)}
                  disabled={isDeleteNotiPending}
                  className="flex-[2] bg-[#FF7A59] hover:bg-[#e06848] active:scale-[0.99] text-white py-3 rounded-[14px] text-sm font-extrabold flex justify-center items-center transition shadow-[0_2px_6px_rgba(255,122,89,0.1)]"
                >
                  참여하러 가기
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-36 gap-2 flex flex-col items-center justify-center">
          <p className="text-[15px] text-[#78716C] font-bold">
            아직 들어온 매칭 알림이 없습니다!
          </p>
          <p className="text-[15px] text-[#78716C] font-bold mt-2">
            매칭 알림을 받고 싶다면, 소모임 취향 프로필을 작성해주세요 ✏️
          </p>
        </div>
      )}
    </div>
  );
}
