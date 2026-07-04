"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Grid,
  Layers,
  Plus,
  X,
  MapPin,
  Loader2,
  CheckCircle,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { client } from "@/api/client";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

// --- 디자인 테마 및 필터 데이터 ---
const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
};

const CATEGORY_MAP: Record<
  string,
  { label: string; emoji: string; bg: string; text: string }
> = {
  ALL: { label: "전체", emoji: "✨", bg: "#FFEBE5", text: "#FF7A59" },
  STUDY: { label: "스터디", emoji: "📖", bg: "#E0F2FE", text: "#0369A1" },
  SPORTS: { label: "스포츠", emoji: "⚽️", bg: "#E6F4EA", text: "#137333" },
  ART: { label: "아트", emoji: "🎨", bg: "#FAE7F3", text: "#B80066" },
  FOOD: { label: "푸드", emoji: "🍔", bg: "#FEF0E6", text: "#D94E2B" },
  BOOK: { label: "독서", emoji: "📚", bg: "#F1ECE4", text: "#614E3D" },
  GAME: { label: "게임", emoji: "🎯", bg: "#EDE9FE", text: "#5B21B6" },
  TALK: { label: "토크", emoji: "🎙️", bg: "#F4F4F5", text: "#3F3F46" },
  TOUR: { label: "투어", emoji: "🚠", bg: "#E0F7FA", text: "#006064" },
};

const TYPE_FILTERS = ["전체", "거리순", "오늘 열리는", "내일 열리는"];
const CATEGORY_FILTERS = [
  "전체",
  "스터디",
  "스포츠",
  "아트",
  "푸드",
  "독서",
  "게임",
  "토크",
  "투어",
];

const DAY_OPTIONS = [
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
  { key: "SUN", label: "일" },
];

