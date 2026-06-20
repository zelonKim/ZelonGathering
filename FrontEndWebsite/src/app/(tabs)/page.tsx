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
} from "lucide-react";
import { client } from "@/api/client";

// --- 디자인 테마 및 필터 데이터 (기존 데이터 완벽 이식) ---
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
const TIME_OPTIONS = [
  { key: "AM_08", label: "오전 8시" },
  { key: "AM_10", label: "오전 10시" },
  { key: "PM_12", label: "오후 12시" },
  { key: "PM_02", label: "오후 2시" },
  { key: "PM_04", label: "오후 4시" },
  { key: "PM_06", label: "오후 6시" },
  { key: "PM_08", label: "오후 8시" },
  { key: "PM_10", label: "오후 10시" },
];

const REGION_DATA: Record<string, { key: string; label: string }[]> = {
  SEOUL: [
    { key: "SEOUL_GANGNAM", label: "강남구" },
    { key: "SEOUL_MAPO", label: "마포구" },
    { key: "SEOUL_GWANGJIN", label: "광진구" },
  ],
  GYEONGGI: [
    { key: "GYEONGGI_SUWON", label: "수원시" },
    { key: "GYEONGGI_ANSAN", label: "안산시" },
  ],
  ETC: [
    { key: "INCHEON", label: "인천광역시" },
    { key: "BUSAN", label: "부산광역시" },
  ],
};

