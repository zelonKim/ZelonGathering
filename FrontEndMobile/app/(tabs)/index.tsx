import { client } from "@/api/client";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524",
  textSub: "#78716C",
  border: "#E7E5E4",
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

export default function HomeScreen() {
  // 💡 복수 선택(Multi-select)을 위한 배열 상태 관리 변경!
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["전체"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전체",
  ]);
  const [gatherings, setGatherings] = useState([]);
  const [loading, setLoading] = useState(false);

  const getClientDayEnum = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[new Date().getDay()];
  };

  // 상태 배열이 바뀔 때마다 백엔드로 조합 데이터 Fetch
  useEffect(() => {
    fetchFilteredGatherings();
  }, [selectedTypes, selectedCategories]);

  // 🎛️ 필터 칩 토글 핸들러 함수
  // 🎛️ 상호 배제가 적용된 필터 칩 토글 핸들러 함수
  const toggleFilter = (filter: string, type: "TYPE" | "CAT") => {
    const isType = type === "TYPE";
    const currentList = isType ? selectedTypes : selectedCategories;
    const setList = isType ? setSelectedTypes : setSelectedCategories;

    // 1. [전체] 누르면 초기화
    if (filter === "전체") {
      setList(["전체"]);
      return;
    }

    let newList = currentList.filter((item) => item !== "전체");

    if (newList.includes(filter)) {
      // 이미 선택된 걸 다시 누르면 제거
      newList = newList.filter((item) => item !== filter);
      if (newList.length === 0) newList = ["전체"];
    } else {
      // 💡 [핵심 UX 가드] 유저 편의 필터인 경우 상호 배제 조건 체크
      if (isType) {
        if (filter === "오늘 열리는") {
          // '오늘'을 선택하면 기존 배열에서 '내일'을 싹 도려냅니다.
          newList = newList.filter((item) => item !== "내일 열리는");
        } else if (filter === "내일 열리는") {
          // '내일'을 선택하면 기존 배열에서 '오늘'을 싹 도려냅니다.
          newList = newList.filter((item) => item !== "오늘 열리는");
        }
      }

      newList.push(filter);
    }

    setList(newList);
  };

  const fetchFilteredGatherings = async () => {
    setLoading(true);
    try {
      const mockLocation = { latitude: 37.4787, longitude: 126.9319 };

      const response = await client.get("gatherings", {
        params: {
          types: selectedTypes,
          categories: selectedCategories,
          clientDay: getClientDayEnum(),
          latitude: mockLocation.latitude,
          longitude: mockLocation.longitude,
        },

        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined) {
              searchParams.append(key, value as string);
            }
          });
          return searchParams.toString();
        },
      });
      setGatherings(response.data);
    } catch (error) {
      console.error("소모임 조회 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gathering</Text>
        <Text style={styles.headerSubtitle}>📍 지금 내 주변 소모임</Text>
      </View>

      {/* [1단] 다중 선택 가능한 유저 편의 필터 */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {TYPE_FILTERS.map((filter) => {
            const isActive = selectedTypes.includes(filter);
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => toggleFilter(filter, "TYPE")}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* [2단] 다중 선택 가능한 카테고리 해시태그 필터 */}
      <View
        style={[styles.filterWrapper, { paddingTop: 2, paddingBottom: 12 }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = selectedCategories.includes(filter);
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => toggleFilter(filter, "CAT")}
              >
                <Text
                  style={[styles.catText, isActive && styles.catTextActive]}
                >
                  #{filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {gatherings.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.distanceText}>
                  {item.distanceStr || "위치 확인 중"}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>📍 {item.gatheringPlace}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 3,
  },
  filterWrapper: { height: 44, marginVertical: 2 },
  filterContainer: { paddingHorizontal: 20, alignItems: "center", gap: 6 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { fontSize: 13, color: COLORS.textSub, fontWeight: "600" },
  filterTextActive: { color: COLORS.surface, fontWeight: "700" },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F2F0EC",
  },
  catChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  catText: { fontSize: 12, color: COLORS.textSub, fontWeight: "500" },
  catTextActive: { color: COLORS.primary, fontWeight: "700" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: "#F2F0EC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, color: COLORS.textMain, fontWeight: "600" },
  distanceText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: "auto",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
    lineHeight: 24,
    marginBottom: 10,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 13, color: COLORS.textSub },
});
