import { client } from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"; // 🌟 지도 핵심 컴포넌트 추가

const COLORS = {
  primary: "#FF7A59", // 메인 피치 코랄
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524ed",
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

const CATEGORY_MAP: Record<
  string,
  { label: string; emoji: string; bg: string; text: string }
> = {
  ALL: {
    label: "전체",
    emoji: "✨",
    bg: COLORS.primaryLight,
    text: COLORS.primary,
  },
  STUDY: { label: "스터디", emoji: "📖", bg: "#E0F2FE", text: "#0369A1" },
  SPORTS: { label: "스포츠", emoji: "⚽️", bg: "#E6F4EA", text: "#137333" },
  ART: { label: "아트", emoji: "🎨", bg: "#FAE7F3", text: "#B80066" },
  FOOD: { label: "푸드", emoji: "🍔", bg: "#FEF0E6", text: "#D94E2B" },
  BOOK: { label: "독서", emoji: "📚", bg: "#F1ECE4", text: "#614E3D" },
  GAME: { label: "게임", emoji: "🎯", bg: "#EDE9FE", text: "#5B21B6" },
  TALK: { label: "토크", emoji: "🎙️", bg: "#F4F4F5", text: "#3F3F46" },
  TOUR: { label: "투어", emoji: "🚠", bg: "#E0F7FA", text: "#006064" },
};

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
  { key: "AM_06", label: "오전 6시" },
  { key: "AM_07", label: "오전 7시" },
  { key: "AM_08", label: "오전 8시" },
  { key: "AM_09", label: "오전 9시" },
  { key: "AM_10", label: "오전 10시" },
  { key: "AM_11", label: "오전 11시" },
  { key: "PM_12", label: "오후 12시" },
  { key: "PM_01", label: "오후 1시" },
  { key: "PM_02", label: "오후 2시" },
  { key: "PM_03", label: "오후 3시" },
  { key: "PM_04", label: "오후 4시" },
  { key: "PM_05", label: "오후 5시" },
  { key: "PM_06", label: "오후 6시" },
  { key: "PM_07", label: "오후 7시" },
  { key: "PM_08", label: "오후 8시" },
  { key: "PM_09", label: "오후 9시" },
  { key: "PM_10", label: "오후 10시" },
];