const GET_KEY_BY_LABEL = (label: string): string => {
  if (label === "전체") return "ALL";
  const match = Object.entries(CATEGORY_MAP).find(
    ([_, v]) => v.label === label,
  );
  return match ? match[0] : "TALK";
};

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 필터 및 메뉴 토글 상태
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["전체"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전체",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 폼 입력 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [macroRegion, setMacroRegion] = useState<"SEOUL" | "GYEONGGI" | "ETC">(
    "SEOUL",
  );
  const [district, setDistrict] = useState("SEOUL_GWANGJIN");
  const [gatheringDay, setGatheringDay] = useState<string[]>([]);
  const [gatheringTime, setGatheringTime] = useState<string[]>([]);

  // GPS 브라우저 위치 보관 상태 (기본값 서울시청)
  const [location, setLocation] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // 🗺️ 웹용 지도 전용 상태 (모달 오픈 및 위경도 더미 연동)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedPlaceCoords, setSelectedPlaceCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 🌐 브라우저 Geolocation API 연동 (모바일의 expo-location 완벽 대체)
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
          console.error("위치 권한 거부 또는 오류:", error);
          alert(
            "위치 권한을 허용하시면 내 주변 소모임을 정확히 정렬해 볼 수 있습니다! 😢",
          );
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

  // 소모임 리스트 가져오기 (React Query v5 구조 유지)
  // 🔄 소모임 리스트 가져오기 (카테고리 한글 -> 영문 Enum 매핑 변환 적용)
  const { data: gatherings = [], isLoading: isGatheringsLoading } = useQuery({
    queryKey: ["gatherings", selectedTypes, selectedCategories, location],
    queryFn: async () => {
      // 💡 [수정] selectedCategories에 들어있는 한글 배열('전체', '스터디' 등)을 그대로 전송합니다.
      const response = await client.get("gatherings", {
        params: {
          types: selectedTypes,
          categories: selectedCategories, // 👈 영문 변환(mappedCategories) 걷어내고 원래 한글 배열 그대로 슛!
          clientDay: getClientDayEnum(),
          latitude: location.latitude,
          longitude: location.longitude,
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
    setMacroRegion("SEOUL");
    setDistrict("SEOUL_GWANGJIN");
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

  // 🗺️ 웹 가상 지도 클릭 에뮬레이션 (포트폴리오 검증용 가상 역지오코딩 타겟팅)
  const handleWebMapClick = () => {
    const mockCoords = {
      latitude: location.latitude + 0.002,
      longitude: location.longitude - 0.001,
    };
    setSelectedPlaceCoords(mockCoords);
    setGatheringPlace("경기 안산시 상록구 한양대학로 55 (가상 모임 지정지)");
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

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] relative pb-24">
      {/* 글로벌 네비게이션 헤더 */}
      <header className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-2xl font-black text-[#FF7A59] tracking-tight">
            Gathering
          </h1>
          <p className="text-sm font-bold text-[#292524] mt-0.5">
            📍 지금 내 주변 소모임
          </p>
        </div>

        {/* 우측 내가 참여중인 소모임 버튼 앱 스타일 보존 */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
              isDropdownOpen
                ? "bg-[#FF7A59] border-[#FF7A59] text-white"
                : "bg-[#FFEBE5] border-[#FF7A59]/20 text-[#FF7A59]"
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* 내가 참여 중인 모임 드롭다운 */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#FF7A59]" />
                  <span className="text-xs font-extrabold text-[#FF7A59]">
                    내가 참여 중인 소모임
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {myJoinedGatherings.map((g: any, idx: number) => (
                    <div
                      key={g.id || idx}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push(`/gatherings/${g.id}`);
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
      <section className="max-w-4xl mx-auto px-4 mt-4 space-y-3">
        {/* 1단 필터 칩 리스트 */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter, "TYPE")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition ${
                selectedTypes.includes(filter)
                  ? "bg-[#FF7A59] border-[#FF7A59] text-white font-bold"
                  : "bg-white border-[#E7E5E4] text-[#78716C]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 2단 카테고리 해시태그 리스트 */}
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
                      }
                    : {}
                }
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${
                  isActive
                    ? "font-extrabold"
                    : "bg-[#F2F0EC] border-[#F2F0EC] text-[#78716C]"
                }`}
              >
                # {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* 리스트 피드 대시보드 - 포트폴리오를 위해 반응형 Grid 구조 업그레이드 적용 */}
      <main className="max-w-4xl mx-auto px-4 mt-4">
        {isCombinedLoading ? (
          <div className="flex h-64 justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF7A59]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span
                        style={{
                          backgroundColor: catTheme.bg,
                          color: catTheme.text,
                        }}
                        className="px-2.5 py-1 rounded-md text-xs font-bold"
                      >
                        {catTheme.emoji} {catTheme.label}
                      </span>
                      <span className="text-xs font-bold text-[#FF7A59]">
                        {item.distanceStr || "위치 확인 중"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#292524] line-clamp-2 leading-snug mb-2">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-xs text-[#78716C] mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{item.gatheringPlace}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isCombinedLoading && gatherings.length === 0 && (
          <p className="text-center text-sm py-20 text-[#78716C] font-semibold">
            주변에 열린 소모임방이 존재하지 않습니다 🍑
          </p>
        )}
      </main>

      {/* 플로팅 개설 버튼 (FAB) */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF7A59] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#e06848] transition z-40 transform active:scale-95"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* 🔮 소모임 방 개설 바텀 시트형 웹 모달 서포트 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* 모달 헤더 */}
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

            {/* 모달 폼 바디 수동 스크롤링 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-12">
              {/* 카테고리 선택 단 레이아웃 */}
              <div>
                <label className="text-xs font-bold text-[#292524] block mb-2">
                  카테고리 선택
                </label>
                <div className="flex flex-wrap gap-1.5">
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
                        className="px-3 py-1.5 text-xs font-bold rounded-full bg-[#F2F0EC] text-[#78716C] transition"
                      >
                        {CATEGORY_MAP[key].emoji} {CATEGORY_MAP[key].label}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#292524] block mb-1">
                  모임 제목
                </label>
                <input
                  type="text"
                  placeholder="예) 한강 러닝 모임"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#292524] block mb-1">
                  모임 설명
                </label>
                <textarea
                  placeholder="모임의 상세 소개글을 작성해 주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20 resize-none"
                />
              </div>

              {/* 지도 위치 지정 버튼 섹션 */}
              <div>
                <label className="text-xs font-bold text-[#292524] block mb-1.5">
                  모임 장소 지정 (위치)
                </label>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-xs font-bold border transition ${
                    selectedPlaceCoords
                      ? "bg-[#FF7A59] border-[#FF7A59] text-white"
                      : "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59]"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {selectedPlaceCoords
                    ? "📍 위치 지정 완료 (다시 선택)"
                    : "지도에서 모임 장소 찍기 🗺️"}
                </button>
                <input
                  type="text"
                  placeholder="상세 주소명 (지도 선택 시 자동 기입)"
                  value={gatheringPlace}
                  onChange={(e) => setGatheringPlace(e.target.value)}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none mt-2"
                />
              </div>

              {/* 요일 다중 선택 피커 */}
              <div>
                <label className="text-xs font-bold text-[#292524] block mb-1.5">
                  모임 요일 (복수 선택)
                </label>
                <div className="flex gap-1.5">
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
                        className={`w-10 h-10 rounded-full text-xs font-bold transition ${isSel ? "bg-[#FF7A59] text-white" : "bg-[#F2F0EC] text-[#78716C]"}`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 정원 기입 */}
              <div>
                <label className="text-xs font-bold text-[#292524] block mb-1">
                  모임 정원 (명)
                </label>
                <input
                  type="number"
                  placeholder="최소 2명 ~ 최대 12명"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <button
                onClick={handleCreateSubmit}
                disabled={createGatheringMutation.isPending}
                className="w-full bg-[#FF7A59] hover:bg-[#e06848] text-white py-4 rounded-xl text-sm font-extrabold transition shadow-md flex justify-center items-center"
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

      {/* 🗺️ 풀스크린 서브 지도 매핑 웹 인터페이스 에뮬레이션 모달 */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-stone-900 z-[60] flex flex-col justify-between p-6">
          {/* 가상 지도 영역 (여기에 카카오/네이버 지도를 임베드 하거나, 포트폴리오 면접용 지도 시뮬레이터를 배치합니다) */}
          <div className="flex-1 bg-stone-800 rounded-2xl relative overflow-hidden border border-stone-700 flex flex-col items-center justify-center p-4 text-center">
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF7A59]" />
              <span>Web Map Sandbox</span>
            </div>

            <div className="space-y-3 max-w-xs">
              <div className="w-12 h-12 bg-[#FF7A59]/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <MapPin className="w-6 h-6 text-[#FF7A59]" />
              </div>
              <p className="text-white text-sm font-bold">
                포트폴리오 면접용 가상 지도 모듈
              </p>
              <p className="text-xs text-stone-400">
                아래 버튼을 누르면 성진님의 현재 위경도 기반 반경으로 타겟 장소
                좌표가 시뮬레이션 추출됩니다.
              </p>
              <button
                onClick={handleWebMapClick}
                className="bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-stone-600 transition"
              >
                🎯 맵 클릭 타겟팅 시뮬레이션 슛
              </button>
            </div>
          </div>

          {/* 하단 확정 앵커 데크 */}
          <div className="bg-white w-full max-w-md mx-auto mt-6 p-5 rounded-2xl border border-stone-200 shadow-2xl space-y-3">
            <p className="text-xs font-black text-[#292524] text-center">
              🎯 모임 장소 지정 확인
            </p>
            {gatheringPlace ? (
              <p className="text-xs text-center font-bold text-[#FF7A59] border border-[#FFEBE5] bg-[#FFEBE5]/30 p-2 rounded-lg truncate">
                {gatheringPlace}
              </p>
            ) : (
              <p className="text-xs text-center text-stone-400 font-medium">
                지도를 가상 터치하여 핀을 꽂아주세요.
              </p>
            )}
            <button
              onClick={() => {
                if (!selectedPlaceCoords) {
                  alert("위치를 먼저 시뮬레이션 하세요!");
                  return;
                }
                setIsMapModalOpen(false);
              }}
              className="w-full bg-[#FF7A59] hover:bg-[#e06848] text-white text-xs font-extrabold py-3 rounded-xl transition text-center block"
            >
              이 위치로 장소 결정하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
