import { CreateGatheringModal } from "@/components/CreateGatheringModal";
import { MapSelectionModal } from "@/components/MapSelectionModal";
import { CATEGORY_FILTERS } from "@/constants/categoryFilters";
import { DAY_ITEMS } from "@/constants/dayItems";
import { DEFAULT_COORDS } from "@/constants/defaultCoords";
import { DISTRICT_ITEMS } from "@/constants/districtItems";
import { GATHERING_CATEGORY_COLOR } from "@/constants/gatheringCategoryColor";
import { TIME_ITEMS } from "@/constants/timeItems";
import { TYPE_FILTERS } from "@/constants/typeFilters";
import { useCreateGathering } from "@/hooks/useCreateGathering";
import { Category } from "@/types/Category";
import { Coords } from "@/types/Coords";
import { Day } from "@/types/Day";
import { District } from "@/types/District";
import { GatheringWithDistance } from "@/types/Gathering";
import {
  JoinedGatheringItem,
  JoinGatheringInfo,
} from "@/types/JoinedGatheringItem";
import { Time } from "@/types/Time";
import { getClientDayEnum } from "@/utils/getClientDayEnum";
import { GET_KEY_BY_LABEL } from "@/utils/getKeyByLabel";
import { toggleArrayItem } from "@/utils/toggleArrayItem";
import { toggleFilter } from "@/utils/toggleFilter";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getGatherings } from "../api/gathering/getGatherings";
import { getMyProfile } from "../api/profile/getMyProfile";

