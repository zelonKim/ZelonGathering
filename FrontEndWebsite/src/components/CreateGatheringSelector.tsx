import React from "react";
import { Layers } from "lucide-react";
import { Day } from "@/types/Day";
import { Time } from "@/types/Time";
import { useCreateGatheringSelectorLanguage } from "@/hooks/languages/useCreateGatheringSelectorLanguage"; // 👈 훅 임포트

export function CategorySelector({
  selected,
  onSelect,
  categoryColors,
}: {
  selected: string;
  onSelect: (key: string) => void;
  categoryColors: Record<
    string,
    { bg: string; text: string; emoji: string; label: string }
  >;
}) {
  const { t } = useCreateGatheringSelectorLanguage();

  return (
    <div>
      <label className="text-sm font-bold text-[#292524] block mb-2">
        {t.categoryLabel}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {Object.keys(categoryColors)
          .filter((k) => k !== "ALL")
          .map((key) => {
            const isSelected = selected === key;
            const item = categoryColors[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                style={
                  isSelected
                    ? { backgroundColor: item.bg, color: item.text }
                    : {}
                }
                className="cursor-pointer px-3 py-1.5 text-[13px] font-bold rounded-full bg-[#F2F0EC] text-[#78716C] transition"
              >
                {item.emoji}{" "}
                {t.categories?.[key as keyof typeof t.categories] || item.label}
              </button>
            );
          })}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////

export function DistrictSelector({
  activeTab,
  setActiveTab,
  selectedDistrict,
  onSelectDistrict,
  filteredDistricts,
}: {
  activeTab: "SEOUL" | "GYEONGGI" | "OTHER";
  setActiveTab: (tab: "SEOUL" | "GYEONGGI" | "OTHER") => void;
  selectedDistrict: string;
  onSelectDistrict: (key: string) => void;
  filteredDistricts: {
    key: string;
    label: string;
  }[];
}) {
  const { t } = useCreateGatheringSelectorLanguage();

  return (
    <div>
      <label className=" mt-6 text-[13.5px] font-bold text-[#292524] block mb-2">
        {t.regionLabel}
      </label>
      <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3">
        {(["SEOUL", "GYEONGGI", "OTHER"] as const).map((cityKey) => {
          return (
            <button
              key={cityKey}
              type="button"
              onClick={() => setActiveTab(cityKey)}
              className={`cursor-pointer flex-1 text-sm py-2 text-center rounded-lg font-bold transition ${
                activeTab === cityKey
                  ? "bg-white text-[#FF7A59] shadow-sm"
                  : "text-[#78716C]"
              }`}
            >
              {t.cityTabs[cityKey]}
            </button>
          );
        })}
      </div>

      <span className="text-[12.5px] font-bold text-[#78716C] block mb-2">
        {t.subRegionLabel}
      </span>
      <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
        {filteredDistricts.map((item) => {
          const isSelected = selectedDistrict === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectDistrict(item.key)}
              className={`cursor-pointer text-[12.5px] px-3 py-1.5 rounded-xl font-semibold border transition ${
                isSelected
                  ? "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59] font-black"
                  : "bg-white border-stone-200 text-[#78716C] hover:bg-stone-100"
              }`}
            >
              {t.districts?.[item.key as keyof typeof t.districts] ||
                item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////

export function PlaceSelector({
  hasSelectedCoords,
  onOpenMap,
  gatheringPlace,
  setGatheringPlace,
}: {
  hasSelectedCoords: boolean;
  onOpenMap: () => void;
  gatheringPlace: string;
  setGatheringPlace: (val: string) => void;
}) {
  const { t } = useCreateGatheringSelectorLanguage();

  return (
    <div>
      <label className="text-sm font-bold text-[#292524] block mb-1.5 mt-3">
        {t.placeLabel}
      </label>
      <button
        type="button"
        onClick={onOpenMap}
        className={`cursor-pointer hover:bg-[#FF7A59] hover:text-white w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-bold border transition ${
          hasSelectedCoords
            ? "bg-[#fa937a] border-[#FF7A59] text-white"
            : "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59]"
        }`}
      >
        <Layers className="w-4 h-4" />
        {hasSelectedCoords ? t.locationSetComplete : t.selectLocationOnMap}
      </button>
      <input
        type="text"
        placeholder={t.placePlaceholder}
        value={gatheringPlace}
        onChange={(e) => setGatheringPlace(e.target.value)}
        className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none mt-2 focus:ring-1 focus:ring-[#FF7A59]/95"
      />
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////

export function DaySelector({
  selectedDays,
  onToggleDay,
  dayItems,
}: {
  selectedDays: Day[];
  onToggleDay: (day: Day) => void;
  dayItems: { key: string; label: string }[];
}) {
  const { t } = useCreateGatheringSelectorLanguage();

  return (
    <div>
      <label className="text-sm font-bold text-[#292524] block mb-1.5  mt-9">
        {t.dayLabel}
      </label>
      <div className="gap-1.5 flex justify-around">
        {dayItems.map((day) => {
          const isSel = selectedDays.includes(day.key as Day);
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onToggleDay(day.key as Day)}
              className={`cursor-pointer w-10 h-10 rounded-full text-[13px] font-bold transition ${
                isSel
                  ? "bg-[#FF7A59] text-white"
                  : "bg-[#F2F0EC] text-[#78716C]"
              }`}
            >
              {t.days?.[day.key as keyof typeof t.days] || day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////

export function TimeSelector({
  activeTab,
  setActiveTab,
  selectedTimes,
  onToggleTime,
  filteredTimes,
}: {
  activeTab: "AM" | "PM";
  setActiveTab: (tab: "AM" | "PM") => void;
  selectedTimes: Time[];
  onToggleTime: (time: Time) => void;
  filteredTimes: {
    key: string;
    label: string;
  }[];
}) {
  const { t } = useCreateGatheringSelectorLanguage();

  return (
    <div>
      <label className="text-sm font-bold text-[#292524] block mb-2 mt-8">
        {t.timeLabel}
      </label>
      <div className="flex bg-[#F2F0EC] p-1 rounded-xl mb-3 mt-3">
        {(["AM", "PM"] as const).map((timeType) => (
          <button
            key={timeType}
            type="button"
            onClick={() => setActiveTab(timeType)}
            className={`cursor-pointer flex-1 text-[13.5px] py-1.5 text-center rounded-lg font-bold transition ${
              activeTab === timeType
                ? "bg-white text-[#FF7A59]"
                : "text-[#78716C]"
            }`}
          >
            {timeType === "AM" ? t.am : t.pm}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filteredTimes.map((time) => {
          const isTimeSel = selectedTimes.includes(time.key as Time);
          return (
            <button
              key={time.key}
              type="button"
              onClick={() => onToggleTime(time.key as Time)}
              className={`cursor-pointer py-2 px-1 rounded-xl text-[13px] font-bold transition border text-center ${
                isTimeSel
                  ? "bg-[#FFEBE5] border-[#FF7A59] text-[#FF7A59] font-black shadow-sm"
                  : "bg-white border-stone-200 text-[#78716C] hover:bg-stone-50"
              }`}
            >
              {t.times?.[time.key as keyof typeof t.times] || time.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
