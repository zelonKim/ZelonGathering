"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Camera,
  Thermometer,
  AlertCircle,
  Loader2,
} from "lucide-react"; // lucide 아이콘 도입
import { client } from "@/api/client";
import { removeAccessToken } from "@/api/token";

// --- 정적 옵션 데이터 (기존 데이터 구조 100% 이식) ---
const CATEGORY_ITEMS = [
  { key: "STUDY", label: "📑 스터디" },
  { key: "SPORTS", label: "⚽️ 스포츠" },
  { key: "ART", label: "🎨 아트" },
  { key: "FOOD", label: "🍔 음식" },
  { key: "GAME", label: "🎯 게임" },
  { key: "BOOK", label: "📚 독서" },
  { key: "TALK", label: "🎙️ 토크" },
  { key: "TOUR", label: "🚡 투어" },
];

const DAY_ITEMS = [
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
  { key: "SUN", label: "일" },
];

const TIME_ITEMS = [
  { key: "AM_06", label: "오전 06:00", type: "AM" },
  { key: "AM_07", label: "오전 07:00", type: "AM" },
  { key: "AM_08", label: "오전 08:00", type: "AM" },
  { key: "AM_09", label: "오전 09:00", type: "AM" },
  { key: "AM_10", label: "오전 10:00", type: "AM" },
  { key: "AM_11", label: "오전 11:00", type: "AM" },
  { key: "PM_12", label: "정오 12:00", type: "PM" },
  { key: "PM_01", label: "오후 01:00", type: "PM" },
  { key: "PM_02", label: "오후 02:00", type: "PM" },
  { key: "PM_03", label: "오후 03:00", type: "PM" },
  { key: "PM_04", label: "오후 04:00", type: "PM" },
  { key: "PM_05", label: "오후 05:00", type: "PM" },
  { key: "PM_06", label: "오후 06:00", type: "PM" },
  { key: "PM_07", label: "오후 07:00", type: "PM" },
  { key: "PM_08", label: "오후 08:00", type: "PM" },
  { key: "PM_09", label: "오후 09:00", type: "PM" },
  { key: "PM_10", label: "오후 10:00", type: "PM" },
];

