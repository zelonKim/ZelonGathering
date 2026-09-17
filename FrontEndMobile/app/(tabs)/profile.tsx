import { getMyProfile } from "@/app/api/profile/getMyProfile";
import { removeAccessToken } from "@/app/api/token";
import { CATEGORY_ITEMS } from "@/constants/categoryItems";
import { DAY_ITEMS } from "@/constants/dayItems";
import { DISTRICT_ITEMS } from "@/constants/districtItems";
import { TIME_ITEMS } from "@/constants/timeItems";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadProfileImage } from "@/hooks/useUploadImage";
import { Category } from "@/types/Category";
import { Day } from "@/types/Day";
import { District } from "@/types/District";
import { Mbti } from "@/types/MBTI";
import { Time } from "@/types/Time";
import { UpdateProfilePayload } from "@/types/UpdateProfilePayload";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  if (isGetProfileLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </View>
    );
  }

  if (isGetProfileError) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={40} color="#A8A29E" />
        <Text style={styles.errorText}>
          프로필을 불러오지 못했습니다. 다시 시도해 주세요.
        </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.loginLinkText}>로그인 화면으로 이동</Text>
        </TouchableOpacity>
      </View>
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////

  const { mutate: updateProfileMutation, isPending: isUpdateProfilePending } =
    useUpdateProfile();

  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      Alert.alert("알림", "닉네임을 입력해주세요.");
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

  ///////////////////////////////////////////////////////////////////////////////////

  const { mutate: uploadImageMutation, isPending: isUploadImagePending } =
    useUploadProfileImage();

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "권한 필요",
        "사진을 선택하려면 앨범 접근 권한이 필요합니다.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      const fileData = {
        uri: asset.uri,
        name: asset.fileName || "profile.jpg",
        type: asset.mimeType || "image/jpeg",
      } as unknown as File;

      uploadImageMutation(fileData, {
        onSuccess: (imageUrl) => {
          const imageUrlWithCacheBust = `${imageUrl}?t=${Date.now()}`;
          setProfileImg(imageUrlWithCacheBust);
        },
      });
    }
  };

  const handleRemoveImage = () => {
    setProfileImg("");
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const handleLogoutClick = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await removeAccessToken();
            queryClient.clear();
            router.replace("/login");
          } catch (err) {
            console.log(err);
            Alert.alert("오류", "로그아웃 처리 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const filteredDistricts = DISTRICT_ITEMS.filter(
    (item) => item.city === activeCity,
  );

  const filteredTimes = TIME_ITEMS.filter(
    (item) => item.type === activeTimeType,
  );

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>
              ✏️ 나의 소모임 취향 프로필
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogoutClick}
            style={styles.logoutButton}
          >
            <Feather name="log-out" size={14} color="#78716C" />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardCenter}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickImage}
              style={styles.avatarButton}
            >
              {isUploadImagePending ? (
                <ActivityIndicator size="small" color="#FF7A59" />
              ) : profileImg ? (
                <Image
                  source={{ uri: profileImg }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={{ fontSize: 36 }}>🍑</Text>
              )}
            </TouchableOpacity>

            {!profileImg ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickImage}
                style={styles.cameraBadge}
              >
                <Feather name="camera" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRemoveImage}
                style={styles.removeBadge}
              >
                <Feather name="x" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.mannerBadge}>
            <FontAwesome5 name="thermometer-half" size={14} color="#F97316" />
            <Text style={styles.mannerText}>
              매너 온도 {profileData?.mannerTemperature ?? 36.5}°C
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>기본 정보</Text>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#D6D3D1"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>나이</Text>
            <TextInput
              value={age}
              onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
              placeholder="나이를 입력하세요"
              placeholderTextColor="#D6D3D1"
              keyboardType="number-pad"
              maxLength={2}
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>MBTI</Text>
            <TextInput
              value={mbti}
              onChangeText={setMbti}
              placeholder="MBTI를 입력하세요"
              placeholderTextColor="#D6D3D1"
              autoCapitalize="characters"
              maxLength={4}
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>나의 취향 키워드</Text>

          <View style={styles.textAreaGroup}>
            <Text style={styles.subLabel}>내가 좋아하는 것</Text>
            <TextInput
              value={favorite}
              onChangeText={setFavorite}
              placeholder="자신이 좋아하는 것을 입력하세요."
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />
          </View>

          <View style={styles.textAreaGroup}>
            <Text style={styles.subLabel}>내가 싫어하는 것</Text>
            <TextInput
              value={hate}
              onChangeText={setHate}
              placeholder="자신이 싫어하는 것을 입력하세요."
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>나의 선호 모임 및 지역</Text>

          <View>
            <Text style={styles.subLabel}>관심 카테고리</Text>
            <View style={styles.chipContainer}>
              {CATEGORY_ITEMS.map((cat) => {
                const isSelected = preferCategory.includes(cat.key as Category);
                return (
                  <TouchableOpacity
                    key={cat.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setPreferCategory(
                        isSelected
                          ? preferCategory.filter((c) => c !== cat.key)
                          : [...preferCategory, cat.key],
                      )
                    }
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.subLabel}>활동 선호 지역</Text>

            <View style={styles.toggleContainer}>
              {(["SEOUL", "GYEONGGI", "OTHER"] as const).map((city) => {
                const label =
                  city === "SEOUL"
                    ? "서울"
                    : city === "GYEONGGI"
                      ? "경기"
                      : "기타 지역";
                const isActive = activeCity === city;
                return (
                  <TouchableOpacity
                    key={city}
                    activeOpacity={0.8}
                    onPress={() => setActiveCity(city)}
                    style={[
                      styles.toggleButton,
                      isActive && styles.toggleButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isActive && styles.toggleTextActive,
                      ]}
                    >
                      📍 {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView
              style={styles.districtScroll}
              contentContainerStyle={styles.chipContainer}
              nestedScrollEnabled
            >
              {filteredDistricts.map((item) => {
                const isDistSelected = preferDistrict.includes(
                  item.key as District,
                );
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setPreferDistrict(
                        isDistSelected
                          ? preferDistrict.filter((d) => d !== item.key)
                          : [...preferDistrict, item.key],
                      )
                    }
                    style={[
                      styles.chip,
                      isDistSelected
                        ? styles.districtChipSelected
                        : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isDistSelected
                          ? styles.districtChipTextSelected
                          : styles.chipTextUnselected,
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>나의 선호 일정</Text>

          <View>
            <Text style={styles.subLabel}>선호 요일</Text>
            <View style={styles.dayContainer}>
              {DAY_ITEMS.map((day) => {
                const isSelected = preferDay.includes(day.key as Day);
                return (
                  <TouchableOpacity
                    key={day.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setPreferDay(
                        isSelected
                          ? preferDay.filter((d) => d !== day.key)
                          : [...preferDay, day.key],
                      )
                    }
                    style={[
                      styles.dayCircle,
                      isSelected
                        ? styles.dayCircleSelected
                        : styles.dayCircleUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.subLabel}>선호 시간대</Text>
            <View style={styles.toggleContainer}>
              {(["AM", "PM"] as const).map((type) => {
                const isActive = activeTimeType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.8}
                    onPress={() => setActiveTimeType(type)}
                    style={[
                      styles.toggleButton,
                      isActive && styles.toggleButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isActive && styles.toggleTextActive,
                      ]}
                    >
                      {type === "AM" ? "오전 (AM)" : "오후 (PM)"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.chipContainer}>
              {filteredTimes.map((time) => {
                const isSelected = preferTime.includes(time.key as Time);
                return (
                  <TouchableOpacity
                    key={time.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setPreferTime(
                        isSelected
                          ? preferTime.filter((t) => t !== time.key)
                          : [...preferTime, time.key],
                      )
                    }
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected,
                      ]}
                    >
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSaveProfile}
          disabled={isUpdateProfilePending || isUploadImagePending}
          style={[
            styles.saveButton,
            (isUpdateProfilePending || isUploadImagePending) && styles.disabled,
          ]}
        >
          {isUpdateProfilePending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>프로필 저장하기</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBF9",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFBF9",
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
    textAlign: "center",
  },
  loginLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7A59",
    textDecorationLine: "underline",
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF7A59",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#292524",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F2F0EC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78716C",
  },
  cardCenter: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    gap: 14,
  },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
  },
  avatarButton: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#FFEBE5",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#292524",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  removeBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#6B7280",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  mannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  mannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F97316",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#292524",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    paddingBottom: 10,
    marginLeft: 4,
  },
  inputLabel: {
    width: 96,
    fontSize: 14,
    fontWeight: "700",
    color: "#78716C",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    padding: 0,
  },
  textAreaGroup: {
    gap: 6,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78716C",
    marginLeft: 4,
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: "#F8F6F4",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#292524",
    textAlignVertical: "top",
    minHeight: 60,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: "#FF7A59",
  },
  chipUnselected: {
    backgroundColor: "#F2F0EC",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  chipTextUnselected: {
    color: "#78716C",
  },
  districtChipSelected: {
    backgroundColor: "#FFEBE5",
    borderWidth: 1,
    borderColor: "#FF7A59",
  },
  districtChipTextSelected: {
    color: "#FF7A59",
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F0EC",
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  toggleText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#78716C",
  },
  toggleTextActive: {
    color: "#FF7A59",
  },
  districtScroll: {
    maxHeight: 160,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#F5F5F4",
    borderRadius: 12,
    padding: 8,
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: "#FF7A59",
  },
  dayCircleUnselected: {
    backgroundColor: "#F2F0EC",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#292524",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.7,
  },
});
