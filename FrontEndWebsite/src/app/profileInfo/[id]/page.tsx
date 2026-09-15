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
import { client } from "@/app/api/client";


interface UserProfile {
  id: string;
  nickname: string;
  mannerTemperature: number;
  profileImg: string | null;
  favorite?: string | null;
  hate?: string | null;
  age?: number | string | null;
  mbti?: string | null;
  preferCategory?: string | null;
  preferDistrict?: string | null;
  preferDay?: string | null;
  preferTime?: string | null;
}

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
    queryFn: async () => {
      const { data } = await client.get(`/users/${userId}`);
      return data;
    },
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

  ////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#FBFBF9] max-w-md mx-auto pb-10">
      {/* 헤더 */}
      <header className="px-4 py-3 border-b border-[#E7E5E4] flex items-center gap-3 bg-white sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-stone-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-[#292524]" />
        </button>
        <h1 className="text-lg font-bold text-[#292524]">프로필 정보</h1>
      </header>

      <main className="p-5 space-y-4">
        {/* 기본 프로필 카드 */}
        <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] flex flex-col items-center text-center shadow-xs">
          <div className="w-24 h-24 rounded-3xl bg-stone-100 border-2 border-[#FF7A59] overflow-hidden flex items-center justify-center shadow-xs mb-3">
            {profile.profileImg ? (
              <img
                src={profile.profileImg}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-[#78716C]" />
            )}
          </div>

          <h2 className="text-xl font-black text-[#292524]">
            {profile.nickname}
          </h2>

          {/* 나이 & MBTI 태그 */}
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

          {/* 매너 온도 */}
          <div className="mt-4 bg-[#FBFBF9] px-4 py-2 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
            <Smile className="w-4 h-4 text-[#FF7A59]" />
            <span className="text-xs font-bold text-[#78716C]">매너온도</span>
            <span className="text-sm font-black text-[#FF7A59]">
              {profile.mannerTemperature ?? 36.5}°C
            </span>
          </div>
        </div>

        {/* 선호 정보 (카테고리, 지역, 요일, 시간) */}
        <div className="bg-white p-5 rounded-3xl border border-[#E7E5E4] space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-[#292524] flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-[#FF7A59]" /> 모임 취향 & 선호
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-[#78716C] font-semibold">
                  관심 카테고리
                </p>
                <p className="font-bold text-[#292524] truncate">
                  {profile.preferCategory || "미지정"}
                </p>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-[#78716C] font-semibold">
                  선호 지역
                </p>
                <p className="font-bold text-[#292524] truncate">
                  {profile.preferDistrict || "미지정"}
                </p>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-[#78716C] font-semibold">
                  선호 요일
                </p>
                <p className="font-bold text-[#292524] truncate">
                  {profile.preferDay || "미지정"}
                </p>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-3 rounded-2xl border border-[#E7E5E4] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF7A59] shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-[#78716C] font-semibold">
                  선호 시간대
                </p>
                <p className="font-bold text-[#292524] truncate">
                  {profile.preferTime || "미지정"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 좋아함 / 싫어함 상세 카드 */}
        <div className="bg-white p-5 rounded-3xl border border-[#E7E5E4] space-y-3 shadow-xs">
          {/* 좋아하는 것 */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl shrink-0 mt-0.5">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#78716C]">좋아해요</p>
              <p className="text-sm font-semibold text-[#292524] mt-0.5 leading-relaxed">
                {profile.favorite || "등록된 내용이 없습니다."}
              </p>
            </div>
          </div>

          <hr className="border-[#E7E5E4]" />

          {/* 싫어하는 것 */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-100 text-[#78716C] rounded-xl shrink-0 mt-0.5">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#78716C]">
                싫어해요
              </p>
              <p className="text-sm font-semibold text-[#292524] mt-0.5 leading-relaxed">
                {profile.hate || "등록된 내용이 없습니다."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
