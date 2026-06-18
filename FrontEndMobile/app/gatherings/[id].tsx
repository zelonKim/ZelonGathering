import { client } from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🍑 브랜드 디자인 테마 컬러
const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524",
  textSub: "#78716C",
  border: "#E7E5E4",
};

// 🎨 홈 스크린과 싱크를 완벽하게 맞춘 2026 트렌디 파스텔 컬러 및 이모지 맵
const CATEGORY_MAP: Record<
  string,
  { label: string; emoji: string; bg: string; text: string }
> = {
  STUDY: { label: "스터디", emoji: "📖", bg: "#E0F2FE", text: "#0369A1" }, // 스카이 밀크
  SPORTS: { label: "스포츠", emoji: "⚽️", bg: "#E6F4EA", text: "#137333" }, // 보태니컬 민트
  ART: { label: "아트", emoji: "🎨", bg: "#FAE7F3", text: "#B80066" }, // 뮤트 블러썸
  FOOD: { label: "푸드", emoji: "🍔", bg: "#FEF0E6", text: "#D94E2B" }, // 애프리코트 오렌지
  BOOK: { label: "독서", emoji: "📚", bg: "#F1ECE4", text: "#614E3D" }, // 모던 베이지 체어
  GAME: { label: "게임", emoji: "🎯", bg: "#EDE9FE", text: "#5B21B6" }, // 소프트 네온 바이올렛
  TALK: { label: "토크", emoji: "🎙️", bg: "#F4F4F5", text: "#3F3F46" }, // 미니멀 세이지 그레이
  TOUR: { label: "투어", emoji: "🚠", bg: "#E0F7FA", text: "#006064" }, // 딥 실버 아쿠아
};

const DAY_MAP: Record<string, string> = {
  MON: "월요일",
  TUE: "화요일",
  WED: "수요일",
  THU: "목요일",
  FRI: "금요일",
  SAT: "토요일",
  SUN: "일요일",
};

const TIME_MAP: Record<string, string> = {
  AM_06: "오전 6시",
  AM_07: "오전 7시",
  AM_08: "오전 8시",
  AM_09: "오전 9시",
  AM_10: "오전 10시",
  AM_11: "오전 11시",
  PM_12: "정오 12시",
  PM_01: "오후 1시",
  PM_02: "오후 2시",
  PM_03: "오후 3시",
  PM_04: "오후 4시",
  PM_05: "오후 5시",
  PM_06: "오후 6시",
  PM_07: "오후 7시",
  PM_08: "오후 8시",
  PM_09: "오후 9시",
  PM_10: "오후 10시",
};