export const DISTRICT_ITEMS = [
  // === 서울특별자치시 (SEOUL) ===
  { key: "SEOUL_GANGDONG", label: "강동구", city: "SEOUL" },
  { key: "SEOUL_GANGSEO", label: "강서구", city: "SEOUL" },
  { key: "SEOUL_GANGNAM", label: "강남구", city: "SEOUL" },
  { key: "SEOUL_GANGBUK", label: "강북구", city: "SEOUL" },
  { key: "SEOUL_GWANAK", label: "관악구", city: "SEOUL" },
  { key: "SEOUL_GWANGJIN", label: "광진구", city: "SEOUL" },
  { key: "SEOUL_GURO", label: "구로구", city: "SEOUL" },
  { key: "SEOUL_GEUMCHEON", label: "금천구", city: "SEOUL" },
  { key: "SEOUL_NOWON", label: "노원구", city: "SEOUL" },
  { key: "SEOUL_DOBONG", label: "도봉구", city: "SEOUL" },
  { key: "SEOUL_DONGDAEMUN", label: "동대문구", city: "SEOUL" },
  { key: "SEOUL_DONGJAK", label: "동작구", city: "SEOUL" },
  { key: "SEOUL_MAPO", label: "마포구", city: "SEOUL" },
  { key: "SEOUL_SEODAEMUN", label: "서대문구", city: "SEOUL" },
  { key: "SEOUL_SEOCHO", label: "서초구", city: "SEOUL" },
  { key: "SEOUL_SEONGDONG", label: "성동구", city: "SEOUL" },
  { key: "SEOUL_SEONGBUK", label: "성북구", city: "SEOUL" },
  { key: "SEOUL_SONGPA", label: "송파구", city: "SEOUL" },
  { key: "SEOUL_YANGCHEON", label: "양천구", city: "SEOUL" },
  { key: "SEOUL_YEONGDEUNGPO", label: "영등포구", city: "SEOUL" },
  { key: "SEOUL_YONGSAN", label: "용산구", city: "SEOUL" },
  { key: "SEOUL_EUNPYEONG", label: "은평구", city: "SEOUL" },
  { key: "SEOUL_JONGNO", label: "종로구", city: "SEOUL" },
  { key: "SEOUL_JUNGGU", label: "중구", city: "SEOUL" },
  { key: "SEOUL_JUNGNANG", label: "중랑구", city: "SEOUL" },

  // === 경기도 (GYEONGGI) ===
  { key: "GYEONGGI_SUWON", label: "수원시", city: "GYEONGGI" },
  { key: "GYEONGGI_SEONGNAM", label: "성남시", city: "GYEONGGI" },
  { key: "GYEONGGI_GOYANG", label: "고양시", city: "GYEONGGI" },
  { key: "GYEONGGI_YONGIN", label: "용인시", city: "GYEONGGI" },
  { key: "GYEONGGI_BUCHEON", label: "부천시", city: "GYEONGGI" },
  { key: "GYEONGGI_ANSAN", label: "안산시", city: "GYEONGGI" },
  { key: "GYEONGGI_ANYANG", label: "안양시", city: "GYEONGGI" },
  { key: "GYEONGGI_NAMYANGJU", label: "남양주시", city: "GYEONGGI" },
  { key: "GYEONGGI_HWASEONG", label: "화성시 (동탄)", city: "GYEONGGI" },
  { key: "GYEONGGI_PYEONGTAEK", label: "평택시", city: "GYEONGGI" },
  { key: "GYEONGGI_UIJEONGBU", label: "의정부시", city: "GYEONGGI" },
  { key: "GYEONGGI_SIHEUNG", label: "시흥시", city: "GYEONGGI" },
  { key: "GYEONGGI_PAJU", label: "파주시", city: "GYEONGGI" },
  { key: "GYEONGGI_GWANGMYEONG", label: "광명시", city: "GYEONGGI" },
  { key: "GYEONGGI_GIMPO", label: "김포시", city: "GYEONGGI" },
  { key: "GYEONGGI_GUNPO", label: "군포시", city: "GYEONGGI" },
  { key: "GYEONGGI_GWANGJU", label: "광주시", city: "GYEONGGI" },
  { key: "GYEONGGI_ICHEON", label: "이천시", city: "GYEONGGI" },
  { key: "GYEONGGI_YANGJU", label: "양주시", city: "GYEONGGI" },
  { key: "GYEONGGI_ANSEONG", label: "안성시", city: "GYEONGGI" },
  { key: "GYEONGGI_GURI", label: "구리시", city: "GYEONGGI" },
  { key: "GYEONGGI_UIWANG", label: "의왕시", city: "GYEONGGI" },
  { key: "GYEONGGI_POCHEON", label: "포천시", city: "GYEONGGI" },
  { key: "GYEONGGI_HANAM", label: "하남시", city: "GYEONGGI" },
  { key: "GYEONGGI_OSAN", label: "오산시", city: "GYEONGGI" },
  { key: "GYEONGGI_YEOJU", label: "여주시", city: "GYEONGGI" },
  { key: "GYEONGGI_DONGDUCHEON", label: "동두천시", city: "GYEONGGI" },
  { key: "GYEONGGI_GWACHEON", label: "과천시", city: "GYEONGGI" },
  { key: "GYEONGGI_YANGPYEONG", label: "양평군", city: "GYEONGGI" },
  { key: "GYEONGGI_GAPYEONG", label: "가평군", city: "GYEONGGI" },
  { key: "GYEONGGI_YEONCHEON", label: "연천군", city: "GYEONGGI" },

  // === 기타 광역시 및 도 단위 지역 (OTHER) ===
  { key: "INCHEON", label: "인천광역시", city: "OTHER" },
  { key: "DAEJEON", label: "대전광역시", city: "OTHER" },
  { key: "DAEGU", label: "대구광역시", city: "OTHER" },
  { key: "GWANGJU", label: "광주광역시", city: "OTHER" },
  { key: "BUSAN", label: "부산광역시", city: "OTHER" },
  { key: "ULSAN", label: "울산광역시", city: "OTHER" },
  { key: "SEJONG", label: "세종특별자치시", city: "OTHER" },
  { key: "GANGWON", label: "강원특별자치도", city: "OTHER" },
  { key: "CHUNGBUK", label: "충청북도", city: "OTHER" },
  { key: "CHUNGNAM", label: "충청남도", city: "OTHER" },
  { key: "JEONBUK", label: "전북특별자치도", city: "OTHER" },
  { key: "JEONNAM", label: "전라남도", city: "OTHER" },
  { key: "GYEONGBUK", label: "경상북도", city: "OTHER" },
  { key: "GYEONGNAM", label: "경상남도", city: "OTHER" },
  { key: "JEJU", label: "제주특별자치도", city: "OTHER" },
].sort((a, b) => a.label.localeCompare(b.label, "ko-KR"));

