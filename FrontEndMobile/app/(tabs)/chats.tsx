import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🍑 ZelonGathering 일관된 감성 배색 세트
const COLORS = {
  primary: "#FF7A59", // 메인 피치 코랄
  primaryLight: "#FFEBE5", // 안 읽은 배지 배경
  background: "#FBFBF9", // 감성 웜 화이트 배경
  surface: "#FFFFFF", // 채팅방 카드 화이트
  textMain: "#292524", // 딥 차콜 먹색
  textSub: "#78716C", // 부가 메시지 그레이
  border: "#E7E5E4", // 부드러운 테두리
  accent: "#F43F5E", // 강렬한 알림 핑크레드
};

// 💬 1:1 프라이빗 메시지와 그룹 모임 메시지가 섞인 트렌디 더미 데이터
const MOCK_CHATS = [
  {
    id: "1",
    title: "Django 백엔드 정예 크루 🚀",
    lastMessage: "이번 주 홍대 모임 조용한 방으로 예약 완료했습니다!",
    time: "오후 2:30",
    unreadCount: 2,
    isPrivate: false, // 그룹 모임 채팅
    avatarBg: "#FEF3C7", // 앰버 골드 톤 프사 배경
    iconName: "code-slash",
  },
  {
    id: "2",
    title: "민지 (AI 에이전트 빌더) 🤖",
    lastMessage: "성진님! FastAPI 서버 매칭 파이프라인 연동 성공하셨나요?",
    time: "오후 1:15",
    unreadCount: 1,
    isPrivate: true, // 👥 1:1 privateChat 메시지!
    avatarBg: "#E0F2FE", // 시안 블루 톤 프사 배경
    iconName: "person",
  },
  {
    id: "3",
    title: "홍대 네온 볼링 소모임 🎳",
    lastMessage: "다들 고생하셨습니다! 다음 주에 또 봬요 ㅎㅎ",
    time: "어제",
    unreadCount: 0,
    isPrivate: false,
    avatarBg: "#FCE7F3", // 핑크 톤 프사 배경
    iconName: "trophy",
  },
];

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      {/* 1. 상단 타이틀 바 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatting</Text>
        <Text style={styles.headerSubtitle}>💬 실시간 프라이빗 채팅</Text>
      </View>

      {/* 2. 트렌디한 채팅 목록 피드 */}
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard} activeOpacity={0.8}>
            {/* 왼쪽: 힙한 그래픽 아바타 영역 */}
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: item.avatarBg },
              ]}
            >
              <Ionicons
                name={item.iconName as any}
                size={22}
                color={COLORS.textMain}
              />

              {/* 1:1 privateChat인 경우 얹어주는 미니 인디케이터 배지 */}
              {item.isPrivate && (
                <View style={styles.privateBadge}>
                  <Ionicons name="lock-closed" size={8} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* 가운데: 채팅방 타이틀 & 대화 요약 */}
            <View style={styles.chatInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.roomTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <Text
                style={[
                  styles.roomMessage,
                  item.unreadCount > 0 && styles.roomMessageUnread,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* 오른쪽: 안 읽은 알림 카운트 배지 */}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primary, // 피치 코랄 아이덴티티 유지
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
  // 💬 기존의 밋밋한 보더 라인 대신 둥글고 트렌디한 카드 레이아웃 도입
  chatCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    // 은은한 섀도우 효과로 카드 띄우기
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 18, // 완전 동그라미보다 살짝 각진 스퀘어 서클이 요즘 대세!
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  // 🔒 1:1 프라이빗 챗 표시 배지
  privateBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
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
  // 안 읽은 메시지가 있을 땐 텍스트를 조금 더 진하게 포커싱
  roomMessageUnread: {
    color: COLORS.textMain,
    fontWeight: "600",
  },
  // 🔴 피치 코랄 감성의 트렌디 둥근 알림 배지
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
});