const REGION_DATA: Record<string, { key: string; label: string }[]> = {
  SEOUL: [
    { key: "SEOUL_GANGNAM", label: "강남구" },
    { key: "SEOUL_GANGDONG", label: "강동구" },
    { key: "SEOUL_GANGBUK", label: "강북구" },
    { key: "SEOUL_GANGSEO", label: "강서구" },
    { key: "SEOUL_GWANAK", label: "관악구" },
    { key: "SEOUL_GWANGJIN", label: "광진구" },
    { key: "SEOUL_GURO", label: "구로구" },
    { key: "SEOUL_GEUMCHEON", label: "금천구" },
    { key: "SEOUL_NOWON", label: "노원구" },
    { key: "SEOUL_DOBONG", label: "도봉구" },
    { key: "SEOUL_DONGDAEMUN", label: "동대문구" },
    { key: "SEOUL_DONGJAK", label: "동작구" },
    { key: "SEOUL_MAPO", label: "마포구" },
    { key: "SEOUL_SEODAEMUN", label: "서대문구" },
    { key: "SEOUL_SEOCHO", label: "서초구" },
    { key: "SEOUL_SEONGDONG", label: "성동구" },
    { key: "SEOUL_SEONGBUK", label: "성북구" },
    { key: "SEOUL_SONGPA", label: "송파구" },
    { key: "SEOUL_YANGCHEON", label: "양천구" },
    { key: "SEOUL_YEONGDEUNGPO", label: "영등포구" },
    { key: "SEOUL_YONGSAN", label: "용산구" },
    { key: "SEOUL_EUNPYEONG", label: "은평구" },
    { key: "SEOUL_JONGNO", label: "종로구" },
    { key: "SEOUL_JUNGGU", label: "중구" },
    { key: "SEOUL_JUNGNANG", label: "중랑구" },
  ],
  GYEONGGI: [
    { key: "GYEONGGI_SUWON", label: "수원시" },
    { key: "GYEONGGI_SEONGNAM", label: "성남시" },
    { key: "GYEONGGI_GOYANG", label: "고양시" },
    { key: "GYEONGGI_YONGIN", label: "용인시" },
    { key: "GYEONGGI_BUCHEON", label: "부천시" },
    { key: "GYEONGGI_ANSAN", label: "안산시" },
    { key: "GYEONGGI_ANYANG", label: "안양시" },
    { key: "GYEONGGI_NAMYANGJU", label: "남양주시" },
    { key: "GYEONGGI_HWASEONG", label: "화성시" },
    { key: "GYEONGGI_PYEONGTAEK", label: "평택시" },
    { key: "GYEONGGI_UIJEONGBU", label: "의정부시" },
    { key: "GYEONGGI_SIHEUNG", label: "시흥시" },
    { key: "GYEONGGI_PAJU", label: "파주시" },
    { key: "GYEONGGI_GWANGMYEONG", label: "광명시" },
    { key: "GYEONGGI_GIMPO", label: "김포시" },
    { key: "GYEONGGI_GUNPO", label: "군포시" },
    { key: "GYEONGGI_GWANGJU", label: "광주시" },
    { key: "GYEONGGI_ICHEON", label: "이천시" },
    { key: "GYEONGGI_YANGJU", label: "양주시" },
    { key: "GYEONGGI_ANSEONG", label: "안성시" },
    { key: "GYEONGGI_GURI", label: "구리시" },
    { key: "GYEONGGI_UIWANG", label: "의왕시" },
    { key: "GYEONGGI_POCHEON", label: "포천시" },
    { key: "GYEONGGI_HANAM", label: "하남시" },
    { key: "GYEONGGI_OSAN", label: "오산시" },
    { key: "GYEONGGI_YEOJU", label: "여주시" },
    { key: "GYEONGGI_DONGDUCHEON", label: "동두천시" },
    { key: "GYEONGGI_GWACHEON", label: "과천시" },
    { key: "GYEONGGI_YANGPYEONG", label: "양평군" },
    { key: "GYEONGGI_GAPYEONG", label: "가평군" },
    { key: "GYEONGGI_YEONCHEON", label: "연천군" },
  ],
  ETC: [
    { key: "INCHEON", label: "인천광역시" },
    { key: "DAEJEON", label: "대전광역시" },
    { key: "DAEGU", label: "대구광역시" },
    { key: "GWANGJU", label: "광주광역시" },
    { key: "BUSAN", label: "부산광역시" },
    { key: "ULSAN", label: "울산광역시" },
    { key: "SEJONG", label: "세종특별자치시" },
    { key: "GANGWON", label: "강원특별자치도" },
    { key: "CHUNGBUK", label: "충청북도" },
    { key: "CHUNGNAM", label: "충청남도" },
    { key: "JEONBUK", label: "전북특별자치도" },
    { key: "JEONNAM", label: "전라남도" },
    { key: "GYEONGBUK", label: "경상북도" },
    { key: "GYEONGNAM", label: "경상남도" },
    { key: "JEJU", label: "제주특별자치도" },
  ],
};

