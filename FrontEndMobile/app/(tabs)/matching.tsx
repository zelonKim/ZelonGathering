import { client } from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "expo-router";
import React from "react";
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
  aiPurple: "#F43F5E",
  aiPurpleLight: "#FFEBEB",
};

export default function MatchingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 🔄 1. 백엔드에서 AI 매칭 알림 리스트 Fetch
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["aiMatchingNotifications"],
    queryFn: async () => {
      const { data } = await client.get("/users/notifications");
      return data.filter((item: any) => item.type === "AI_MATCHING");
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  // 🗑️ 2. 특정 알림 삭제를 위한 useMutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await client.delete(`/users/notifications/${notificationId}`);
    },
    onSuccess: () => {
      // 삭제 완료 후 실시간 리스트 갱신
      queryClient.invalidateQueries({ queryKey: ["aiMatchingNotifications"] });
    },
    onError: (error) => {
      console.error("알림 삭제 실패:", error);
      alert("알림을 넘기지 못했습니다. 다시 시도해주세요.");
    },
  });

  // 🌟 현재 로딩 스피너를 보여줄 타겟 아이템 ID 추출
  const deletingId = deleteNotificationMutation.isPending
    ? deleteNotificationMutation.variables
    : null;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          AI 매칭 알림을 가져오고 있습니다.
        </Text>
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
        <Text style={styles.errorText}>매칭 데이터를 불러오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. 상단 타이틀 바 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>AI Matching</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          🤖 AI가 찾아낸 취향 저격 소모임
        </Text>
      </View>

      {/* 2. 실시간 피드 리스트 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item: any) => {
          // 🌟 현재 아이템이 지워지는 중인지 검사
          const isCurrentItemDeleting = deletingId === item.id;

          return (
            <View key={item.id} style={styles.matchCard}>
              {/* 카드 상단: AI 매칭률 */}
              <View style={styles.cardHeader}>
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={12} color={COLORS.aiPurple} />
                  <Text style={styles.aiBadgeText}>
                    매칭률 {item.matchRate}%
                  </Text>
                </View>
                <Text style={styles.timeText}>
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </Text>
              </View>

              {/* 카드 본문: 실제 백엔드 소모임 타이틀 매핑 */}
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>

              {/* AI가 추천한 이유 구역 */}
              <View style={styles.aiReasonBox}>
                <Text style={styles.aiReasonText}>
                  <Text style={styles.aiReasonHighlight}>AI의 한마디: </Text>
                  {item.message}
                </Text>
              </View>

              {/* 하단 액션 버튼 */}
              <View style={styles.actionRow}>
       
                <TouchableOpacity
                  style={[
                    styles.passButton,
                    isCurrentItemDeleting && { opacity: 0.6 },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => deleteNotificationMutation.mutate(item.id)}
                  disabled={deleteNotificationMutation.isPending}
                >
                  {isCurrentItemDeleting ? (
                    <ActivityIndicator size="small" color={COLORS.textSub} />
                  ) : (
                    <Text style={styles.passButtonText}>넘기기</Text>
                  )}
                </TouchableOpacity>

                {/* 🚀 참석하기 클릭 시 소모임방 상세로 이동 */}
                <TouchableOpacity
                  style={styles.joinButton}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/gatherings/${item.linkId}`)}
                  disabled={deleteNotificationMutation.isPending}
                >
                  <Text style={styles.joinButtonText}>참여하러 가기</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        {notifications.length === 0 && (
          <Text style={styles.emptyText}>
            아직 들어온 매칭 알림이 없습니다.
          </Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.aiPurpleLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: { fontSize: 11, color: COLORS.aiPurple, fontWeight: "700" },
  timeText: { fontSize: 12, color: COLORS.textSub, fontWeight: "500" },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
    lineHeight: 24,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSub,
    fontWeight: "500",
    marginBottom: 14,
  },
  aiReasonBox: {
    backgroundColor: "#F8F6F4",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  aiReasonText: { fontSize: 13, color: COLORS.textMain, lineHeight: 19 },
  aiReasonHighlight: { color: COLORS.aiPurple, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 10 },
  passButton: {
    flex: 1,
    backgroundColor: "#F2F0EC",
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  passButtonText: { fontSize: 14, color: COLORS.textSub, fontWeight: "600" },
  joinButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonText: { fontSize: 14, color: "#FFFFFF", fontWeight: "700" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
  errorText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: "center",
    marginTop: 40,
    fontWeight: "500",
  },
});
