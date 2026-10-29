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
import { useProfilePageLanguage } from "@/hooks/languages/useProfilePageLanguage";
import { useCreateGatheringSelectorLanguage } from "@/hooks/languages/useCreateGatheringSelectorLanguage";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useProfilePageLanguage();
  const { t: selectorT } = useCreateGatheringSelectorLanguage();

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

  const { mutate: updateProfileMutation, isPending: isUpdateProfilePending } =
    useUpdateProfile();

  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      alert(t.alertNickname);
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

  const { mutate: uploadImageMutation, isPending: isUploadImagePending } =
    useUploadProfileImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t.fileSizeError);
      return;
    }

    uploadImageMutation(file, {
      onSuccess: (imageUrl) => {
        const imageUrlWithCacheBust = `${imageUrl}?t=${Date.now()}`;
        setProfileImg(imageUrlWithCacheBust);
      },
    });
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoutClick = async () => {
    if (confirm(t.logoutConfirm)) {
      // 👈 다국어 적용
      try {
        await removeAccessToken();
        queryClient.clear();
        router.replace("/login");
      } catch (err) {
        console.log(err);
        alert(t.logoutError);
      }
    }
  };

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
        <p className="text-sm font-semibold text-[#78716C]">{t.errorTitle}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 text-xs text-[#FF7A59] font-bold underline cursor-pointer"
        >
          {t.loginMove}
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

  return (
    <div className="min-h-screen px-4 pb-12 max-w-4xl mx-auto">
      <header className="py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#FF7A59] tracking-tight">
            My Profile
          </h1>
          <p className="text-lg font-bold text-[#292524] mt-0.5">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="cursor-pointer flex items-center gap-1 text-xs font-bold text-[#78716C] bg-[#F2F0EC] hover:bg-red-50 hover:text-red-500 px-3 py-2 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logoutButton}</span>
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
              className="cursor-pointer relative w-24 h-24 rounded-[28px] bg-[#FFEBE5] overflow-hidden flex items-center justify-center group"
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
                className="cursor-pointer absolute -bottom-1 -right-1 bg-[#292524] hover:bg-black text-white w-6 h-6 rounded-xl flex items-center justify-center shadow-md transition-colors"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}

            {profileImg && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="cursor-pointer absolute -top-1 -right-1 bg-gray-500 hover:bg-gray-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center bg-orange-50 text-orange-500 px-3 py-1 rounded-full gap-1 text-xs font-bold">
            <Thermometer className="w-3.5 h-3.5" />
            <span>
              {t.mannerTemp} {profileData?.mannerTemperature ?? 36.5}°C
            </span>{" "}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-3.5">
          <h2 className="text-md font-extrabold text-[#292524]">
            {t.basicInfo}
          </h2>{" "}
          <div className="ml-1 flex items-center border-b border-stone-100 pb-2.5">
            <span className="w-24 text-sm font-bold text-[#78716C]">
              {t.nicknameLabel}
            </span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.nicknamePlaceholder}
              className="flex-1 text-sm font-semibold text-[#292524] outline-none placeholder:text-stone-300"
            />
          </div>
          <div className="ml-1 flex items-center border-b border-stone-100 pb-2.5">
            <span className="w-24 text-sm font-bold text-[#78716C]">
              {t.ageLabel}
            </span>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={t.agePlaceholder}
              maxLength={2}
              className="flex-1 text-sm font-semibold text-[#292524] outline-none placeholder:text-stone-300"
            />
          </div>
          <div className="ml-1 flex items-center border-b border-stone-100 pb-2.5">
            <span className="w-24 text-sm font-bold text-[#78716C]">
              {t.mbtiLabel}
            </span>
            <input
              type="text"
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              placeholder={t.mbtiPlaceholder}
              maxLength={4}
              className="flex-1 text-sm font-semibold text-[#292524] outline-none uppercase placeholder:text-stone-300"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-4">
          <h2 className="text-md font-extrabold text-[#292524]">
            {t.tasteKeyword}
          </h2>

          <div className="space-y-1.5">
            <span className="ml-1 text-sm font-bold text-[#78716C] block">
              {t.favoriteLabel}
            </span>
            <textarea
              value={favorite}
              onChange={(e) => setFavorite(e.target.value)}
              placeholder={t.favoritePlaceholder}
              rows={2}
              className="w-full bg-[#F8F6F4] rounded-xl p-3 text-sm font-medium text-[#292524] outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="ml-1 text-sm font-bold text-[#78716C] block">
              {t.hateLabel}
            </span>
            <textarea
              value={hate}
              onChange={(e) => setHate(e.target.value)}
              placeholder={t.hatePlaceholder}
              rows={2}
              className="w-full bg-[#F8F6F4] rounded-xl p-3 text-sm font-medium text-[#292524] outline-none resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-4">
          <h2 className="text-md font-extrabold text-[#292524]">
            {t.preferGatheringAndRegion}
          </h2>

          <div>
            <span className="text-sm font-bold text-[#78716C] block mb-2">
              {t.categoryLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ITEMS.map((cat) => {
                const isSelected = preferCategory.includes(cat.key as Category);
                // 셀렉터 훅에 정의된 카테고리 라벨 활용
                const displayCategoryLabel =
                  selectorT.categories?.[
                    cat.key as keyof typeof selectorT.categories
                  ] || cat.label;

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
                    className={`cursor-pointer text-[13px] px-3 py-1.5 rounded-xl font-semibold transition ${
                      isSelected
                        ? "bg-[#FF7A59] text-white"
                        : "bg-[#F2F0EC] text-[#78716C]"
                    }`}
                  >
                    {displayCategoryLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[15px] font-bold text-[#78716C] block mb-2">
              {t.regionLabel}
            </span>

            <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3">
              {(["SEOUL", "GYEONGGI", "OTHER"] as const).map((city) => {
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setActiveCity(city)}
                    className={`cursor-pointer flex-1 text-[13.5px] py-2 text-center rounded-lg font-bold transition ${
                      activeCity === city
                        ? "bg-white text-[#FF7A59] shadow-sm"
                        : "text-[#78716C]"
                    }`}
                  >
                    📍 {t.cityTabs[city]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-dashed border-stone-100 rounded-xl">
              {filteredDistricts.map((item) => {
                const isDistSelected = preferDistrict.includes(
                  item.key as District,
                );
                // 셀렉터 훅에 정의된 지역 라벨 활용
                const displayDistrictLabel =
                  selectorT.districts?.[
                    item.key as keyof typeof selectorT.districts
                  ] || item.label;

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
                    className={`cursor-pointer text-[13px] px-3 py-1.5 rounded-xl font-semibold border transition ${
                      isDistSelected
                        ? "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59] font-bold"
                        : "bg-[#F2F0EC] border-transparent text-[#78716C]"
                    }`}
                  >
                    {displayDistrictLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E7E5E4] space-y-5">
          <h2 className="text-md font-extrabold text-[#292524]">
            {t.preferSchedule}
          </h2>

          <div>
            <span className="text-[13.5px] font-bold text-[#78716C] block mb-2">
              {t.dayLabel}
            </span>
            <div className="flex justify-between mx-2 gap-1">
              {DAY_ITEMS.map((day) => {
                const isSelected = preferDay.includes(day.key as Day);
                const displayDayLabel =
                  selectorT.days?.[day.key as keyof typeof selectorT.days] ||
                  day.label;

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
                    className={`cursor-pointer w-9 h-9 rounded-full text-[14px] font-bold transition flex items-center justify-center ${
                      isSelected
                        ? "bg-[#FF7A59] text-white"
                        : "bg-[#F2F0EC] text-[#78716C]"
                    }`}
                  >
                    {displayDayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-sm font-bold text-[#78716C] block mb-2">
              {t.timeLabel}
            </span>
            <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3">
              {(["AM", "PM"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveTimeType(type)}
                  className={`cursor-pointer flex-1 text-[13.5px] py-1.5 text-center rounded-lg font-bold transition ${
                    activeTimeType === type
                      ? "bg-white text-[#FF7A59]"
                      : "text-[#78716C]"
                  }`}
                >
                  {t.amPm[type]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredTimes.map((time) => {
                const isSelected = preferTime.includes(time.key as Time);
                const displayTimeLabel =
                  selectorT.times?.[time.key as keyof typeof selectorT.times] ||
                  time.label;

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
                    className={`cursor-pointer text-[13px] px-3 py-1.5 rounded-xl font-semibold transition ${
                      isSelected
                        ? "bg-[#FF7A59] text-white font-bold"
                        : "bg-[#F2F0EC] text-[#78716C]"
                    }`}
                  >
                    {displayTimeLabel}
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
          className="cursor-pointer mt-9 w-full bg-[#292524] hover:bg-black active:scale-[0.99] text-white py-4 rounded-xl text-sm font-bold flex justify-center items-center transition disabled:opacity-70 shadow-md"
        >
          {isUpdateProfilePending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t.saveButton
          )}
        </button>
      </div>
    </div>
  );
}
