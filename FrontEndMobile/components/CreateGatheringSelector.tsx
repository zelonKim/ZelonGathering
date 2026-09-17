import { Day } from "@/types/Day";
import { Time } from "@/types/Time";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function CategorySelector({
  selected,
  onSelect,
  categoryColors,
}: {
  selected: any;
  onSelect: (key: any) => void;
  categoryColors: Record<
    string,
    { bg: string; text: string; emoji: string; label: string }
  >;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>카테고리 선택</Text>
      <View style={styles.chipWrapper}>
        {Object.keys(categoryColors)
          .filter((k) => k !== "ALL")
          .map((key) => {
            const isSelected = selected === key;
            const item = categoryColors[key];
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => onSelect(key)}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: item.bg }
                    : styles.categoryChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected
                      ? { color: item.text, fontWeight: "800" }
                      : { color: "#78716C" },
                  ]}
                >
                  {item.emoji} {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
}

///////////////////////////////////////////////////////////////

export function DistrictSelector({
  activeTab,
  setActiveTab,
  selectedDistrict,
  onSelectDistrict,
  filteredDistricts,
}: {
  activeTab: "SEOUL" | "GYEONGGI" | "OTHER";
  setActiveTab: (tab: "SEOUL" | "GYEONGGI" | "OTHER") => void;
  selectedDistrict: string | null;
  onSelectDistrict: (key: any) => void;
  filteredDistricts: {
    key: string;
    label: string;
  }[];
}) {
  return (
    <View style={[styles.container, { marginTop: 12 }]}>
      <Text style={styles.label}>모임 지역 선택</Text>

      <View style={styles.tabContainer}>
        {(["SEOUL", "GYEONGGI", "OTHER"] as const).map((cityKey) => {
          const tabLabel =
            cityKey === "SEOUL"
              ? "서울"
              : cityKey === "GYEONGGI"
                ? "경기"
                : "기타 광역시/도";
          const isActive = activeTab === cityKey;
          return (
            <TouchableOpacity
              key={cityKey}
              activeOpacity={0.8}
              onPress={() => setActiveTab(cityKey)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isActive && styles.tabButtonTextActive,
                ]}
              >
                {tabLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subLabel}>세부 지역 선택</Text>

      <View style={styles.districtBox}>
        <ScrollView
          nestedScrollEnabled
          style={{ maxHeight: 150 }}
          contentContainerStyle={styles.chipWrapper}
          showsVerticalScrollIndicator={false}
        >
          {filteredDistricts.map((item) => {
            const isSelected = selectedDistrict === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                onPress={() => onSelectDistrict(item.key)}
                style={[
                  styles.districtChip,
                  isSelected
                    ? styles.districtChipSelected
                    : styles.districtChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.districtChipText,
                    isSelected && styles.districtChipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

///////////////////////////////////////////////////////////////

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
  return (
    <View style={[styles.container, { marginTop: 12 }]}>
      <Text style={styles.label}>모임 장소 지정</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenMap}
        style={[
          styles.mapButton,
          hasSelectedCoords
            ? styles.mapButtonCompleted
            : styles.mapButtonDefault,
        ]}
      >
        <Feather
          name="layers"
          size={16}
          color={hasSelectedCoords ? "#FFFFFF" : "#FF7A59"}
        />
        <Text
          style={[
            styles.mapButtonText,
            hasSelectedCoords ? { color: "#FFFFFF" } : { color: "#FF7A59" },
          ]}
        >
          {hasSelectedCoords
            ? "위치 지정 완료 (다시 선택)"
            : "지도에서 모임 장소 찍기 📍"}
        </Text>
      </TouchableOpacity>

      <TextInput
        placeholder="상세 장소명을 입력해주세요"
        placeholderTextColor="#A8A29E"
        value={gatheringPlace}
        onChangeText={setGatheringPlace}
        style={styles.textInput}
      />
    </View>
  );
}

///////////////////////////////////////////////////////////////

export function DaySelector({
  selectedDays,
  onToggleDay,
  dayItems,
}: {
  selectedDays: Day[];
  onToggleDay: (day: Day) => void;
  dayItems: { key: string; label: string }[];
}) {
  return (
    <View style={[styles.container, { marginTop: 16 }]}>
      <Text style={styles.label}>모임 요일 (중복 가능)</Text>
      <View style={styles.dayRow}>
        {dayItems.map((day) => {
          const isSel = selectedDays.includes(day.key as Day);
          return (
            <TouchableOpacity
              key={day.key}
              activeOpacity={0.8}
              onPress={() => onToggleDay(day.key as Day)}
              style={[
                styles.dayButton,
                isSel ? styles.dayButtonSelected : styles.dayButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  isSel && styles.dayButtonTextSelected,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

///////////////////////////////////////////////////////////////

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
  return (
    <View style={[styles.container, { marginTop: 12 }]}>
      <Text style={styles.label}>모임 시간대 (중복 가능)</Text>

      <View style={styles.tabContainer}>
        {(["AM", "PM"] as const).map((timeType) => {
          const isActive = activeTab === timeType;
          return (
            <TouchableOpacity
              key={timeType}
              activeOpacity={0.8}
              onPress={() => setActiveTab(timeType)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isActive && styles.tabButtonTextActive,
                ]}
              >
                {timeType === "AM" ? "오전 (AM)" : "오후 (PM)"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.timeGrid}>
        {filteredTimes.map((time) => {
          const isTimeSel = selectedTimes.includes(time.key as Time);
          return (
            <TouchableOpacity
              key={time.key}
              activeOpacity={0.8}
              onPress={() => onToggleTime(time.key as Time)}
              style={[
                styles.timeChip,
                isTimeSel ? styles.timeChipSelected : styles.timeChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.timeChipText,
                  isTimeSel && styles.timeChipTextSelected,
                ]}
              >
                {time.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

///////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#292524",
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#78716C",
    marginTop: 4,
    marginBottom: 4,
  },
  chipWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  // Category Styles
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipInactive: {
    backgroundColor: "#F2F0EC",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F0EC",
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#78716C",
  },
  tabButtonTextActive: {
    color: "#FF7A59",
  },
  // District Styles
  districtBox: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "rgba(250, 250, 249, 0.5)",
    padding: 8,
  },
  districtChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  districtChipSelected: {
    backgroundColor: "#FFEBE5",
    borderColor: "#FF7A59",
  },
  districtChipInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
  },
  districtChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#78716C",
  },
  districtChipTextSelected: {
    color: "#FF7A59",
    fontWeight: "800",
  },
  // Place Styles
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapButtonDefault: {
    backgroundColor: "#FFEBE5",
    borderColor: "#FF7A59",
  },
  mapButtonCompleted: {
    backgroundColor: "#FA937A",
    borderColor: "#FF7A59",
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    marginTop: 6,
  },
  // Day Styles
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonSelected: {
    backgroundColor: "#FF7A59",
  },
  dayButtonInactive: {
    backgroundColor: "#F2F0EC",
  },
  dayButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#78716C",
  },
  dayButtonTextSelected: {
    color: "#FFFFFF",
  },
  // Time Styles
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    width: "31%",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  timeChipSelected: {
    backgroundColor: "#FFEBE5",
    borderColor: "#FF7A59",
  },
  timeChipInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78716C",
  },
  timeChipTextSelected: {
    color: "#FF7A59",
    fontWeight: "800",
  },
});