// 🌟 백엔드 enum Time 규격에 완전 맞춤화한 17개 타임 딕셔너리
const TIME_OPTIONS = [
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

// 🌟 백엔드 enum District 규격을 100% 반영한 68개 자치구 대데이터 매핑 테이블
const DISTRICT_OPTIONS = [
  // 서울 (SEOUL)
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
  // 경기 (GYEONGGI)
  { key: "GYEONGGI_SUWON", label: "수원시", city: "GYEONGGI" },
  { key: "GYEONGGI_SEONGNAM", label: "성남시 (분당/판교)", city: "GYEONGGI" },
  { key: "GYEONGGI_GOYANG", label: "고양시 (일산)", city: "GYEONGGI" },
  { key: "GYEONGGI_YONGIN", label: "용인시 (수지/기흥)", city: "GYEONGGI" },
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
  // 기타 지방 광역시 (ETC)
  { key: "INCHEON", label: "인천광역시", city: "ETC" },
  { key: "DAEJEON", label: "대전광역시", city: "ETC" },
  { key: "DAEGU", label: "대구광역시", city: "ETC" },
  { key: "GWANGJU", label: "광주광역시", city: "ETC" },
  { key: "BUSAN", label: "부산광역시", city: "ETC" },
  { key: "ULSAN", label: "울산광역시", city: "ETC" },
  { key: "SEJONG", label: "세종특별자치시", city: "ETC" },
  { key: "GANGWON", label: "강원특별자치도", city: "ETC" },
  { key: "CHUNGBUK", label: "충청북도", city: "ETC" },
  { key: "CHUNGNAM", label: "충청남도", city: "ETC" },
  { key: "JEONBUK", label: "전북특별자치도", city: "ETC" },
  { key: "JEONNAM", label: "전라남도", city: "ETC" },
  { key: "GYEONGBUK", label: "경상북도", city: "ETC" },
  { key: "GYEONGNAM", label: "경상남도", city: "ETC" },
  { key: "JEJU", label: "제주특별자치도", city: "ETC" },
].sort((a, b) => a.label.localeCompare(b.label, "ko-KR")); // 가나다순 오름차순 자동 정렬 공정

const GET_KEY_BY_LABEL = (label: string): string => {
  if (label === "전체") return "ALL";
  const match = Object.entries(CATEGORY_MAP).find(
    ([_, v]) => v.label === label,
  );
  return match ? match[0] : "TALK";
};

export default function HomePage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  // 필터 및 메뉴 토글 상태
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["전체"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전체",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 개설 서브 제어 로컬 탭 상태바인딩
  const [activeDistrictTab, setActiveDistrictTab] = useState<
    "SEOUL" | "GYEONGGI" | "ETC"
  >("SEOUL");
  const [activeTimeTab, setActiveTimeTab] = useState<"AM" | "PM">("PM");

  // 폼 입력 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [gatheringAddress, setGatheringAddress] = useState("");

  // 🌟 최종 Prisma Dto에 담길 단일 자치구 Enum Key 상태 (기본값 강남구 지정)
  const [district, setDistrict] = useState("SEOUL_GANGNAM");
  const [gatheringDay, setGatheringDay] = useState<string[]>([]);
  const [gatheringTime, setGatheringTime] = useState<string[]>([]);

  // GPS 브라우저 위치 보관 상태 (기본값 서울시청)
  const [location, setLocation] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // 🗺️ 웹용 지도 전용 상태
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedPlaceCoords, setSelectedPlaceCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 🌐 브라우저 Geolocation API 연동
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocationLoading(false);
        },
        (error) => {
          console.error("위치 추적 예외 발생:", error);
          setIsLocationLoading(false);
        },
      );
    } else {
      setIsLocationLoading(false);
    }
  }, []);

  const getClientDayEnum = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[new Date().getDay()];
  };

  // 🔄 소모임 리스트 가져오기 (백엔드 DTO @Transform 가드와 100% 싱크 완료)
  const { data: gatherings = [], isLoading: isGatheringsLoading } = useQuery({
    queryKey: ["gatherings", selectedTypes, selectedCategories, location],
    queryFn: async () => {
      const response = await client.get("gatherings", {
        params: {
          types: selectedTypes,
          categories: selectedCategories,
          clientDay: getClientDayEnum(),
          latitude: location.latitude,
          longitude: location.longitude,
        },
        // 🌟 [최종 수정] 백엔드 DTO가 온전하게 수신할 수 있도록 대괄호([]) 없이 순수 직렬화를 수행합니다.
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // 💡 1개일 때는 key=value, 여러 개일 때는 key=value1&key=value2 표준 포맷 슛!
              value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          return searchParams.toString();
        },
      });
      return response.data;
    },
    refetchInterval: 5000,
  });

  // 내 프로필 가져오기
  const { data: userProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await client.get("/users/me");
      return data;
    },
    refetchInterval: 5000,
  });

  const myJoinedGatherings =
    userProfile?.joinedGatherings?.map((jg: any) => jg.gathering) || [];

  // 소모임 생성 Mutation
  const createGatheringMutation = useMutation({
    mutationFn: async (newGathering: any) => {
      const { data } = await client.post("/gatherings", newGathering);
      return data;
    },
    onSuccess: () => {
      alert("새로운 소모임이 성공적으로 개설되었습니다! 🎉");
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.message || "소모임 생성에 실패했습니다.";
      alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("FOOD");
    setMaxParticipants("");
    setGatheringPlace("");
    setGatheringAddress("");
    setActiveDistrictTab("SEOUL");
    setDistrict("SEOUL_GANGNAM");
    setGatheringDay([]);
    setGatheringTime([]);
    setSelectedPlaceCoords(null);
  };

  const handleCreateSubmit = () => {
    const parsedMax = parseInt(maxParticipants, 10);
    if (isNaN(parsedMax) || parsedMax < 2 || parsedMax > 12) {
      alert("최대 정원은 최소 2명에서 최대 12명까지만 가능합니다! 🍑");
      return;
    }
    if (!selectedPlaceCoords) {
      alert("지도에서 모임 장소 위치를 지정해 주세요! 📍");
      return;
    }

    // 🌟 [UI 가드 완화 교정]: 시간대 미선택 방지를 방어하되, 선택했는지 더 직관적으로 제어
    if (
      !title ||
      !description ||
      !gatheringPlace ||
      gatheringDay.length === 0 ||
      gatheringTime.length === 0
    ) {
      alert("모든 항목을 입력 및 선택해 주세요!");
      return;
    }

    const payload = {
      title,
      description,
      category,
      maxParticipants: parsedMax,
      gatheringPlace,
      latitude: selectedPlaceCoords.latitude,
      longitude: selectedPlaceCoords.longitude,
      district,
      gatheringDay,
      gatheringTime,
    };
    createGatheringMutation.mutate(payload);
  };

  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
  ) => {
    if (list.includes(item)) setList(list.filter((x) => x !== item));
    else setList([...list, item]);
  };

  const toggleFilter = (filter: string, type: "TYPE" | "CAT") => {
    const isType = type === "TYPE";
    const currentList = isType ? selectedTypes : selectedCategories;
    const setList = isType ? setSelectedTypes : setSelectedCategories;
    if (filter === "전체") {
      setList(["전체"]);
      return;
    }
    let newList = currentList.filter((item) => item !== "전체");
    if (newList.includes(filter)) {
      newList = newList.filter((item) => item !== filter);
      if (newList.length === 0) newList = ["전체"];
    } else {
      if (isType) {
        if (filter === "오늘 열리는")
          newList = newList.filter((item) => item !== "내일 열리는");
        else if (filter === "내일 열리는")
          newList = newList.filter((item) => item !== "오늘 열리는");
      }
      newList.push(filter);
    }
    setList(newList);
  };

  const isCombinedLoading = isGatheringsLoading || isLocationLoading;

  // 지역 및 시간대 세그먼트 필터링 컴퓨팅 변수
  const filteredDistricts = DISTRICT_OPTIONS.filter(
    (d) => d.city === activeDistrictTab,
  );
  const filteredTimes = TIME_OPTIONS.filter((t) => t.type === activeTimeTab);

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] relative pb-24">
      {/* 글로벌 네비게이션 헤더 */}
      <header className="max-w-6xl mx-auto px-5 py-5 flex justify-between items-center border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-3xl font-black text-[#FF7A59] tracking-tight">
            Gathering
          </h1>
          <p className="text-lg font-bold text-[#292524] mt-1 ">
            📍 지금 내 주변 소모임
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`hover:border-orange-300 hover:bg-[#FF7A59]/60 w-10 h-10 rounded-xl flex items-center justify-center border transition ${
              isDropdownOpen
                ? "bg-[#FF7A59]/90 border-[#FF7A59] text-white"
                : "bg-[#FFEBE5] border-[#FF7A59]/20 text-[#FF7A59]"
            }`}
          >
            <div className="text-[19px]">🍑</div>
            {/* <Grid className="w-5 h-5" /> */}
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-50 "
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#FF7A59]" />
                  <span className="text-sm font-extrabold text-[#FF7A59]">
                    내가 참여 중인 소모임
                  </span>
                </div>
                <div className="max-h-90 overflow-y-auto space-y-1">
                  {myJoinedGatherings.map((g: any, idx: number) => (
                    <div
                      key={g.id || idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/gatherings/${g.id}`);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 cursor-pointer transition text-sm font-semibold"
                    >
                      <div className="flex items-center gap-2 max-w-[85%]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A59]" />
                        <p className="truncate">{g.title}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  ))}
                  {myJoinedGatherings.length === 0 && (
                    <p className="text-xs text-center py-4 text-stone-400 font-medium">
                      참여 중인 모임이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 필터 래퍼 섹션 */}
      <section className="max-w-6xl mx-auto px-4 mt-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter, "TYPE")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border whitespace-nowrap transition ${
                selectedTypes.includes(filter)
                  ? "bg-[#FF7A59] border-[#FF7A59] text-white font-bold"
                  : "bg-white border-[#E7E5E4] text-[#78716C]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = selectedCategories.includes(filter);
            const catTheme = CATEGORY_MAP[GET_KEY_BY_LABEL(filter)] || {
              bg: "#FFEBE5",
              text: "#FF7A59",
            };
            return (
              <button
                key={filter}
                onClick={() => toggleFilter(filter, "CAT")}
                style={
                  isActive
                    ? {
                        backgroundColor: catTheme.bg,
                        color: catTheme.text,
                        borderColor: catTheme.bg,
                        fontWeight: "700",
                      }
                    : {}
                }
                className={`px-3 py-1 rounded-lg text-[13px] font-semibold border transition whitespace-nowrap ${
                  isActive
                    ? "font-extrabold "
                    : "bg-[#F2F0EC] border-[#F2F0EC] text-[#78716C]"
                }`}
              >
                # {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* 리스트 피드 대시보드 */}
      <main className="max-w-6xl mx-auto px-4 mt-4">
        {isCombinedLoading ? (
          <div className="flex h-64 justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF7A59]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gatherings.map((item: any) => {
              const catTheme = CATEGORY_MAP[
                item.category?.toUpperCase() || "TALK"
              ] || {
                label: item.category,
                emoji: "📍",
                bg: "#F2F0EC",
                text: "#292524",
              };
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/gatherings/${item.id}`)}
                  className="bg-white hover:bg-orange-50 border border-[#E7E5E4] hover:scale-101  hover:border-orange-200 p-5 rounded-2xl shadow-xs hover:shadow-sm hover:shadow-orange-50 cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span
                        style={{
                          backgroundColor: catTheme.bg,
                          color: catTheme.text,
                        }}
                        className="px-2.5 py-1 rounded-md text-[12.5px] font-bold"
                      >
                        {catTheme.emoji} {catTheme.label}
                      </span>
                      <span className="text-xs font-bold text-[#FF7A59]">
                        {item.distanceStr || "위치 확인 중"}
                      </span>
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-800 line-clamp-2 leading-snug mb-2">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-[13px] text-[#78716C] mt-2 flex items-center gap-1">
                    📍
                    <span className="truncate">{item.gatheringPlace}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isCombinedLoading && gatherings.length === 0 && (
          <p className="text-center text-sm py-20 text-[#78716C] font-semibold">
            주변에 열린 소모임방이 존재하지 않습니다
          </p>
        )}
      </main>

      {/* 플로팅 개설 버튼 */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-21 right-6 w-14 h-14 bg-[#FF7A59] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#e06848] transition z-90 transform active:scale-95"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* 🔮 소모임 방 개설 바텀 시트형 웹 모달 서포트 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-100 p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black text-[#292524]">
                새로운 소모임 만들기 🍑
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-stone-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-16">
              {/* 카테고리 선택 */}
              <div>
                <label className="text-sm font-bold text-[#292524] block mb-2">
                  카테고리 선택
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(CATEGORY_MAP)
                    .filter((k) => k !== "ALL")
                    .map((key) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        style={
                          category === key
                            ? {
                                backgroundColor: CATEGORY_MAP[key].bg,
                                color: CATEGORY_MAP[key].text,
                              }
                            : {}
                        }
                        className=" px-3 py-1.5 text-[13px] font-bold rounded-full bg-[#F2F0EC] text-[#78716C] transition"
                      >
                        {CATEGORY_MAP[key].emoji} {CATEGORY_MAP[key].label}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[#292524] block mb-1">
                  모임 제목
                </label>
                <input
                  type="text"
                  placeholder="예) 한강 러닝 모임"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]/95"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#292524] block mb-1">
                  모임 설명
                </label>
                <textarea
                  placeholder="모임의 상세 소개글을 작성해 주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]/95 resize-none"
                />
              </div>

              {/* 🌟 [새로운 대단위 인프라]: 행정 구역 정밀 선택 섹션 */}
              <div>
                <label className="mt-8 text-[13.5px] font-bold text-[#292524] block mb-2">
                  모임 지역 선택
                </label>
                <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3 ">
                  {(["SEOUL", "GYEONGGI", "ETC"] as const).map((cityKey) => {
                    const tabLabel =
                      cityKey === "SEOUL"
                        ? "서울"
                        : cityKey === "GYEONGGI"
                          ? "경기"
                          : "기타 광역시/도";
                    return (
                      <button
                        key={cityKey}
                        type="button"
                        onClick={() => {
                          setActiveDistrictTab(cityKey);
                        }}
                        className={`flex-1 text-sm py-2 text-center rounded-lg font-bold transition ${
                          activeDistrictTab === cityKey
                            ? "bg-white text-[#FF7A59] shadow-sm"
                            : "text-[#78716C]"
                        }`}
                      >
                        {tabLabel}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[12.5px] font-bold text-[#78716C] block mb-2">
                  세부 지역 선택
                </span>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  {filteredDistricts.map((item) => {
                    const isSelectedDistrict = district === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setDistrict(item.key)}
                        className={`text-[12.5px] px-3 py-1.5 rounded-xl font-semibold border transition ${
                          isSelectedDistrict
                            ? "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59] font-black"
                            : "bg-white border-stone-200 text-[#78716C] hover:bg-stone-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 지도 위치 지정 */}
              <div>
                <label className="text-sm font-bold text-[#292524] block mb-1.5 mt-6">
                  모임 장소 지정
                </label>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-bold border transition ${
                    selectedPlaceCoords
                      ? "bg-[#fa937a] border-[#FF7A59] text-white"
                      : "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59]"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {selectedPlaceCoords
                    ? "위치 지정 완료 (다시 선택)"
                    : "지도에서 모임 장소 찍기 📍"}
                </button>
                <input
                  type="text"
                  placeholder="상세 장소명을 입력해주세요"
                  value={gatheringPlace}
                  onChange={(e) => setGatheringPlace(e.target.value)}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none mt-2 focus:ring-1 focus:ring-[#FF7A59]/95"
                />
              </div>

              {/* 요일 다중 선택 피커 */}
              <div>
                <label className="text-sm font-bold text-[#292524] block mb-1.5 mt-10">
                  모임 요일 (중복 가능)
                </label>
                <div className="gap-1.5 flex justify-around ">
                  {DAY_OPTIONS.map((day) => {
                    const isSel = gatheringDay.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        onClick={() =>
                          toggleArrayItem(
                            gatheringDay,
                            setGatheringDay,
                            day.key,
                          )
                        }
                        className={`w-10 h-10 rounded-full text-[13.5px] font-bold transition ${isSel ? "bg-[#FF7A59] text-white" : "bg-[#F2F0EC] text-[#78716C]"}`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🌟 [새로운 대단위 인프라]: 17개 시간대 분할 선택 피커 덱 */}
              <div>
                <label className="text-sm font-bold text-[#292524] block mb-2 mt-4">
                  모임 시간대 (중복 가능)
                </label>
                <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3">
                  {(["AM", "PM"] as const).map((timeType) => (
                    <button
                      key={timeType}
                      type="button"
                      onClick={() => setActiveTimeTab(timeType)}
                      className={`flex-1 text-[13.5px] py-1.5 text-center rounded-lg font-bold transition ${
                        activeTimeTab === timeType
                          ? "bg-white text-[#FF7A59]"
                          : "text-[#78716C]"
                      }`}
                    >
                      {timeType === "AM" ? "오전 (AM)" : "오후 (PM)"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {filteredTimes.map((time) => {
                    const isTimeSel = gatheringTime.includes(time.key);
                    return (
                      <button
                        key={time.key}
                        type="button"
                        onClick={() =>
                          toggleArrayItem(
                            gatheringTime,
                            setGatheringTime,
                            time.key,
                          )
                        }
                        className={`py-2 px-1 rounded-xl text-[13px] font-bold transition border text-center ${
                          isTimeSel
                            ? "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59] font-black shadow-sm"
                            : "bg-white border-stone-200 text-[#78716C] hover:bg-stone-50"
                        }`}
                      >
                        {time.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 정원 기입 */}
              <div>
                <label className="text-sm font-bold text-[#292524] block mb-1 mt-6">
                  모임 정원 (명)
                </label>
                <input
                  type="number"
                  placeholder="최소 2명 ~ 최대 12명"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold outline-none focus:ring-1 focus:ring-[#FF7A59]/95"
                />
              </div>

              <button
                onClick={handleCreateSubmit}
                disabled={createGatheringMutation.isPending}
                className="w-full bg-[#FF7A59] hover:bg-[#e06848] text-white py-4 rounded-xl text-[15px] font-extrabold transition shadow-md flex justify-center items-center mt-9"
              >
                {createGatheringMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "소모임방 개설하기 🚀"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 진짜 구글 맵 인터랙티브 모달 */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-stone-950 z-[120] flex flex-col justify-between p-4 md:p-6 animate-in fade-in duration-200">
          <div className="flex-1 bg-stone-900 rounded-2xl relative overflow-hidden border border-stone-800 flex flex-col shadow-inner">
            <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 z-10 shadow-md backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-[#FF7A59]" />
              <span>원하는 모임 장소를 지도에서 터치해 주세요 📍</span>
            </div>

            <div className="w-full h-full">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{
                  lat: Number(
                    selectedPlaceCoords?.latitude ||
                      location.latitude ||
                      37.5665,
                  ),
                  lng: Number(
                    selectedPlaceCoords?.longitude ||
                      location.longitude ||
                      126.978,
                  ),
                }}
                zoom={16}
                onClick={async (e) => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat === undefined || lng === undefined) return;

                  const nextCoords = { latitude: lat, longitude: lng };
                  setSelectedPlaceCoords(nextCoords);

                  try {
                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                    const res = await fetch(
                      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ko`,
                    );
                    const json = await res.json();
                    if (json.results && json.results.length > 0) {
                      setGatheringAddress(json.results[0].formatted_address);
                    }
                  } catch (error) {
                    console.error("주소 변환 실패:", error);
                  }
                }}
              >
                {selectedPlaceCoords && (
                  <MarkerF
                    position={{
                      lat: Number(selectedPlaceCoords.latitude),
                      lng: Number(selectedPlaceCoords.longitude),
                    }}
                  />
                )}
              </GoogleMap>
            </div>

            <button
              onClick={() => setIsMapModalOpen(false)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-700 p-2 rounded-xl shadow-md z-10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white w-full max-w-md mx-auto mt-4 p-3 pb-4 rounded-2xl border border-stone-200 shadow-2xl space-y-3 shrink-0">
            <div className="text-center"></div>

            <div>
              <MapPin className="w-6 h-6 mx-auto text-[#FF7A59] animate-bounce" />
              <p className="flex flex-col items-center text-sm text-center text-stone-500 font-medium py-4">
                지도를 클릭하여 모임 장소에 핀을 꽂아주세요!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!selectedPlaceCoords) {
                  alert("지도에서 모임 장소를 먼저 터치해 주세요! 📍");
                  return;
                }
                setIsMapModalOpen(false);
              }}
              className="w-full bg-[#FF7A59] hover:bg-[#e06848] active:scale-[0.99] text-white text-[15px] font-extrabold py-3.5 rounded-xl transition shadow-md block text-center"
            >
              이 장소로 지정하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