const GET_KEY_BY_LABEL = (label: string): string => {
  if (label === "전체") return "ALL";
  const match = Object.entries(CATEGORY_MAP).find(
    ([_, v]) => v.label === label,
  );
  return match ? match[0] : "TALK";
};

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["전체"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전체",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  // 내 기기 GPS 위치 보관
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 37.5665,
    longitude: 126.978,
  });
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // 🌟 [추가] 모임 장소 결정을 위한 지도 전용 상태 관리 인프라
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedPlaceCoords, setSelectedPlaceCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    async function getUserLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "알림",
            "위치 권한을 거부하시면 주변 소모임 정렬이 원활하지 않을 수 있습니다 😢",
          );
          setIsLocationLoading(false);
          return;
        }
        const currentUserLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: currentUserLocation.coords.latitude,
          longitude: currentUserLocation.coords.longitude,
        });
      } catch (error) {
        console.error("위치 추적 예외 발생:", error);
      } finally {
        setIsLocationLoading(false);
      }
    }
    getUserLocation();
  }, []);

  const getClientDayEnum = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[new Date().getDay()];
  };

  // 🔄 소모임 리스트 가져오기 (배열 직렬화 파라미터 가드 빌드업 완료)
  const { data: gatherings = [], isLoading: isGatheringsLoading } = useQuery({
    queryKey: ["gatherings", selectedTypes, selectedCategories, location],
    queryFn: async () => {
      const response = await client.get("gatherings", {
        params: {
          types: selectedTypes,
          categories: selectedCategories, // 백엔드가 수용하는 순수 한글 배열
          clientDay: getClientDayEnum(),
          latitude: location.latitude,
          longitude: location.longitude,
        },
        // 🌟 [핵심 추가] 배열 파라미터가 주소창에서 깨지지 않도록 백엔드 맞춤 규격 직렬화를 수행합니다.
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // 💡 ["스터디", "스포츠"] -> categories=스터디&categories=스포츠 형태로 정밀 가공
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

  const createGatheringMutation = useMutation({
    mutationFn: async (newGathering: any) => {
      const { data } = await client.post("/gatherings", newGathering);
      return data;
    },
    onSuccess: () => {
      Alert.alert("성공", "새로운 소모임이 성공적으로 개설되었습니다! ");
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["aiMatchingNotifications"],
        });
      }, 3000);
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.message || "소모임 생성에 실패했습니다.";
      Alert.alert("실패", Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
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
    setSelectedPlaceCoords(null); // 🌟 좌표 리셋
  };

  const handleCreateSubmit = () => {
    const parsedMax = parseInt(maxParticipants, 10);

    if (isNaN(parsedMax) || parsedMax < 2 || parsedMax > 12) {
      Alert.alert(
        "알림",
        "최대 정원은 최소 2명에서 최대 12명까지만 가능합니다! 🍑",
      );
      return;
    }

    if (
      !title ||
      !description ||
      !gatheringPlace ||
      !maxParticipants ||
      gatheringDay.length === 0 ||
      gatheringTime.length === 0
    ) {
      Alert.alert("알림", "모든 항목을 입력 및 선택해 주세요!");
      return;
    }

    const payload = {
      title,
      description,
      category,
      maxParticipants: parseInt(maxParticipants, 10),
      gatheringPlace,
      latitude: selectedPlaceCoords?.latitude || location.latitude,
      longitude: selectedPlaceCoords?.longitude || location.longitude,
      district,
      gatheringDay,
      gatheringTime,
    };

    createGatheringMutation.mutate(payload);
  };

  // 🌟 [지도 클릭/롱 프레스 이벤트] 맵 터치 시 해당 위경도 자동 포착 캡처
  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedPlaceCoords(coords);

    // 역지오코딩(Reverse Geocoding)으로 터치한 곳의 텍스트 주소 자동 파싱 슛!
    try {
      const addressResult = await Location.reverseGeocodeAsync(coords);
      if (addressResult && addressResult.length > 0) {
        const addr = addressResult[0];
        const placeName =
          `${addr.city || ""} ${addr.district || ""} ${addr.street || ""} ${addr.streetNumber || ""}`.trim();
        setGatheringPlace(placeName || "선택한 장소");
      }
    } catch (err) {
      console.log("주소 자동 변환 실패:", err);
    }
  };

  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
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

  const handleDropdownItemPress = (gatheringId: string) => {
    setIsDropdownOpen(false);
    router.push(`/gatherings/${gatheringId}`);
  };

  const isCombinedLoading = isGatheringsLoading || isLocationLoading;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Gathering</Text>
            <Text style={styles.headerSubtitle}>📍 지금 내 주변 소모임</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.myGatheringBtn,
              isDropdownOpen && styles.myGatheringBtnActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* <Ionicons
              name={isDropdownOpen ? "apps" : "apps-outline"}
              size={22}
              color={isDropdownOpen ? "#FFFFFF" : COLORS.primary}
            /> */}
            <Text>🍑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 내가 참여 중인 소모임 드롭다운 */}
      {isDropdownOpen && (
        <View style={styles.dropdownOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
            <View style={styles.dropdownBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.primary}
                style={{ marginRight: 3 }}
              />
              <Text style={styles.dropdownHeaderText}>
                내가 참여 중인 소모임
              </Text>
            </View>
            <ScrollView
              style={{ maxHeight: 220 }}
              showsVerticalScrollIndicator={false}
            >
              {myJoinedGatherings.map((g: any, idx: number) => (
                <TouchableOpacity
                  key={g.id || idx}
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownItemPress(g.id)}
                >
                  <View style={styles.dropdownItemDot} />
                  <Text style={styles.dropdownItemText} numberOfLines={1}>
                    {g.title}
                  </Text>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={14}
                    color={COLORS.textSub}
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 상단 1, 2단 다중 필터Wrapper 생략 */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {TYPE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedTypes.includes(filter) && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter(filter, "TYPE")}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedTypes.includes(filter) && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
            const catKey = GET_KEY_BY_LABEL(filter);
            const activeTheme = CATEGORY_MAP[catKey] || {
              bg: COLORS.primaryLight,
              text: COLORS.primary,
            };
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.catChip,
                  isActive && {
                    backgroundColor: activeTheme.bg,
                    borderColor: activeTheme.bg,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => toggleFilter(filter, "CAT")}
              >
                <Text
                  style={[
                    styles.catText,
                    isActive && { color: activeTheme.text, fontWeight: "800" },
                  ]}
                >
                  # {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 리스트 피드 */}
      {isCombinedLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {gatherings.map((item: any) => {
            const categoryKey = item.category?.toUpperCase() || "TALK";
            const catTheme = CATEGORY_MAP[categoryKey] || {
              label: item.category,
              emoji: "📍",
              bg: "#F2F0EC",
              text: "#292524",
            };
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.6}
                onPress={() => router.push(`/gatherings/${item.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.categoryTag,
                      { backgroundColor: catTheme.bg },
                    ]}
                  >
                    <Text
                      style={[styles.categoryText, { color: catTheme.text }]}
                    >
                      {catTheme.emoji} {catTheme.label}
                    </Text>
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
            );
          })}
          {gatherings.length === 0 && (
            <Text style={styles.dropdownEmptyText}>
              주변에 열린 소모임이 없습니다.
            </Text>
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* ➕ 플로팅 개설 버튼 */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.8}
        onPress={() => setIsCreateModalOpen(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 🔮 개설 모달 창 세션 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새로운 소모임 만들기 🍑</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalForm}
            >
              {/* 카테고리, 제목 등 기존 입력란 동일 유지 */}
              <Text style={styles.inputLabel}>카테고리 선택</Text>
              <View style={styles.gridRow}>
                {Object.keys(CATEGORY_MAP)
                  .filter((k) => k !== "ALL")
                  .map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.selectorChip,
                        category === key && {
                          backgroundColor: CATEGORY_MAP[key].bg,
                        },
                      ]}
                      onPress={() => setCategory(key)}
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          category === key && {
                            color: CATEGORY_MAP[key].text,
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {CATEGORY_MAP[key].emoji} {CATEGORY_MAP[key].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              <Text style={styles.inputLabel}>모임 제목</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 한강 러닝 모임"
                placeholderTextColor="#A8A29E"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>모임 설명</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="모임의 상세 소개글을 작성해 주세요."
                placeholderTextColor="#A8A29E"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.inputLabel}>모임 지역 (대분류)</Text>
              <View style={styles.gridRow}>
                {(
                  Object.keys(REGION_DATA) as Array<
                    "SEOUL" | "GYEONGGI" | "ETC"
                  >
                ).map((region) => {
                  const labelMap = {
                    SEOUL: "서울",
                    GYEONGGI: "경기",
                    ETC: "기타지역",
                  };
                  return (
                    <TouchableOpacity
                      key={region}
                      style={[
                        styles.selectorChip,
                        macroRegion === region && styles.selectorChipActiveBig,
                      ]}
                      onPress={() => {
                        setMacroRegion(region);
                        setDistrict(REGION_DATA[region][0].key);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          macroRegion === region &&
                            styles.selectorTextActiveBig,
                        ]}
                      >
                        {labelMap[region]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>모임 지역 (소분류)</Text>
              <View style={styles.gridRow}>
                {REGION_DATA[macroRegion].map((subItem) => (
                  <TouchableOpacity
                    key={subItem.key}
                    style={[
                      styles.selectorChip,
                      district === subItem.key && styles.selectorChipActive,
                    ]}
                    onPress={() => setDistrict(subItem.key)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        district === subItem.key && styles.selectorTextActive,
                      ]}
                    >
                      {subItem.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 🌟 [수정 세션]: 지도 위치 선택 버튼 및 텍스트 자동 동기화 란 */}
              <Text style={styles.inputLabel}>모임 장소 (위치)</Text>
              {Platform.OS === "android" && (
                <TouchableOpacity
                  style={[
                    styles.mapSelectBtn,
                    selectedPlaceCoords && styles.mapSelectBtnActive,
                  ]}
                  onPress={() => setIsMapModalOpen(true)}
                >
                  <Ionicons
                    name="map-outline"
                    size={16}
                    color={selectedPlaceCoords ? "#FFFFFF" : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.mapSelectBtnText,
                      selectedPlaceCoords && { color: "#FFFFFF" },
                    ]}
                  >
                    {selectedPlaceCoords
                      ? "📍 위치 지정 완료 (다시 선택)"
                      : "지도에서 모임 장소 찍기 🗺️"}
                  </Text>
                </TouchableOpacity>
              )}
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="상세 주소 및 모임 장소명을 입력해주세요 (지도 선택 시 자동 입력)"
                placeholderTextColor="#A8A29E"
                value={gatheringPlace}
                onChangeText={setGatheringPlace}
              />

              {/* 요일, 시간대 옵션 동일 유지 */}
              <Text style={styles.inputLabel}>모임 요일 (복수 선택 가능)</Text>
              <View style={styles.gridRow}>
                {DAY_OPTIONS.map((day) => {
                  const isSel = gatheringDay.includes(day.key);
                  return (
                    <TouchableOpacity
                      key={day.key}
                      style={[
                        styles.selectorChip,
                        isSel && styles.selectorChipActiveBig,
                      ]}
                      onPress={() =>
                        toggleArrayItem(gatheringDay, setGatheringDay, day.key)
                      }
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          isSel && styles.selectorTextActiveBig,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>
                모임 시간대 (복수 선택 가능)
              </Text>
              <View style={styles.gridRow}>
                {TIME_OPTIONS.map((time) => {
                  const isSel = gatheringTime.includes(time.key);
                  return (
                    <TouchableOpacity
                      key={time.key}
                      style={[
                        styles.selectorChip,
                        isSel && styles.selectorChipActive,
                      ]}
                      onPress={() =>
                        toggleArrayItem(
                          gatheringTime,
                          setGatheringTime,
                          time.key,
                        ) - 20
                      }
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          isSel && styles.selectorChipActiveText,
                        ]}
                      >
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>모임 정원 (명)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="최소 2명 ~ 최대 12명"
                placeholderTextColor="#A8A29E"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={handleCreateSubmit}
                disabled={createGatheringMutation.isPending}
              >
                {createGatheringMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>소모임방 개설하기 🚀</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🌟 [추가]: 지도에서 핀 찍는 풀스크린 서브 모달 인프라 공정 */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={isMapModalOpen}
        onRequestClose={() => setIsMapModalOpen(false)}
      >
        <View style={styles.mapModalContainer}>
          <MapView
            style={styles.mapView}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.009,
              longitudeDelta: 0.009,
            }}
            onPress={handleMapPress}
          >
            {/* 고른 좌표가 있을 때 지도 상에 마커 핀 생성 */}
            {selectedPlaceCoords && (
              <Marker
                coordinate={selectedPlaceCoords}
                title="모임 예정 장소"
                description={gatheringPlace}
              />
            )}
          </MapView>

          {/* 하단 안내 가이드 레이블 독 */}
          <View style={styles.mapFloatingCard}>
            <Text style={styles.mapGuideText}>
              🎯 모임 장소로 지정할 곳을 터치해 주세요!
            </Text>
            {gatheringPlace ? (
              <Text style={styles.mapAddressText} numberOfLines={1}>
                📍 주소: {gatheringPlace}
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.mapConfirmBtn}
              onPress={() => setIsMapModalOpen(false)}
            >
              <Text style={styles.mapConfirmBtnText}>
                이 위치로 장소 결정하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 8 },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  myGatheringBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 122, 89, 0.2)",
  },
  myGatheringBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.15)" },
  dropdownCard: {
    position: "absolute",
    top: 72,
    right: 20,
    width: 290,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    paddingRight: 15,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  dropdownHeaderText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
  },
  dropdownItemDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
    marginRight: 9,
    marginLeft: 5,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMain,
    maxWidth: "90%",
  },
  dropdownEmptyText: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: "center",
    paddingVertical: 200,
    fontWeight: "500",
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
    borderWidth: 1,
    borderColor: "#F2F0EC",
  },
  catText: { fontSize: 12, color: COLORS.textSub, fontWeight: "600" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: "auto",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    lineHeight: 24,
    marginBottom: 9,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 12, color: COLORS.textSub },
  categoryTag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10.5, fontWeight: "700" },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 90,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 0 : 48,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "85%",
    width: "100%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 19, fontWeight: "800", color: COLORS.textMain },
  modalForm: {
    paddingBottom: 30,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 14,
    marginBottom: 6,
    paddingLeft: 2,
  },
  input: {
    backgroundColor: "#F5F5F4",
    padding: 14,
    borderRadius: 14,
    fontSize: Platform.OS === "ios" ? 14 : 13,
    color: COLORS.textMain,
    fontWeight: "600",
    lineHeight: 21,
  },
  textArea: { height: 90, textAlignVertical: "top" },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 4,
  },
  selectorChip: {
    paddingHorizontal: Platform.OS == "ios" ? 13 : 12,
    paddingVertical: Platform.OS == "ios" ? 12 : 8,
    borderRadius: 50,
    marginRight: 2,
    backgroundColor: "#F2F0EC",
    borderWidth: 1,
    borderColor: "#F2F0EC",
  },
  selectorChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  selectorChipActiveBig: { backgroundColor: COLORS.primary, color: "white" },
  selectorText: { fontSize: 12, color: COLORS.textSub, fontWeight: "600" },
  selectorTextActive: { color: COLORS.primary, fontWeight: "800" },
  selectorTextActiveBig: { color: "white", fontWeight: "800" },
  selectorChipActiveText: { color: COLORS.primary, fontWeight: "800" },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitBtnText: { fontSize: 15, color: "#FFFFFF", fontWeight: "800" },

  // 🌟 [추가 스타일]: 지도 선택 단추 및 맵 모달 아키텍처 스타일 라인업
  mapSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: "center",
  },
  mapSelectBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mapSelectBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: "700" },
  mapModalContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  mapView: { flex: 1, width: "100%", height: "100%" },
  mapFloatingCard: {
    position: "absolute",
    bottom: 65,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  mapGuideText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 6,
  },
  mapAddressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  mapConfirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  mapConfirmBtnText: { fontSize: 14, color: "#FFFFFF", fontWeight: "800" },
});
