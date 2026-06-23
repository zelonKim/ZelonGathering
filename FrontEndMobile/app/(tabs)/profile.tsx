import { client } from "@/api/client";
import { removeAccessToken } from "@/api/token";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Redirect, useRouter } from "expo-router";
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

// 🍑 ZelonGathering 브랜드 컬러 시스템
const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524",
  textSub: "#78716C",
  textOpac: "#8d8d8d9b",
  border: "#E7E5E4",
  mannerHot: "#EF4444",
};

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

const DISTRICT_ITEMS = [
  { key: "SEOUL_GANGNAM", label: "강남구", city: "SEOUL" },
  { key: "SEOUL_GANGBUK", label: "강북구", city: "SEOUL" },
  { key: "SEOUL_GANGDONG", label: "강동구", city: "SEOUL" },
  { key: "SEOUL_GANGSEO", label: "강서구", city: "SEOUL" },
  { key: "SEOUL_GWANAK", label: "관악구", city: "SEOUL" },
  { key: "SEOUL_GWANGJIN", label: "광진구", city: "SEOUL" },
  { key: "SEOUL_GURO", label: "구로구", city: "SEOUL" },
  { key: "SEOUL_GEUMCHEON", label: "금천구", city: "SEOUL" },
  { key: "SEOUL_NOWON", label: "노원구", city: "SEOUL" },
  { key: "SEOUL_DOBONG", label: "도봉구", city: "DOBONG" },
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
  { key: "GYEONGGI_GOYANG", label: "고양시", city: "GYEONGGI" },
  { key: "GYEONGGI_GWACHEON", label: "과천시", city: "GYEONGGI" },
  { key: "GYEONGGI_GWANGMYEONG", label: "광명시", city: "GYEONGGI" },
  { key: "GYEONGGI_GWANGJU", label: "광주시", city: "GYEONGGI" },
  { key: "GYEONGGI_GURI", label: "구리시", city: "GYEONGGI" },
  { key: "GYEONGGI_GUNPO", label: "군포시", city: "GYEONGGI" },
  { key: "GYEONGGI_GIMPO", label: "김포시", city: "GYEONGGI" },
  { key: "GYEONGGI_NAMYANGJU", label: "남양주시", city: "GYEONGGI" },
  { key: "GYEONGGI_DONGDUCHEON", label: "동두천시", city: "GYEONGGI" },
  { key: "GYEONGGI_BUCHEON", label: "부천시", city: "GYEONGGI" },
  { key: "GYEONGGI_SEONGNAM", label: "성남시", city: "GYEONGGI" },
  { key: "GYEONGGI_SUWON", label: "수원시", city: "GYEONGGI" },
  { key: "GYEONGGI_SIHEUNG", label: "시흥시", city: "GYEONGGI" },
  { key: "GYEONGGI_ANSAN", label: "안산시", city: "GYEONGGI" },
  { key: "GYEONGGI_ANSEONG", label: "안성시", city: "GYEONGGI" },
  { key: "GYEONGGI_ANYANG", label: "안양시", city: "GYEONGGI" },
  { key: "GYEONGGI_YANGJU", label: "양주시", city: "GYEONGGI" },
  { key: "GYEONGGI_YANGPYEONG", label: "양평군", city: "GYEONGGI" },
  { key: "GYEONGGI_YEOJU", label: "여주시", city: "GYEONGGI" },
  { key: "GYEONGGI_YEONCHEON", label: "연천군", city: "GYEONGGI" },
  { key: "GYEONGGI_OSAN", label: "오산시", city: "GYEONGGI" },
  { key: "GYEONGGI_YONGIN", label: "용인시", city: "GYEONGGI" },
  { key: "GYEONGGI_UIWANG", label: "의왕시", city: "GYEONGGI" },
  { key: "GYEONGGI_UIJEONGBU", label: "의정부시", city: "GYEONGGI" },
  { key: "GYEONGGI_ICHEON", label: "이천시", city: "GYEONGGI" },
  { key: "GYEONGGI_PAJU", label: "파주시", city: "GYEONGGI" },
  { key: "GYEONGGI_PYEONGTAEK", label: "평택시", city: "GYEONGGI" },
  { key: "GYEONGGI_POCHEON", label: "포천시", city: "GYEONGGI" },
  { key: "GYEONGGI_HANAM", label: "하남시", city: "GYEONGGI" },
  { key: "GYEONGGI_HWASEONG", label: "화성시", city: "GYEONGGI" },
  { key: "GWANGJU", label: "광주광역시", city: "OTHER" },
  { key: "DAEGU", label: "대구광역시", city: "OTHER" },
  { key: "DAEJEON", label: "대전광역시", city: "OTHER" },
  { key: "BUSAN", label: "부산광역시", city: "OTHER" },
  { key: "ULSAN", label: "울산광역시", city: "OTHER" },
  { key: "INCHEON", label: "인천광역시", city: "OTHER" },
  { key: "SEJONG", label: "세종특별자치시", city: "OTHER" },
  { key: "GANGWON", label: "강원특별자치도", city: "OTHER" },
  { key: "JEJU", label: "제주특별자치도", city: "OTHER" },
  { key: "JEONBUK", label: "전북특별자치도", city: "OTHER" },
  { key: "GYEONGBUK", label: "경상북도", city: "OTHER" },
  { key: "GYEONGNAM", label: "경상남도", city: "OTHER" },
  { key: "JEONNAM", label: "전라남도", city: "OTHER" },
  { key: "CHUNGBUK", label: "충청북도", city: "OTHER" },
  { key: "CHUNGNAM", label: "충청남도", city: "OTHER" },
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

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. 프로필 데이터 조회 (GET)
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

  // 2. 프로필 최종 업데이트 (PATCH)
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await client.patch("/users/profile", payload);
      return data;
    },
    onSuccess: () => {
      Alert.alert("성공", "소모임 취향 프로필이 저장되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error: any) => {
      console.error("프로필 수정 오류:", error);
      Alert.alert("실패", "프로필 저장 중 서버 오류가 발생했습니다.");
    },
  });

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

  const [activeCity, setActiveCity] = useState<"SEOUL" | "GYEONGGI" | "OTHER">(
    "SEOUL",
  );
  const [activeTimeType, setActiveTimeType] = useState<"AM" | "PM">("PM");

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

  // 📸 이미지 파일 선택 및 Cloudflare R2 서버 업로드 핸들러
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "권한 거부",
        "PROFILE 사진 등록을 위해 갤러리 접근 권한이 필요합니다.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const localUri = result.assets[0].uri;
    const filename = localUri.split("/").pop() || "profile.jpg";

    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      name: filename,
      type,
    } as any);

    try {
      setIsImageUploading(true);

      // 🔗 백엔드 Cloudflare R2 이미지 업로드 전용 엔드포인트 호출
      const response = await client.post("/users/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 💡 [수정] 고유 타임스탬프 파라미터를 추가하여 모바일 기기의 기존 이미지 캐시 메모리를 무효화(Busting)합니다.
      if (response.data && response.data.imageUrl) {
        setProfileImg(`${response.data.imageUrl}?t=${new Date().getTime()}`);
      } else if (typeof response.data === "string") {
        setProfileImg(`${response.data}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      console.error("클라우드 이미지 업로드 실패:", error);
      Alert.alert("업로드 실패", "이미지를 서버에 업로드하지 못했습니다.");
    } finally {
      setIsImageUploading(false);
    }
  };

  // 💾 프로필 저장 버튼 클릭 이벤트 핸들러
  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      Alert.alert("알림", "닉네임은 필수 항목입니다.");
      return;
    }

    // 💡 쿼리 스트링(?t=...)이 달라붙은 상태로 DB에 저장되면 주소가 지저분해지므로, 순수 URL만 남겨 정제합니다.
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
      profileImg: cleanProfileImg, // 👈 정제된 클린 URL 주소를 백엔드로 전송
    };

    updateProfileMutation.mutate(payload);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        style: "destructive",
        onPress: async () => {
          try {
            await removeAccessToken();
            queryClient.clear();
            router.replace("/login");
          } catch (error) {
            Alert.alert("에러", "로그아웃 처리 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>나의 프로필을 불러오고 있어요 </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.textSub}
        />
        <Text style={styles.errorText}>
          프로필을 불러오지 못했습니다. 다시 시도해 주세요.
          <Redirect href="/(auth)/login" />
        </Text>
      </View>
    );
  }

  const filteredDistricts = DISTRICT_ITEMS.filter(
    (item) => item.city === activeCity,
  );
  const filteredTimes = TIME_ITEMS.filter(
    (item) => item.type === activeTimeType,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.6}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.textSub} />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>✏️ 나의 소모임 취향 프로필</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickImage}
            disabled={isImageUploading}
            activeOpacity={0.6}
          >
            <View style={styles.avatar}>
              {isImageUploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : profileImg ? (
                <Image
                  source={{ uri: profileImg }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>🍑</Text>
              )}
            </View>
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.mannerBadge}>
            <Ionicons
              name="thermometer-outline"
              size={14}
              color={COLORS.mannerHot}
            />
            <Text style={styles.mannerText}>
              매너 온도 {userProfile?.mannerTemperature ?? 36.5}°C
            </Text>
          </View>
        </View>

        {/* 기본 정보 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              style={styles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={COLORS.textOpac}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>나이</Text>
            <TextInput
              style={styles.textInput}
              value={age}
              onChangeText={setAge}
              placeholder="나이를 입력하세요"
              placeholderTextColor={COLORS.textOpac}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>MBTI</Text>
            <TextInput
              style={[styles.textInput]}
              value={mbti}
              onChangeText={setMbti}
              placeholder="mbti를 입력해주세요"
              placeholderTextColor={COLORS.textOpac}
              maxLength={4}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* 취향 키워드 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>나의 취향 키워드</Text>
          <View style={styles.textareaBlock}>
            <Text style={styles.wideInputLabel}>내가 좋아하는 것</Text>
            <TextInput
              style={styles.textareaInput}
              value={favorite}
              onChangeText={setFavorite}
              placeholder="좋아하는 활동이나 관심사를 적어주세요!"
              placeholderTextColor={COLORS.textOpac}
              multiline
            />
          </View>
          <View style={[styles.textareaBlock, { marginTop: 8 }]}>
            <Text style={styles.wideInputLabel}>내가 싫어하는 것</Text>
            <TextInput
              style={styles.textareaInput}
              value={hate}
              onChangeText={setHate}
              placeholder="모임에서 기피하는 상황을 적어주세요!"
              placeholderTextColor={COLORS.textOpac}
              multiline
            />
          </View>
        </View>

        {/* 선호 카테고리 및 지역 설정 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>나의 선호 모임 및 지역</Text>
          <Text style={styles.subLabel}>관심 카테고리</Text>
          <View style={styles.tagContainer}>
            {CATEGORY_ITEMS.map((cat) => {
              const isSelected = preferCategory.includes(cat.key);
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => {
                    if (isSelected) {
                      setPreferCategory(
                        preferCategory.filter((c) => c !== cat.key),
                      );
                    } else {
                      setPreferCategory([...preferCategory, cat.key]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { marginTop: 24 }]}>
            활동 선호 지역
          </Text>
          <View style={styles.cityTabContainer}>
            {(["SEOUL", "GYEONGGI", "OTHER"] as const).map((city) => {
              const tabLabel =
                city === "SEOUL"
                  ? "서울"
                  : city === "GYEONGGI"
                    ? "경기"
                    : "기타 지역";
              const isTabActive = activeCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityTab, isTabActive && styles.cityTabActive]}
                  onPress={() => setActiveCity(city)}
                >
                  <Text
                    style={[
                      styles.cityTabText,
                      isTabActive && styles.cityTabTextActive,
                    ]}
                  >
                    📍 {tabLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.tagContainer}>
            {filteredDistricts.map((item) => {
              const isDistSelected = preferDistrict.includes(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.districtTagBase,
                    isDistSelected && styles.districtTagSelected,
                  ]}
                  onPress={() => {
                    if (isDistSelected) {
                      setPreferDistrict(
                        preferDistrict.filter((d) => d !== item.key),
                      );
                    } else {
                      setPreferDistrict([...preferDistrict, item.key]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.districtTagTextBase,
                      isDistSelected && styles.districtTagTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 선호 일정 설정 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>나의 선호 일정</Text>
          <Text style={styles.subLabel}>선호 요일</Text>
          <View style={[styles.dayTagContainer, { marginBottom: 30 }]}>
            {DAY_ITEMS.map((day) => {
              const isSelected = preferDays.includes(day.key);
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[styles.dayTag, isSelected && styles.dayTagSelected]}
                  onPress={() => {
                    if (isSelected) {
                      setPreferDays(preferDays.filter((d) => d !== day.key));
                    } else {
                      setPreferDays([...preferDays, day.key]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.dayTagText,
                      isSelected && styles.dayTagTextSelected,
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subLabel}>선호 시간대</Text>
          <View style={styles.timeTabContainer}>
            {(["AM", "PM"] as const).map((type) => {
              const isTabActive = activeTimeType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.timeTab, isTabActive && styles.timeTabActive]}
                  onPress={() => setActiveTimeType(type)}
                >
                  <Text
                    style={[
                      styles.timeTabText,
                      isTabActive && styles.timeTabTextActive,
                    ]}
                  >
                    {type === "AM" ? "오전 (AM)" : "오후 (PM)"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.tagContainer}>
            {filteredTimes.map((time) => {
              const isSelected = preferTimes.includes(time.key);
              return (
                <TouchableOpacity
                  key={time.key}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => {
                    if (isSelected) {
                      setPreferTimes(preferTimes.filter((t) => t !== time.key));
                    } else {
                      setPreferTimes([...preferTimes, time.key]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}
                  >
                    {time.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 저장하기 버튼 */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            updateProfileMutation.isPending && { opacity: 0.7 },
          ]}
          onPress={handleSaveProfile}
          disabled={updateProfileMutation.isPending || isImageUploading}
          activeOpacity={0.8}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>프로필 저장하기</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSub,
    marginTop: 8,
  },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F2F0EC",
  },
  logoutText: { fontSize: 12, fontWeight: "700", color: COLORS.textSub },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarWrapper: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarText: { fontSize: 36 },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.textMain,
    width: 26,
    height: 26,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  mannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  mannerText: { fontSize: 12, fontWeight: "700", color: COLORS.mannerHot },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    paddingVertical: 10,
  },
  inputLabel: {
    width: 110,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSub,
  },
  wideInputLabel: {
    width: 150,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSub,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: "600",
    padding: 0,
  },
  textareaBlock: { marginBottom: 14 },
  textareaInput: {
    backgroundColor: "#F8F6F4",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: "500",
    marginTop: 6,
    minHeight: 48,
    textAlignVertical: "top",
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSub,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",

    flexWrap: "wrap",
    width: "100%",
    gap: 11,
  },
  dayTagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "#F2F0EC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    borderRadius: 12,
  },
  tagSelected: { backgroundColor: COLORS.primary },
  tagText: { fontSize: 12, color: COLORS.textSub, fontWeight: "600" },
  tagTextSelected: { color: "#FFFFFF" },
  dayTag: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F0EC",
    justifyContent: "center",
    alignItems: "center",
  },
  dayTagSelected: { backgroundColor: COLORS.primary },
  dayTagText: { fontSize: 13, color: COLORS.textSub, fontWeight: "700" },
  dayTagTextSelected: { color: "#FFFFFF" },
  cityTabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F0EC",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  cityTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  cityTabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cityTabText: { fontSize: 13, color: COLORS.textSub, fontWeight: "600" },
  cityTabTextActive: { color: COLORS.primary, fontWeight: "800" },
  timeTabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F0EC",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  timeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 10,
  },
  timeTabActive: { backgroundColor: COLORS.surface },
  timeTabText: { fontSize: 12, color: COLORS.textSub, fontWeight: "600" },
  timeTabTextActive: { color: COLORS.primary, fontWeight: "800" },
  districtTagBase: {
    backgroundColor: "#F2F0EC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  districtTagSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  districtTagTextBase: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "600",
  },
  districtTagTextSelected: { color: COLORS.primary, fontWeight: "700" },
  saveButton: {
    backgroundColor: COLORS.textMain,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  saveButtonText: { fontSize: 15, color: "#FFFFFF", fontWeight: "700" },
});