interface UpdateProfilePayload {
  nickname?: string;
  favorite?: string;
  hate?: string;
  age?: number;
  mbti?: string;
  preferCategory?: string[];
  preferDistrict?: string[];
  preferDay?: string[];
  preferTime?: string[];
  profileImg?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 프로필 데이터 로드 (React Query)
  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await client.get("/users/me");
      return data;
    },
  });

  // 2. 프로필 최종 업데이트 Mutation (PATCH)
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await client.patch("/users/profile", payload);
      return data;
    },
    onSuccess: () => {
      alert("소모임 취향 프로필이 저장되었습니다! 🍑");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error: any) => {
      console.error("프로필 수정 오류:", error);
      alert("프로필 저장 중 서버 오류가 발생했습니다.");
    },
  });

  // 로컬 컴포넌트 입력 상태 관리
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [mbti, setMbti] = useState("");
  const [favorite, setFavorite] = useState("");
  const [hate, setHate] = useState("");
  const [preferCategory, setPreferCategory] = useState<string[]>([]);
  const [preferDistrict, setPreferDistrict] = useState<string[]>([]);
  const [preferDays, setPreferDays] = useState<string[]>([]);
  const [preferTimes, setPreferTimes] = useState<string[]>([]);
  const [profileImg, setProfileImg] = useState<string>("");
  const [isImageUploading, setIsImageUploading] = useState(false);

  // 대분류 제어 탭 상태
  const [activeCity, setActiveCity] = useState<"SEOUL" | "GYEONGGI" | "OTHER">(
    "SEOUL",
  );
  const [activeTimeType, setActiveTimeType] = useState<"AM" | "PM">("PM");

  // 데이터 동기화 이펙트
  useEffect(() => {
    if (userProfile) {
      setNickname(userProfile.nickname || "");
      setAge(userProfile.age ? String(userProfile.age) : "");
      setMbti(userProfile.mbti || "");
      setFavorite(userProfile.favorite || "");
      setHate(userProfile.hate || "");
      setPreferCategory(userProfile.preferCategory || []);
      setPreferDistrict(userProfile.preferDistrict || []);
      setPreferDays(userProfile.preferDay || []);
      setPreferTimes(userProfile.preferTime || []);
      if (userProfile.profileImg) {
        setProfileImg(`${userProfile.profileImg}?t=${new Date().getTime()}`);
      } else {
        setProfileImg("");
      }
    }
  }, [userProfile]);

  // 📸 웹 브라우저 파일 선택 및 Cloudflare R2 서버 업로드 처리 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 용량 제한 가드벨트 (예: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // 백엔드 @UploadedFile() 파라미터 매핑 이름 "file" 고정

    try {
      setIsImageUploading(true);
      const response = await client.post("/users/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 캐시 버스팅 파라미터 붙여서 로컬 상태 갱신
      if (response.data && response.data.imageUrl) {
        setProfileImg(`${response.data.imageUrl}?t=${new Date().getTime()}`);
      } else if (typeof response.data === "string") {
        setProfileImg(`${response.data}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      console.error("클라우드 이미지 업로드 실패:", error);
      alert("이미지를 서버에 업로드하지 못했습니다.");
    } finally {
      setIsImageUploading(false);
    }
  };

  // 💾 프로필 저장 로직 및 데이터 정제 슛
  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      alert("닉네임은 필수 항목입니다.");
      return;
    }

    // 💡 쿼리 스트링(?t=...) 제거하여 백엔드 DB 순수성 유지
    const cleanProfileImg = profileImg ? profileImg.split("?")[0] : undefined;

    const payload: UpdateProfilePayload = {
      nickname: nickname.trim(),
      favorite: favorite.trim(),
      hate: hate.trim(),
      age: age ? Number(age) : undefined,
      mbti: mbti.trim() ? mbti.trim().toUpperCase() : undefined,
      preferCategory,
      preferDistrict,
      preferDay: preferDays,
      preferTime: preferTimes,
      profileImg: cleanProfileImg,
    };

    updateProfileMutation.mutate(payload);

    router.replace("/");
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-[70vh] justify-center items-center bg-[#FBFBF9] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A59]" />
      </div>
    );
  }

  if (isError) {
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

  return (
    <div className=" min-h-screen px-4 pb-12 max-w-4xl mx-auto ">
      {/* 글로벌 프로필 상단 탑 데크 */}
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

      {/* 히든 파일 인풋 (브라우저 업로드 유틸) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-4">
        {/* 아바타 프로필 온도 카드 */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E5E4] flex flex-col items-center justify-center">
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImageUploading}
              className="w-24 h-24 rounded-[28px] bg-[#FFEBE5] overflow-hidden flex items-center justify-center border border-stone-100 transition group relative"
            >
              {isImageUploading ? (
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
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-[#292524] hover:bg-black w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white cursor-pointer shadow-sm text-white"
            >
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <div className="flex items-center bg-orange-50 text-orange-500 px-3 py-1 rounded-full gap-1 text-xs font-bold">
            <Thermometer className="w-3.5 h-3.5" />
            <span>매너 온도 {userProfile?.mannerTemperature ?? 36.5}°C</span>
          </div>
        </div>

        {/* 인프라 폼 1: 기본 정보 */}
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
              // 🌟 [수정] /[^0-09]/g  ➡️  /[^0-9]/g 로 변경 슛!
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

        {/* 인프라 폼 2: 취향 키워드 문장 에어리어 */}
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
              placeholder="좋아하는 활동이나 관심사를 적어주세요!"
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
              placeholder="모임에서 기피하는 상황을 적어주세요!"
              rows={2}
              className="w-full bg-[#F8F6F4] rounded-xl p-3 text-sm font-medium text-[#292524] outline-none resize-none"
            />
          </div>
        </div>

        {/* 인프라 폼 3: 다중 토글 지역 관심사 매칭 바 */}
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
                const isSelected = preferCategory.includes(cat.key);
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
            {/* 세그먼트 스위치 탭바 */}
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

            {/* 세부 자치구역 멀티 칩스 리스트 */}
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-dashed border-stone-100 rounded-xl">
              {filteredDistricts.map((item) => {
                const isDistSelected = preferDistrict.includes(item.key);
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

        {/* 인프라 폼 4: 선호 일정 매칭 국면 */}
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
                const isSelected = preferDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() =>
                      setPreferDays(
                        isSelected
                          ? preferDays.filter((d) => d !== day.key)
                          : [...preferDays, day.key],
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
                const isSelected = preferTimes.includes(time.key);
                return (
                  <button
                    key={time.key}
                    type="button"
                    onClick={() =>
                      setPreferTimes(
                        isSelected
                          ? preferTimes.filter((t) => t !== time.key)
                          : [...preferTimes, time.key],
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

        {/* 최종 전송 액션 단추 */}
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={updateProfileMutation.isPending || isImageUploading}
          className="mt-9 w-full bg-[#292524] hover:bg-black active:scale-[0.99] text-white py-4 rounded-xl text-sm font-bold flex justify-center items-center transition disabled:opacity-70 shadow-md"
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "프로필 저장하기"
          )}
        </button>
      </div>
    </div>
  );
}