export default function HomePage() {
  const navigation = useNavigation<any>();

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
  const [location, setLocation] = useState<Coords>(DEFAULT_COORDS);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedPlaceCoords, setSelectedPlaceCoords] = useState<Coords | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("위치 권한이 거부되었습니다.");
          setIsLocationLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error("위치 추적 에러 발생:", error);
      } finally {
        setIsLocationLoading(false);
      }
    })();
  }, []);

  ////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////

  const { data: userProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
    refetchInterval: 5000,
  });

  const myJoinedGatherings =
    userProfile?.joinedGatherings?.map(
      (jg: JoinedGatheringItem) => jg.gathering,
    ) || [];

  ////////////////////////////////////////////////////////////////////////////

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
      Alert.alert(
        "알림",
        "최대 정원은 최소 2명에서 최대 12명까지만 가능합니다!",
      );
      return;
    }
    if (!selectedPlaceCoords) {
      Alert.alert("알림", "지도에서 모임 장소 위치를 지정해 주세요!");
      return;
    }

    if (
      !title ||
      !description ||
      !gatheringPlace ||
      gatheringDay.length === 0 ||
      gatheringTime.length === 0
    ) {
      Alert.alert("알림", "모든 항목을 입력 및 선택해 주세요!");
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

  ////////////////////////////////////////////////////////////////////////////

  const renderGatheringItem = ({ item }: { item: GatheringWithDistance }) => {
    const catTheme = GATHERING_CATEGORY_COLOR[
      item.category?.toUpperCase() || "TALK"
    ] || {
      label: item.category,
      emoji: "📍",
      bg: "#F2F0EC",
      text: "#292524",
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("GatheringDetail", { id: item.id })}
        style={styles.card}
      >
        <View>
          <View style={styles.cardHeader}>
            <View
              style={[styles.categoryBadge, { backgroundColor: catTheme.bg }]}
            >
              <Text style={[styles.categoryText, { color: catTheme.text }]}>
                {catTheme.emoji} {catTheme.label}
              </Text>
            </View>
            <Text style={styles.distanceText}>
              {item.distanceStr || "위치 확인 중"}
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {item.gatheringPlace}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  ////////////////////////////////////////////////////////////////////////////

  const filteredDistricts = DISTRICT_ITEMS.filter(
    (d) => d.city === activeDistrictTab,
  );

  const filteredTimes = TIME_ITEMS.filter((t) => t.type === activeTimeTab);

  ////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />

      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>Gathering</Text>
          <Text style={styles.subLogoText}>📍 지금 내 주변 소모임</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.profileButton,
            isDropdownOpen && styles.profileButtonActive,
          ]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={{ fontSize: 19 }}>🍑</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Feather name="check-circle" size={16} color="#FF7A59" />
              <Text style={styles.dropdownTitle}>내가 참여 중인 소모임</Text>
            </View>
            <ScrollView style={{ maxHeight: 250 }}>
              {myJoinedGatherings.map((jg: JoinGatheringInfo, idx: number) => (
                <TouchableOpacity
                  key={jg.id || idx}
                  onPress={() => {
                    setIsDropdownOpen(false);
                    navigation.navigate("GatheringDetail", { id: jg.id });
                  }}
                  style={styles.dropdownItem}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View style={styles.dot} />
                    <Text style={styles.dropdownItemTitle} numberOfLines={1}>
                      {jg.title}
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={16} color="#A8A29E" />
                </TouchableOpacity>
              ))}
              {myJoinedGatherings.length === 0 && (
                <Text style={styles.emptyText}>참여 중인 모임이 없습니다.</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {TYPE_FILTERS.map((filter) => {
            const isSelected = selectedTypes.includes(filter);
            return (
              <TouchableOpacity
                key={filter}
                onPress={() =>
                  toggleFilter(
                    filter,
                    "TYPE",
                    selectedTypes,
                    setSelectedTypes,
                    selectedCategories,
                    setSelectedCategories,
                  )
                }
                style={[styles.typeChip, isSelected && styles.typeChipSelected]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    isSelected && styles.typeChipTextSelected,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = selectedCategories.includes(filter);
            const catTheme = GATHERING_CATEGORY_COLOR[
              GET_KEY_BY_LABEL(filter)
            ] || {
              bg: "#FFEBE5",
              text: "#FF7A59",
            };
            return (
              <TouchableOpacity
                key={filter}
                onPress={() =>
                  toggleFilter(
                    filter,
                    "CATE",
                    selectedTypes,
                    setSelectedTypes,
                    selectedCategories,
                    setSelectedCategories,
                  )
                }
                style={[
                  styles.categoryChip,
                  isActive
                    ? {
                        backgroundColor: catTheme.bg,
                        borderColor: catTheme.bg,
                      }
                    : styles.categoryChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive
                      ? { color: catTheme.text, fontWeight: "800" }
                      : { color: "#78716C" },
                  ]}
                >
                  # {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isCombinedLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          data={gatherings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGatheringItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              주변에 열린 소모임방이 존재하지 않습니다
            </Text>
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsCreateModalOpen(true)}
        style={styles.fab}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

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
    </SafeAreaView>
  );
}

////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBF9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FF7A59",
    letterSpacing: -0.5,
  },
  subLogoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#292524",
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFEBE5",
    borderWidth: 1,
    borderColor: "rgba(255, 122, 89, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileButtonActive: {
    backgroundColor: "#FF7A59",
    borderColor: "#FF7A59",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 20,
  },
  dropdownContainer: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    paddingBottom: 8,
    marginBottom: 8,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF7A59",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  dropdownItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "85%",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF7A59",
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    color: "#A8A29E",
    paddingVertical: 16,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  filterRow: {
    flexDirection: "row",
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: "#FF7A59",
    borderColor: "#FF7A59",
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78716C",
  },
  typeChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipInactive: {
    backgroundColor: "#F2F0EC",
    borderColor: "#F2F0EC",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7A59",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1917",
    lineHeight: 22,
  },
  cardFooter: {
    marginTop: 12,
  },
  locationText: {
    fontSize: 13,
    color: "#78716C",
  },
  emptyListText: {
    textAlign: "center",
    fontSize: 14,
    color: "#78716C",
    fontWeight: "600",
    marginTop: 80,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF7A59",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
