"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Camera,
  Thermometer,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { removeAccessToken } from "@/app/api/token";
import { DISTRICT_ITEMS } from "@/constants/districtItems";
import { TIME_ITEMS } from "@/constants/timeItems";
import { CATEGORY_ITEMS } from "@/constants/categoryItems";
import { DAY_ITEMS } from "@/constants/dayItems";
import { UpdateProfilePayload } from "@/types/UpdateProfilePayload";
import { getMyProfile } from "@/app/api/profile/getMyProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { Mbti } from "@/types/MBTI";
import { Category } from "@/types/Category";
import { District } from "@/types/District";
import { Day } from "@/types/Day";
import { Time } from "@/types/Time";
import { useUploadProfileImage } from "@/hooks/useUploadImage";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [mbti, setMbti] = useState<Mbti | string>("");
  const [favorite, setFavorite] = useState("");
  const [hate, setHate] = useState("");
  const [preferCategory, setPreferCategory] = useState<Category[] | string[]>(
    [],
  );
  const [preferDistrict, setPreferDistrict] = useState<District[] | string[]>(
    [],
  );
  const [preferDay, setPreferDay] = useState<Day[] | string[]>([]);
  const [preferTime, setPreferTime] = useState<Time[] | string[]>([]);
  const [profileImg, setProfileImg] = useState<string>("");
  const [activeCity, setActiveCity] = useState<"SEOUL" | "GYEONGGI" | "OTHER">(
    "SEOUL",
  );
  const [activeTimeType, setActiveTimeType] = useState<"AM" | "PM">("PM");

  const {
    data: profileData,
    isLoading: isGetProfileLoading,
    isError: isGetProfileError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  useEffect(() => {
    if (profileData) {
      setNickname(profileData.nickname || "");
      setAge(profileData.age ? String(profileData.age) : "");
      setMbti(profileData.mbti || "");
      setFavorite(profileData.favorite || "");
      setHate(profileData.hate || "");
      setPreferCategory(profileData.preferCategory || []);
      setPreferDistrict(profileData.preferDistrict || []);
      setPreferDay(profileData.preferDay || []);
      setPreferTime(profileData.preferTime || []);
      if (profileData.profileImg) {
        setProfileImg(`${profileData.profileImg}?t=${new Date().getTime()}`);
      } else {
        setProfileImg("");
      }
    }
  }, [profileData]);

  ////////////////////////////////////////////////////////////////////////

  const { mutate: updateProfileMutation, isPending: isUpdateProfilePending } =
    useUpdateProfile();

  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    const cleanProfileImg = profileImg ? profileImg.split("?")[0] : undefined;

    const payload: UpdateProfilePayload = {
      nickname: nickname.trim(),
      favorite: favorite.trim() || null,
      hate: hate.trim() || null,
      age: age ? Number(age) : null,
      mbti: mbti.trim() ? (mbti.trim().toUpperCase() as Mbti) : null,
      preferCategory: preferCategory.length > 0 ? preferCategory : [],
      preferDistrict: preferDistrict.length > 0 ? preferDistrict : [],
      preferDay: preferDay.length > 0 ? preferDay : [],
      preferTime: preferTime.length > 0 ? preferTime : [],
      profileImg: cleanProfileImg || null,
    };
    updateProfileMutation(payload);
  };

  ////////////////////////////////////////////////////////////////////////

  const { mutate: uploadImageMutation, isPending: isUploadImagePending } =
    useUploadProfileImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하이어야 합니다.");
      return;
    }

    uploadImageMutation(file, {
      onSuccess: (imageUrl) => {
        const imageUrlWithCacheBust = `${imageUrl}?t=${Date.now()}`;
        setProfileImg(imageUrlWithCacheBust);
      },
    });
  };

  ////////////////////////////////////////////////////////////////////////

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  ////////////////////////////////////////////////////////////////////////

  const handleLogoutClick = async () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      try {
        await removeAccessToken();
        queryClient.clear();
        router.replace("/login");
      } catch (err) {
        console.log(err);
        alert("로그아웃 처리 중 오류가 발생했습니다.");
      }
    }
  };

  ///////////////////////////////////////////////////////////////////////

  if (isGetProfileLoading) {
    return (
      <div className="flex flex-col flex-1 h-[70vh] justify-center items-center bg-[#FBFBF9] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A59]" />
      </div>
    );
  }

  if (isGetProfileError) {
    return (
      <div className="flex flex-col flex-1 h-[70vh] justify-center items-center bg-[#FBFBF9] gap-2 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-stone-400" />
        <p className="text-sm font-semibold text-[#78716C]">
          프로필을 불러오지 못했습니다. 다시 시도해 주세요.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 text-xs text-[#FF7A59] font-bold underline"
        >
          로그인 화면으로 이동
        </button>
      </div>
    );
  }

  const filteredDistricts = DISTRICT_ITEMS.filter(
    (item) => item.city === activeCity,
  );

  const filteredTimes = TIME_ITEMS.filter(
    (item) => item.type === activeTimeType,
  );

  ////////////////////////////////////////////////////////////////////////

  return (
    <div className=" min-h-screen px-4 pb-12 max-w-4xl mx-auto ">
      <header className="py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#FF7A59] tracking-tight">
            My Profile
          </h1>
          <p className="text-lg font-bold text-[#292524] mt-0.5">
            ✏️ 나의 소모임 취향 프로필
          </p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-1 text-xs font-bold text-[#78716C] bg-[#F2F0EC] hover:bg-red-50 hover:text-red-500 px-3 py-2 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>로그아웃</span>
        </button>
      </header>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-[#E7E5E4] flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-[28px] bg-[#FFEBE5] overflow-hidden flex items-center justify-center group"
            >
              {isUploadImagePending ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#FF7A59]" />
              ) : profileImg ? (
                <img
                  src={profileImg}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🍑</span>
              )}

              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>

            {!profileImg && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className=" absolute -bottom-1 -right-1 bg-[#292524] hover:bg-black text-white w-6 h-6 rounded-xl flex items-center justify-center shadow-md transition-colors"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}

            {profileImg && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-gray-500 hover:bg-gray-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center bg-orange-50 text-orange-500 px-3 py-1 rounded-full gap-1 text-xs font-bold">
            <Thermometer className="w-3.5 h-3.5" />
            <span>매너 온도 {profileData?.mannerTemperature ?? 36.5}°C</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-3.5">
          <h2 className="text-md font-extrabold text-[#292524]">기본 정보</h2>

          <div className="ml-1 flex items-center border-b border-stone-100 pb-2.5">
            <span className="w-24 text-sm font-bold text-[#78716C]">
              닉네임
            </span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="flex-1 text-sm font-semibold text-[#292524] outline-none placeholder:text-stone-300"
            />
          </div>

          <div className="ml-1 flex items-center border-b border-stone-100 pb-2.5">
            <span className="w-24 text-sm font-bold text-[#78716C]">나이</span>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="나이를 입력하세요"
              maxLength={2}
              className="flex-1 text-sm font-semibold text-[#292524] outline-none placeholder:text-stone-300"
            />
          </div>

          <div className="ml-1 flex items-center border-b border-stone-100 pb-2.5">
            <span className="w-24 text-sm font-bold text-[#78716C]">MBTI</span>
            <input
              type="text"
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              placeholder="MBTI를 입력하세요"
              maxLength={4}
              className="flex-1 text-sm font-semibold text-[#292524] outline-none uppercase placeholder:text-stone-300"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-4">
          <h2 className="text-md font-extrabold text-[#292524]">
            나의 취향 키워드
          </h2>

          <div className="space-y-1.5">
            <span className="ml-1 text-sm font-bold text-[#78716C] block">
              내가 좋아하는 것
            </span>
            <textarea
              value={favorite}
              onChange={(e) => setFavorite(e.target.value)}
              placeholder="자신이 좋아하는 것을 입력하세요."
              rows={2}
              className="w-full bg-[#F8F6F4] rounded-xl p-3 text-sm font-medium text-[#292524] outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="ml-1 text-sm font-bold text-[#78716C] block">
              내가 싫어하는 것
            </span>
            <textarea
              value={hate}
              onChange={(e) => setHate(e.target.value)}
              placeholder="자신이 싫어하는 것을 입력하세요."
              rows={2}
              className="w-full bg-[#F8F6F4] rounded-xl p-3 text-sm font-medium text-[#292524] outline-none resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-4">
          <h2 className="text-md font-extrabold text-[#292524]">
            나의 선호 모임 및 지역
          </h2>

          <div>
            <span className="text-sm font-bold text-[#78716C] block mb-2">
              관심 카테고리
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ITEMS.map((cat) => {
                const isSelected = preferCategory.includes(cat.key as Category);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setPreferCategory(
                        isSelected
                          ? preferCategory.filter((c) => c !== cat.key)
                          : [...preferCategory, cat.key],
                      )
                    }
                    className={`text-[13px] px-3 py-1.5 rounded-xl font-semibold transition ${
                      isSelected
                        ? "bg-[#FF7A59] text-white"
                        : "bg-[#F2F0EC] text-[#78716C]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[15px] font-bold text-[#78716C] block mb-2">
              활동 선호 지역
            </span>

            <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3">
              {(["SEOUL", "GYEONGGI", "OTHER"] as const).map((city) => {
                const label =
                  city === "SEOUL"
                    ? "서울"
                    : city === "GYEONGGI"
                      ? "경기"
                      : "기타 지역";
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setActiveCity(city)}
                    className={`flex-1 text-[13.5px] py-2 text-center rounded-lg font-bold transition ${
                      activeCity === city
                        ? "bg-white text-[#FF7A59] shadow-sm"
                        : "text-[#78716C]"
                    }`}
                  >
                    📍 {label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-dashed border-stone-100 rounded-xl">
              {filteredDistricts.map((item) => {
                const isDistSelected = preferDistrict.includes(
                  item.key as District,
                );
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setPreferDistrict(
                        isDistSelected
                          ? preferDistrict.filter((d) => d !== item.key)
                          : [...preferDistrict, item.key],
                      )
                    }
                    className={`text-[13px] px-3 py-1.5 rounded-xl font-semibold border transition ${
                      isDistSelected
                        ? "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59] font-bold"
                        : "bg-[#F2F0EC] border-transparent text-[#78716C]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-5">
          <h2 className="text-md font-extrabold text-[#292524]">
            나의 선호 일정
          </h2>

          <div>
            <span className="text-[13.5px] font-bold text-[#78716C] block mb-2">
              선호 요일
            </span>
            <div className="flex justify-between mx-2 gap-1">
              {DAY_ITEMS.map((day) => {
                const isSelected = preferDay.includes(day.key as Day);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() =>
                      setPreferDay(
                        isSelected
                          ? preferDay.filter((d) => d !== day.key)
                          : [...preferDay, day.key],
                      )
                    }
                    className={` w-9 h-9 rounded-full text-[14px] font-bold transition flex items-center justify-center ${
                      isSelected
                        ? "bg-[#FF7A59] text-white"
                        : "bg-[#F2F0EC] text-[#78716C]"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-sm font-bold text-[#78716C] block mb-2">
              선호 시간대
            </span>
            <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3">
              {(["AM", "PM"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveTimeType(type)}
                  className={`flex-1 text-[13.5px] py-1.5 text-center rounded-lg font-bold transition ${
                    activeTimeType === type
                      ? "bg-white text-[#FF7A59]"
                      : "text-[#78716C]"
                  }`}
                >
                  {type === "AM" ? "오전 (AM)" : "오후 (PM)"}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredTimes.map((time) => {
                const isSelected = preferTime.includes(time.key as Time);
                return (
                  <button
                    key={time.key}
                    type="button"
                    onClick={() =>
                      setPreferTime(
                        isSelected
                          ? preferTime.filter((t) => t !== time.key)
                          : [...preferTime, time.key],
                      )
                    }
                    className={`text-[13px] px-3 py-1.5 rounded-xl font-semibold transition ${
                      isSelected
                        ? "bg-[#FF7A59] text-white font-bold"
                        : "bg-[#F2F0EC] text-[#78716C]"
                    }`}
                  >
                    {time.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isUpdateProfilePending || isUploadImagePending}
          className="mt-9 w-full bg-[#292524] hover:bg-black active:scale-[0.99] text-white py-4 rounded-xl text-sm font-bold flex justify-center items-center transition disabled:opacity-70 shadow-md"
        >
          {isUpdateProfilePending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "프로필 저장하기"
          )}
        </button>
      </div>
    </div>
  );
}