export default function GatheringDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id } = useLocalSearchParams<{ id: string }>();

  // 🔄 1. 백엔드 상세 조회 엔드포인트 연동
  const {
    data: gathering,
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery({
    queryKey: ["gatheringDetail", id],
    queryFn: async () => {
      const { data } = await client.get(`/gatherings/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  // 👤 2. 현재 로그인한 내 정보 캐시 조회
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await client.get("/users/me");
      return data;
    },
  });

  // 🚀 3. 참여 신청 뮤테이션
  const joinGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/gatherings/${id}/join`);
      return data;
    },
    onSuccess: (data) => {
      if (data?.message) {
        Alert.alert("알림", data.message);
      }
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "소모임방 참여 처리 중 문제가 발생했습니다.";
      Alert.alert("알림", errorMsg);
    },
  });

  // 🚪 4. 방 나가기 처리 뮤테이션
  const leaveGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.delete(`/gatherings/${id}/leave`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
      router.back();
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "소모임방에서 나가지 못했습니다. 다시 시도해 주세요.";
      Alert.alert("실패", errorMsg);
      router.back();
    },
  });

  const handleJoinPress = () => {
    Alert.alert(
      "소모임 참여 신청",
      "정말로 이 소모임에 참여 신청하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: () => joinGatheringMutation.mutate() },
      ],
    );
  };

  const handleHeaderBack = () => {
    if (!gathering) {
      router.back();
      return;
    }
    const myId = userProfile?.id;
    const isHost = !!myId && gathering.hostId === myId;

    if (isHost) {
      router.back();
      return;
    }

    Alert.alert("소모임 나가기", `정말로 이 소모임에서 나가시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        style: "destructive",
        onPress: () => leaveGatheringMutation.mutate(),
      },
    ]);
  };

  if (isGatheringLoading || isProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>소모임방에 입장하는 중입니다 🍑</Text>
      </View>
    );
  }

  if (isGatheringError || isProfileError || !gathering) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.textSub}
        />
        <Text style={styles.errorText}>소모임을 불러오지 못했습니다.</Text>
      </View>
    );
  }

  const myId = userProfile?.id;
  const isAlreadyParticipant =
    !!myId &&
    gathering.participants?.some(
      (p: any) => p.user?.id === myId || p.userId === myId,
    );
  const isHost = !!myId && gathering.hostId === myId;

  // 💡 백엔드 카테고리 Key값을 활용해 런타임 맵핑 데이터 추출 구조 안전 가드
  const categoryKey = gathering.category?.toUpperCase() || "TALK";
  const catTheme = CATEGORY_MAP[categoryKey] || {
    label: gathering.category,
    emoji: "📍",
    bg: "#F2F0EC",
    text: "#292524",
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          소모임방
        </Text>
        <TouchableOpacity onPress={handleHeaderBack} activeOpacity={0.7}>
          <Ionicons
            name="exit-outline"
            size={24}
            color={COLORS.textMain}
            style={{ marginRight: 3 }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🍑 모임 개요 카드 */}
        <View style={styles.mainCard}>
          <View style={styles.cardTopHeader}>
            {/* 🎨 [수정] 홈 화면 스펙과 일치하는 고유 배경색 및 이모지 라벨 결합 렌더링 슛! */}
            <View
              style={[styles.categoryBadge, { backgroundColor: catTheme.bg }]}
            >
              <Text style={[styles.categoryText, { color: catTheme.text }]}>
                {catTheme.label} {catTheme.emoji}
              </Text>
            </View>

            {/* 동적 참여 제어 단추 */}
            {isHost ? (
              <View style={[styles.joinActionBtn, styles.hostBadge]}>
                <Text style={styles.hostBadgeText}>내가 만든 모임 👑</Text>
              </View>
            ) : isAlreadyParticipant ? (
              <View style={[styles.joinActionBtn, styles.joinCompletedBtn]}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.joinCompletedBtnText}>참여 완료</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.joinActionBtn, styles.joinSubmitBtn]}
                onPress={handleJoinPress}
                disabled={joinGatheringMutation.isPending}
                activeOpacity={0.7}
              >
                {joinGatheringMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={12} color="#FFFFFF" />
                    <Text style={styles.joinSubmitBtnText}>참여 신청하기</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.titleText}>{gathering.title}</Text>

          {/* 모집 정원 대조 인프라 행 */}
          <View style={[styles.metaRow, { marginBottom: 12 }]}>
            <View style={styles.peopleBadge}>
              <Ionicons
                name="people-outline"
                size={12}
                color={COLORS.textSub}
              />
              <Text style={styles.peopleText}>
                모집 현황: {gathering.currentParticipants ?? 1} /{" "}
                {gathering.maxParticipants ?? 4}명
              </Text>
            </View>
          </View>

          {/* 📍 장소 정보 */}
          <View style={styles.metaRow}>
            <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{gathering.gatheringPlace}</Text>
          </View>

          {/* 📅 일정 스펙 한국어 변환 렌더 영역 */}
          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-clear-outline"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.metaText}>
              {gathering.gatheringDay && gathering.gatheringDay.length > 0
                ? gathering.gatheringDay
                    .map((d: string) => DAY_MAP[d] || d)
                    .join(", ")
                : "요일 미정"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="alarm-outline" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>
              {gathering.gatheringTime && gathering.gatheringTime.length > 0
                ? gathering.gatheringTime
                    .map((t: string) => TIME_MAP[t] || t)
                    .join(", ")
                : "시간 미정"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* 📝 모임 상세 설명문 구역 */}
          <Text style={styles.descriptionTitle}>모임 소개</Text>
          <Text style={styles.descriptionText}>
            {gathering.description ||
              "등록된 모임 소개글이 없습니다. 모임장에게 직접 문의해 보세요! "}
          </Text>
        </View>

        {/* 👑 개설자(호스트) 정보 세션 */}
        <Text style={styles.sectionTitle}>모임장</Text>
        <View style={styles.userRow}>
          <View style={styles.avatarContainer}>
            {gathering.host?.profileImg ? (
              <Image
                source={gathering.host.profileImg.trim()}
                style={styles.avatar}
              />
            ) : (
              <Text style={styles.avatarText}>🍑</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.nicknameText}>
              {gathering.host?.nickname || "모임장"}
            </Text>
            <Text style={styles.mannerText}>
              🌡️ 매너 온도 {gathering.host?.mannerTemperature}°C
            </Text>
          </View>
        </View>

        {/* 👥 참여 유저 리스트 세션 */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          참여 중인 인원 ({gathering.participants?.length ?? 0}명)
        </Text>

        {/* 방 나가기 처리 중 인디케이터 싱크 */}
        {leaveGatheringMutation.isPending && (
          <View
            style={[
              styles.userRow,
              { borderColor: "#EF4444", borderStyle: "dashed" },
            ]}
          >
            <ActivityIndicator
              size="small"
              color="#EF4444"
              style={{ marginLeft: 10 }}
            />
            <Text
              style={[
                styles.nicknameText,
                { marginLeft: 12, color: "#EF4444" },
              ]}
            >
              소모임방에서 나가는 중...
            </Text>
          </View>
        )}

        {gathering.participants && gathering.participants.length > 0
          ? gathering.participants.map((p: any, index: number) => (
              <View key={p.user?.id || index} style={styles.userRow}>
                <View style={styles.avatarContainer}>
                  {p.user?.profileImg ? (
                    <Image
                      source={p.user.profileImg.trim()}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.avatarText}>🏃</Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.nicknameText}>
                    {p.user?.nickname || "참여자"}
                  </Text>
                  <Text style={styles.mannerText}>
                    🌡️ 매너 온도 {p.user?.mannerTemperature}°C
                  </Text>
                </View>
              </View>
            ))
          : !leaveGatheringMutation.isPending && (
              <Text style={styles.emptyText}>현재 참여자가 없습니다.</Text>
            )}
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
  errorText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyStyle: "space-between",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    maxWidth: "70%",
  },
  scrollContent: { padding: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 12,
    paddingLeft: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarText: { fontSize: 22 },
  userInfo: { marginLeft: 12, gap: 2 },
  nicknameText: { fontSize: 14, fontWeight: "700", color: COLORS.textMain },
  mannerText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
  },
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  cardTopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  // 💡 인라인 스타일로 테마 컬러를 제어하기 때문에 고정 배색 제거
  categoryBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  categoryText: { fontSize: 12, fontWeight: "800" },
  joinActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  joinSubmitBtn: { backgroundColor: COLORS.primary },
  joinSubmitBtnText: { fontSize: 11, color: "#FFFFFF", fontWeight: "800" },
  joinCompletedBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinCompletedBtnText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "800",
  },
  hostBadge: {
    backgroundColor: "#F5F5F4",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostBadgeText: { fontSize: 11, color: COLORS.textSub, fontWeight: "700" },
  peopleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F5F4",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  peopleText: { fontSize: 12, color: COLORS.textSub, fontWeight: "700" },
  titleText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textMain,
    marginBottom: 14,
    marginTop: 10,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  metaText: { fontSize: 13, color: COLORS.textSub, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F5F5F4", marginVertical: 16 },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: "#44403C",
    fontWeight: "600",
    lineHeight: 22,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F2F0EC",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: { width: 44, height: 44, borderRadius: 14 },
});
