"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  User,
  Heart,
  ThumbsDown,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Tag,
  Smile,
} from "lucide-react";

import { CATEGORY_ITEMS } from "@/constants/categoryItems";
import { DISTRICT_ITEMS } from "@/constants/districtItems";
import { DAY_ITEMS } from "@/constants/dayItems";
import { TIME_ITEMS } from "@/constants/timeItems";
import { UserProfile } from "@/types/UserProfile";
import { formatLabels } from "@/utils/formatLabels";
import { getUserProfile } from "@/app/api/profile/getUserProfile";

export default function ProfileInfoPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBFBF9]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A59]" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#FBFBF9] text-[#78716C] font-semibold gap-3">
        <p>프로필 정보를 불러올 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#E7E5E4] text-[#292524] rounded-xl text-sm font-bold hover:bg-stone-300 transition"
        >
          돌아가기
        </button>
      </div>
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#FBFBF9] max-w-2xl mx-auto pb-10">
      <header className="px-4 py-3 border-b border-[#E7E5E4] grid grid-cols-3 items-center bg-white sticky top-0 z-10">
        <div className="flex justify-start">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-stone-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-[#292524]" />
          </button>
        </div>

        <h1 className="text-lg font-bold text-[#292524] text-center">
          프로필 정보
        </h1>

        <div className="flex justify-end" />
      </header>

      <main className="p-5 space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] flex flex-col items-center text-center shadow-xs">
          <div className="w-24 h-24 rounded-3xl bg-stone-100 border border-orange-400 overflow-hidden flex items-center justify-center shadow-xs mb-3">
            {profile.profileImg ? (
              <img
                src={profile.profileImg}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl">🍑</div>
            )}
          </div>

          <h2 className="text-xl font-black text-[#292524]">
            {profile.nickname}
          </h2>

          <div className="flex gap-2 mt-2">
            {profile.age && (
              <span className="px-2.5 py-0.5 bg-stone-100 text-[#78716C] text-xs font-bold rounded-full">
                {profile.age}세
              </span>
            )}
            {profile.mbti && (
              <span className="px-2.5 py-0.5 bg-orange-100 text-[#FF7A59] text-xs font-bold rounded-full">
                {profile.mbti.toUpperCase()}
              </span>
            )}
          </div>

          <div className="mt-4 bg-[#FBFBF9] px-4 py-2 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
            <Smile className="w-4 h-4 text-[#FF7A59]" />
            <span className="text-xs font-bold text-[#78716C]">매너온도</span>
            <span className="text-sm font-black text-[#FF7A59]">
              {profile.mannerTemperature ?? 36.5}°C
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E7E5E4] space-y-3 shadow-xs">
          <h3 className="text-[15px] font-bold text-[#292524] flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-[#FF7A59]" /> 모임 취향 & 선호
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#78716C] font-semibold">
                  관심 카테고리
                </p>
                <p
                  className="font-bold text-[#292524] text-[13px] leading-relaxed break-words"
                  title={formatLabels(profile.preferCategory, CATEGORY_ITEMS)}
                >
                  {formatLabels(profile.preferCategory, CATEGORY_ITEMS)}
                </p>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#78716C] font-semibold">
                  선호 지역
                </p>
                <p
                  className="font-bold text-[#292524]  text-[13px] leading-relaxed break-words"
                  title={formatLabels(profile.preferDistrict, DISTRICT_ITEMS)}
                >
                  {formatLabels(profile.preferDistrict, DISTRICT_ITEMS)}
                </p>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#78716C] font-semibold">
                  선호 요일
                </p>
                <p
                  className="font-bold text-[#292524] text-[13px]  leading-relaxed break-words"
                  title={formatLabels(profile.preferDay, DAY_ITEMS)}
                >
                  {formatLabels(profile.preferDay, DAY_ITEMS)}
                </p>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#FF7A59] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#78716C] font-semibold">
                  선호 시간대
                </p>

                <p className="font-bold text-[#292524] text-[13px] leading-relaxed break-words">
                  {formatLabels(profile.preferTime, TIME_ITEMS)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E7E5E4] space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl shrink-0 mt-0.5">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#78716C]">좋아해요</p>
              <p className="text-[13px] font-semibold text-[#292524] mt-0.5 leading-relaxed">
                {profile.favorite || "등록된 내용이 없습니다."}
              </p>
            </div>
          </div>

          <hr className="border-[#E7E5E4]" />

          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-100 text-[#78716C] rounded-xl shrink-0 mt-0.5">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#78716C]">싫어해요</p>
              <p className="text-[13px] font-semibold text-[#292524] mt-0.5 leading-relaxed">
                {profile.hate || "등록된 내용이 없습니다."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
