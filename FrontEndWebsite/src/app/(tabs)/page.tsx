"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { DAY_ITEMS } from "@/constants/dayItems";
import { TIME_ITEMS } from "@/constants/timeItems";
import { GATHERING_CATEGORY_COLOR } from "@/constants/gatheringCategoryColor";
import { DISTRICT_ITEMS } from "@/constants/districtItems";
import { TYPE_FILTERS } from "@/constants/typeFilters";
import { CATEGORY_FILTERS } from "@/constants/categoryFilters";
import { GET_KEY_BY_LABEL } from "@/utils/getKeyByLabel";
import { DEFAULT_COORDS } from "@/constants/defaultCoords";
import { Coords } from "@/types/Coords";
import { getGatherings } from "../api/gathering/getGatherings";
import { getClientDayEnum } from "@/utils/getClientDayEnum";
import {
  JoinedGatheringItem,
  JoinGatheringInfo,
} from "@/types/JoinedGatheringItem";
import { useCreateGathering } from "@/hooks/useCreateGathering";
import { Category } from "@/types/Category";
import { Day } from "@/types/Day";
import { Time } from "@/types/Time";
import { District } from "@/types/District";
import { getMyProfile } from "../api/profile/getMyProfile";
import { toggleFilter } from "@/utils/toggleFilter";
import { toggleArrayItem } from "@/utils/toggleArrayItem";
import { GatheringWithDistance } from "@/types/Gathering";
import { CreateGatheringModal } from "@/components/CreateGatheringModal";
import { MapSelectionModal } from "@/components/MapSelectionModal";

export default function HomePage() {
  useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const router = useRouter();

  const [selectedTypes, setSelectedTypes] = useState<string[]>(["전체"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전체",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [activeDistrictTab, setActiveDistrictTab] = useState<
    "SEOUL" | "GYEONGGI" | "OTHER"
  >("SEOUL");
  const [activeTimeTab, setActiveTimeTab] = useState<"AM" | "PM">("PM");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [gatheringAddress, setGatheringAddress] = useState("");
  const [district, setDistrict] = useState<District | null>(null);
  const [gatheringDay, setGatheringDay] = useState<Day[]>([]);
  const [gatheringTime, setGatheringTime] = useState<Time[]>([]);
  const [location, setLocation] = useState(DEFAULT_COORDS);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedPlaceCoords, setSelectedPlaceCoords] = useState<Coords | null>(
    null,
  );

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
          console.error("위치 추적 에러 발생:", error);
          setIsLocationLoading(false);
        },
      );
    } else {
      setIsLocationLoading(false);
    }
  }, []);

  ///////////////////////////////////////////////////////////////////////////////

  const { data: gatherings = [], isLoading: isGatheringsLoading } = useQuery({
    queryKey: ["gatherings", { selectedTypes, selectedCategories, location }],
    queryFn: () =>
      getGatherings({
        types: selectedTypes,
        categories: selectedCategories,
        clientDay: getClientDayEnum(),
        latitude: location?.latitude,
        longitude: location?.longitude,
      }),
    refetchInterval: 5000,
  });

  const isCombinedLoading = isGatheringsLoading || isLocationLoading;

  ///////////////////////////////////////////////////////////////////////////////

  const { data: userProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
    refetchInterval: 5000,
  });

  const myJoinedGatherings =
    userProfile?.joinedGatherings?.map(
      (jg: JoinedGatheringItem) => jg.gathering,
    ) || [];

  ///////////////////////////////////////////////////////////////////////////////

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(null);
    setMaxParticipants("");
    setGatheringPlace("");
    setGatheringAddress("");
    setActiveDistrictTab("SEOUL");
    setDistrict(null);
    setGatheringDay([]);
    setGatheringTime([]);
    setSelectedPlaceCoords(null);
  };

  const {
    mutate: createGatheringMutation,
    isPending: isCreateGatheringPending,
  } = useCreateGathering({
    onSuccessCallback: () => {
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  const handleCreateSubmit = () => {
    const parsedMax = parseInt(maxParticipants, 10);
    if (isNaN(parsedMax) || parsedMax < 2 || parsedMax > 12) {
      alert("최대 정원은 최소 2명에서 최대 12명까지만 가능합니다!");
      return;
    }
    if (!selectedPlaceCoords) {
      alert("지도에서 모임 장소 위치를 지정해 주세요!");
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

    const gatheringCreatePayload = {
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

    createGatheringMutation(gatheringCreatePayload);
  };

  ///////////////////////////////////////////////////////////////////////////////

  const filteredDistricts = DISTRICT_ITEMS.filter(
    (d) => d.city === activeDistrictTab,
  );

  const filteredTimes = TIME_ITEMS.filter((t) => t.type === activeTimeTab);

  ///////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] relative pb-24">
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
                  {myJoinedGatherings.map(
                    (jg: JoinGatheringInfo, idx: number) => (
                      <div
                        key={jg.id || idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/gatherings/${jg.id}`);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 cursor-pointer transition text-sm font-semibold"
                      >
                        <div className="flex items-center gap-2 max-w-[85%]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A59]" />
                          <p className="truncate">{jg.title}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ),
                  )}
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

      <section className="max-w-6xl mx-auto px-4 mt-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() =>
                toggleFilter(
                  filter,
                  "TYPE",
                  selectedTypes,
                  setSelectedTypes,
                  selectedCategories,
                  setSelectedCategories,
                )
              }
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
            const catTheme = GATHERING_CATEGORY_COLOR[
              GET_KEY_BY_LABEL(filter)
            ] || {
              bg: "#FFEBE5",
              text: "#FF7A59",
            };
            return (
              <button
                key={filter}
                onClick={() =>
                  toggleFilter(
                    filter,
                    "CATE",
                    selectedTypes,
                    setSelectedTypes,
                    selectedCategories,
                    setSelectedCategories,
                  )
                }
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

      <main className="max-w-6xl mx-auto px-4 mt-4">
        {isCombinedLoading ? (
          <div className="flex h-64 justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF7A59]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gatherings.map((item: GatheringWithDistance) => {
              const catTheme = GATHERING_CATEGORY_COLOR[
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

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-21 right-6 w-14 h-14 bg-[#FF7A59] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#e06848] transition z-90 transform active:scale-95"
      >
        <Plus className="w-7 h-7" />
      </button>

      <CreateGatheringModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        formProps={{
          category,
          setCategory,
          title,
          setTitle,
          description,
          setDescription,
          activeDistrictTab,
          setActiveDistrictTab,
          district,
          setDistrict,
          filteredDistricts,
          selectedPlaceCoords,
          setIsMapModalOpen,
          gatheringPlace,
          setGatheringPlace,
          gatheringDay,
          setGatheringDay,
          activeTimeTab,
          setActiveTimeTab,
          gatheringTime,
          setGatheringTime,
          filteredTimes,
          maxParticipants,
          setMaxParticipants,
          handleCreateSubmit,
          isPending: isCreateGatheringPending,
          toggleArrayItem,
          GATHERING_CATEGORY_COLOR,
          DAY_ITEMS,
        }}
      />

      <MapSelectionModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        location={location}
        selectedPlaceCoords={selectedPlaceCoords}
        setSelectedPlaceCoords={setSelectedPlaceCoords}
        gatheringAddress={gatheringAddress}
        setGatheringAddress={setGatheringAddress}
        setGatheringPlace={setGatheringPlace}
      />
    </div>
  );
}
