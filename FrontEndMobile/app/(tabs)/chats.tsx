import { client } from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🍑 ZelonGathering 일관된 감성 배색 세트
const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524",
  textSub: "#78716C",
  border: "#E7E5E4",
};

// 🎨 카테고리별 아바타 테마 색상 및 이모지 맵 (공통 스펙 싱크)
const CATEGORY_MAP: Record<string, { bg: string; icon: string }> = {
  STUDY: { bg: "#E0F2FE", icon: "📖" },
  SPORTS: { bg: "#E6F4EA", icon: "⚽️" },
  ART: { bg: "#FAE7F3", icon: "🎨" },
  FOOD: { bg: "#FEF0E6", icon: "🍔" },
  BOOK: { bg: "#F1ECE4", icon: "📚" },
  GAME: { bg: "#EDE9FE", icon: "🎯" },
  TALK: { bg: "#F4F4F5", icon: "🎙️" },
  TOUR: { bg: "#E0F7FA", icon: "🚠" },
};

export default function ChatsScreen() {
  const router = useRouter();

  // 🔄 1. 내가 속한 소모임 채팅방 목록 API Fetch
  // (백엔드에서 참여 중인 모임의 최신 메시지, 안 읽은 개수, 스펙을 맵핑해서 준다고 가정합니다.)
  const {
    data: chatRooms = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["myChats"],
    queryFn: async () => {
      const { data } = await client.get("/users/chats");
      return data;
    },
    refetchInterval: 5000, // 실시간 메시지 요약을 위한 폴링 주기 설정
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>채팅방 목록을 불러오는 중입니다</Text>
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
        <Text style={styles.errorText}>채팅 목록을 가져오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. 상단 타이틀 바 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatting</Text>
        <Text style={styles.headerSubtitle}>💬 나의 실시간 채팅방</Text>
      </View>

      {/* 2. 실시간 소모임 채팅 리스트 피드 */}
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // 카테고리에 맞는 아바타 테마 추출 (기본값 TALK)
          const categoryKey = item.category?.toUpperCase() || "TALK";
          const theme = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.TALK;

          return (
            <TouchableOpacity
              style={styles.chatCard}
              activeOpacity={0.8}
              // 🚀 카드를 누르면 해당 소모임 상세 화면의 [실시간 채팅방] 탭으로 다이렉트 랜딩되도록 설계할 수 있습니다.
              onPress={() =>
                router.push({
                  pathname: `/gatherings/${item.id}`,
                  params: { tab: "CHAT" },
                })
              }
            >
              {/* 왼쪽: 모달 카테고리 기반 힙한 그래픽 아바타 */}
              <View
                style={[styles.avatarContainer, { backgroundColor: theme.bg }]}
              >
                {/* <Ionicons
                  name={theme.icon as any}
                  size={22}
                  color={COLORS.textMain}
                /> */}
                <Text style={{ fontSize: Platform.OS === "ios" ? 20 : 15 }}>
                  {theme.icon}
                </Text>
              </View>

              {/* 가운데: 소모임 타이틀 & 최신 대화 요약 */}
              <View style={styles.chatInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.roomTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {/* 백엔드에서 최신 메시지 시간(lastMessageAt)을 줄 경우 표시 */}
                  <Text style={styles.timeText}>
                    {item.lastMessageTime || ""}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.roomMessage,
                    item.unreadCount > 0 && styles.roomMessageUnread,
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage ||
                    "아직 주고받은 대화가 없습니다. 첫 인사를 건네보세요!"}
                </Text>
              </View>

              {/* 오른쪽: 안 읽은 알림 카운트 배지 (데이터가 존재할 때만 노출) */}
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            현재 참여 중인 소모임 채팅방이 없습니다.{"\n"}마음에 드는 소모임에
            가입해 보세요! 🏃
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  chatCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    maxWidth: "75%",
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "500",
  },
  roomMessage: {
    fontSize: 13,
    color: COLORS.textSub,
    lineHeight: 18,
  },
  roomMessageUnread: {
    color: COLORS.textMain,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSub,
    textAlign: "center",
    marginTop: 80,
    fontWeight: "500",
    lineHeight: 22,
  },
});
